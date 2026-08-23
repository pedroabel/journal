/* ---------------------------------------------------------------------------
   sync.js — sincronização entre dispositivos, com os dados cifrados no cliente

   Como funciona, em uma passada:
     senha ──PBKDF2(600k)──> master ──HKDF──> token de autenticação (vai ao servidor)
                                   └────────> chave AES-GCM      (nunca sai daqui)

   O servidor guarda um blob opaco e um número de versão. Quem tem a URL não tem
   nada: sem o token, 401. Quem tivesse o banco também não teria nada: sem a
   chave, o blob é ruído. A senha em si não é guardada em lugar nenhum — só as
   chaves derivadas, no IndexedDB, e a de cifragem como CryptoKey não-extraível
   (o JS usa, mas não consegue ler os bytes dela).

   Conflitos: cada gravação carrega a versão lida. Se o servidor estiver à
   frente, ele responde 409 com o estado atual, e a fusão é feita aqui — chave a
   chave, vencendo a alteração mais recente (o mapa `state.t` guarda quando cada
   chave mudou). Marcar hábito no celular e fechar checklist no notebook ao
   mesmo tempo preserva os dois.

   Configuração: preencha SYNC_URL depois de publicar o Worker (worker/README
   explica). Com SYNC_URL vazio o site funciona exatamente como antes, só local.
   --------------------------------------------------------------------------- */

var SYNC_URL = ''; // ex.: 'https://journal-sync.seu-usuario.workers.dev'

/* Separador de caminho no mapa de timestamps. Fora do alfabeto dos dados
   (é um caractere de controle), então nunca colide com uma chave real. */
var STATE_SEP = '\u001f';

var Sync = (function () {
  var KDF_SALT = 'sistema-unificado/kdf/v1'; // salt fixo: não é segredo, só evita tabelas prontas
  var KDF_ITER = 600000;
  var IDB_NAME = 'sistema-unificado-sync';
  var IDB_STORE = 'keys';

  var keys = null;      // {token, key} depois de destravado
  var version = 0;      // versão que este dispositivo leu por último
  var getState, applyState, status;
  var pushTimer = null, busy = false, pending = false;

  /* --- derivação de chaves ------------------------------------------------ */

  async function deriveKeys(pass) {
    var enc = new TextEncoder();
    var base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
    var bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(KDF_SALT), iterations: KDF_ITER, hash: 'SHA-256' },
      base, 256
    );
    var master = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveBits', 'deriveKey']);
    var tokenBits = await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: enc.encode('sistema-unificado/auth/v1') },
      master, 256
    );
    var key = await crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: enc.encode('sistema-unificado/enc/v1') },
      master, { name: 'AES-GCM', length: 256 },
      false, // não-extraível: nem um XSS consegue exportar a chave
      ['encrypt', 'decrypt']
    );
    return { token: hex(tokenBits), key: key };
  }

  function hex(buf) {
    return [].map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function b64(buf) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
  }
  function unb64(s) {
    return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); });
  }

  async function seal(obj) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv }, keys.key, new TextEncoder().encode(JSON.stringify(obj))
    );
    return { iv: b64(iv), ct: b64(ct) };
  }

  async function unseal(ivB64, ctB64) {
    var plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: unb64(ivB64) }, keys.key, unb64(ctB64)
    );
    return JSON.parse(new TextDecoder().decode(plain));
  }

  /* Só falha quando o blob do servidor foi cifrado com OUTRA senha (troca de
     senha). Não apaga nada: avisa e devolve null, e o estado local continua
     valendo — a próxima alteração regrava o servidor com a senha nova. */
  async function unsealSafe(ivB64, ctB64) {
    try { return await unseal(ivB64, ctB64); }
    catch (e) { status('dados do servidor cifrados com outra senha'); return null; }
  }

  /* --- guarda das chaves no dispositivo ----------------------------------- */

  function idb() {
    return new Promise(function (res, rej) {
      var req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(IDB_STORE); };
      req.onsuccess = function () { res(req.result); };
      req.onerror = function () { rej(req.error); };
    });
  }

  function idbOp(mode, fn) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(IDB_STORE, mode);
        var req = fn(tx.objectStore(IDB_STORE));
        tx.oncomplete = function () { db.close(); res(req && req.result); };
        tx.onerror = function () { db.close(); rej(tx.error); };
      });
    });
  }

  function saveKeys(k) { return idbOp('readwrite', function (s) { return s.put(k, 'v1'); }); }
  function loadKeys() { return idbOp('readonly', function (s) { return s.get('v1'); }).catch(function () { return null; }); }
  function dropKeys() { return idbOp('readwrite', function (s) { return s.delete('v1'); }).catch(function () {}); }

  /* --- transporte --------------------------------------------------------- */

  // Devolve {status, body} ou null quando a rede falhou (offline).
  async function api(method, body) {
    try {
      var res = await fetch(SYNC_URL + '/state', {
        method: method,
        headers: Object.assign(
          { Authorization: 'Bearer ' + keys.token },
          body ? { 'Content-Type': 'application/json' } : {}
        ),
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store',
      });
      var parsed = null;
      try { parsed = await res.json(); } catch (e) { parsed = null; }
      return { status: res.status, body: parsed };
    } catch (e) {
      return null;
    }
  }

  /* --- fusão chave a chave ------------------------------------------------ */

  var ONE = ['tracks', 'checks', 'ms', 'reduced'];   // grupo/chave
  var TWO = ['day', 'monthly'];                      // grupo/data/chave

  function flatten(s) {
    var out = {}, g, k, a, b;
    for (var i = 0; i < ONE.length; i++) {
      g = ONE[i];
      for (k in (s[g] || {})) out[g + STATE_SEP + k] = s[g][k];
    }
    for (var j = 0; j < TWO.length; j++) {
      g = TWO[j];
      for (a in (s[g] || {})) for (b in s[g][a]) out[g + STATE_SEP + a + STATE_SEP + b] = s[g][a][b];
    }
    return out;
  }

  function unflatten(map) {
    var s = { day: {}, tracks: {}, checks: {}, ms: {}, reduced: {}, monthly: {} };
    for (var p in map) {
      var parts = p.split(STATE_SEP), g = parts[0];
      if (!s[g]) continue;
      if (parts.length === 3) {
        if (!s[g][parts[1]]) s[g][parts[1]] = {};
        s[g][parts[1]][parts[2]] = map[p];
      } else {
        s[g][parts[1]] = map[p];
      }
    }
    return s;
  }

  function merge(local, remote) {
    var lv = flatten(local), rv = flatten(remote);
    var lt = local.t || {}, rt = remote.t || {};
    var paths = {}, p;
    for (p in lv) paths[p] = 1;
    for (p in rv) paths[p] = 1;
    for (p in lt) paths[p] = 1;
    for (p in rt) paths[p] = 1;

    var vals = {}, ts = {};
    for (p in paths) {
      var a = lv[p], b = rv[p], ta = lt[p] || 0, tb = rt[p] || 0, v, t;
      if (a === b) { v = a; t = Math.max(ta, tb); }
      else if (tb > ta) { v = b; t = tb; }
      else if (ta > tb) { v = a; t = ta; }
      else { v = (a === undefined ? b : a); t = ta; } // empate: o que existe vence
      if (v !== undefined) vals[p] = v;
      if (t) ts[p] = t;
    }
    var out = unflatten(vals);
    out.t = ts;
    out.view = local.view;
    return out;
  }

  // Assinatura estável do conteúdo sincronizável, para saber o que mudou.
  function fingerprint(s) {
    var m = flatten(s), t = s.t || {}, keysOf = function (o) { return Object.keys(o).sort(); };
    return JSON.stringify([keysOf(m).map(function (k) { return [k, m[k]]; }),
                           keysOf(t).map(function (k) { return [k, t[k]]; })]);
  }

  function payload(s) {
    return { day: s.day, tracks: s.tracks, checks: s.checks, ms: s.ms,
             reduced: s.reduced, monthly: s.monthly, t: s.t || {} };
  }

  /* --- ciclo de sincronização --------------------------------------------- */

  async function pull() {
    if (!keys) return;
    var res = await api('GET');
    if (!res) { status('offline · salvo neste aparelho'); return; }
    if (res.status === 401) { status('senha não confere neste aparelho'); return; }
    if (res.status !== 200) { status('sincronização indisponível'); return; }

    version = res.body.version || 0;
    var remote = version ? await unsealSafe(res.body.iv, res.body.ct) : { t: {} };
    if (!remote) return;
    var local = getState();
    var merged = merge(local, remote);

    if (fingerprint(merged) !== fingerprint(local)) applyState(merged);
    if (fingerprint(merged) !== fingerprint(remote)) await send(merged, 0);
    else status('sincronizado ✓');
  }

  async function send(state, depth) {
    if (!keys || depth > 3) return;
    var sealed = await seal(payload(state));
    var res = await api('PUT', { version: version, iv: sealed.iv, ct: sealed.ct });

    if (!res) { status('offline · salvo neste aparelho'); return; }
    if (res.status === 401) { status('senha não confere neste aparelho'); return; }

    if (res.status === 409) {
      // Alguém salvou antes: funde com o que veio e tenta de novo.
      version = res.body.version || 0;
      var remote = version ? await unsealSafe(res.body.iv, res.body.ct) : { t: {} };
      if (!remote) return; // sem fundir às cegas; a próxima gravação já usa a versão nova
      var merged = merge(getState(), remote);
      if (fingerprint(merged) !== fingerprint(getState())) applyState(merged);
      return send(merged, depth + 1);
    }
    if (res.status !== 200) { status('sincronização indisponível'); return; }

    version = res.body.version;
    status('sincronizado ✓');
  }

  async function run() {
    if (busy) { pending = true; return; }
    busy = true;
    try { await send(getState(), 0); } catch (e) { status('sincronização indisponível'); }
    busy = false;
    if (pending) { pending = false; run(); }
  }

  /* --- tela de senha ------------------------------------------------------- */

  function ask() {
    var wrap = document.createElement('div');
    wrap.className = 'lock';
    wrap.innerHTML =
      '<form class="lockbox" autocomplete="on">' +
      '<h3>Sincronizar entre dispositivos</h3>' +
      '<p>Digite a senha do sistema. Ela não é guardada: fica só a chave derivada, ' +
      'neste aparelho. Os dados sobem cifrados — o servidor não consegue lê-los.</p>' +
      '<input type="password" name="password" autocomplete="current-password" ' +
      'placeholder="senha" required autofocus>' +
      '<div class="lockmsg"></div>' +
      '<div class="lockbtns">' +
      '<button type="submit" class="lockgo">Ativar neste aparelho</button>' +
      '<button type="button" class="lockx">Cancelar</button>' +
      '</div></form>';
    document.body.appendChild(wrap);

    var form = wrap.querySelector('form');
    var msg = wrap.querySelector('.lockmsg');
    var go = wrap.querySelector('.lockgo');
    var close = function () { document.body.removeChild(wrap); };

    wrap.querySelector('.lockx').addEventListener('click', close);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var pass = form.password.value;
      if (!pass) return;
      go.disabled = true;
      msg.textContent = 'derivando chave… (leva um segundo)';
      var derived;
      try { derived = await deriveKeys(pass); }
      catch (err) { msg.textContent = 'não foi possível derivar a chave neste navegador'; go.disabled = false; return; }

      keys = derived;
      var probe = await api('GET');
      if (!probe) { msg.textContent = 'sem conexão com o servidor de sincronização'; keys = null; go.disabled = false; return; }
      if (probe.status === 401) { msg.textContent = 'senha incorreta'; keys = null; go.disabled = false; return; }
      if (probe.status === 429) { msg.textContent = 'tentativas demais — espere alguns minutos'; keys = null; go.disabled = false; return; }
      if (probe.status !== 200) { msg.textContent = 'servidor respondeu ' + probe.status; keys = null; go.disabled = false; return; }

      await saveKeys(keys);
      close();
      await pull();
      if (typeof applyState === 'function') applyState(getState()); // redesenha o rodapé
    });
  }

  /* --- API pública --------------------------------------------------------- */

  return {
    configured: function () { return !!SYNC_URL; },
    active: function () { return !!keys; },

    init: function (opts) {
      getState = opts.getState;
      applyState = opts.applyState;
      status = opts.status || function () {};
    },

    // Chamado uma vez, depois do primeiro render.
    start: async function () {
      if (!SYNC_URL) return;
      // Os gatilhos ficam ligados desde já: pull() e run() não fazem nada
      // enquanto o aparelho não estiver ativado, e assim a ativação feita
      // agora já vale sem precisar recarregar a página.
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') pull();
      });
      window.addEventListener('online', run);

      var stored = await loadKeys();
      if (!stored) return; // aparelho ainda não ativado: segue local
      keys = stored;
      await pull();
    },

    // Chamado a cada gravação local.
    push: function () {
      if (!keys) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(run, 800);
    },

    // Botão do rodapé, com rótulo conforme o estado.
    footerButton: function () {
      if (!SYNC_URL) return '';
      return '<button class="reset" data-a="sync">' +
        (keys ? 'sair deste aparelho' : 'ativar sincronização') + '</button>';
    },

    toggle: async function (btn) {
      if (!keys) { ask(); return; }
      if (btn.dataset.armed === '1') {
        await dropKeys();
        keys = null; version = 0;
        status('sincronização desligada neste aparelho');
        if (typeof applyState === 'function') applyState(getState());
      } else {
        btn.dataset.armed = '1';
        var prev = btn.textContent;
        btn.textContent = 'Confirmar saída?';
        btn.classList.add('armed');
        setTimeout(function () {
          if (btn.dataset.armed === '1') {
            btn.dataset.armed = '0'; btn.textContent = prev; btn.classList.remove('armed');
          }
        }, 3500);
      }
    },
  };
})();
