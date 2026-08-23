/* ---------------------------------------------------------------------------
   Worker de sincronização — Cloudflare Workers + D1

   Guarda UM blob cifrado (o progresso) e uma versão para detectar conflito.
   O servidor nunca vê o conteúdo: o navegador cifra com AES-GCM antes de subir
   e a chave nunca sai do dispositivo. Aqui só existe texto opaco.

   Rotas (ambas exigem Authorization: Bearer <token>):
     GET  /state  -> {version, iv, ct}   (version 0 = ainda não há nada)
     PUT  /state  <- {version, iv, ct}   (version = a que o cliente leu)
                  -> 200 {version} | 409 {version, iv, ct} se alguém salvou antes

   Segredos (wrangler secret put):
     AUTH_HASH       sha256 hex do token derivado da senha
     ALLOWED_ORIGIN  origem do site, ex.: https://pedroabel.github.io
   --------------------------------------------------------------------------- */

const ROW_ID = 'me';
const MAX_BODY = 4 * 1024 * 1024; // blob de progresso é kB; 4 MB é folga larga
const FAIL_LIMIT = 10;            // tentativas erradas por IP...
const FAIL_WINDOW_DEFAULT = 900;  // ...a cada 15 minutos

/* Por que 15 minutos e não uma hora: contra uma senha de 5 palavras aleatórias,
   40 tentativas/hora e 10 tentativas/hora são igualmente inúteis para quem
   adivinha — mas a janela curta evita que VOCÊ fique trancado do lado de fora
   depois de errar a senha algumas vezes. */
function failWindow(env) { return Number(env.FAIL_WINDOW || FAIL_WINDOW_DEFAULT); }

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (url.pathname !== '/state') return json({ error: 'not_found' }, 404, cors);

    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    if (await isRateLimited(env, ip)) return json({ error: 'too_many_attempts' }, 429, cors);

    const token = bearer(request);
    if (!token || !(await tokenOk(env, token))) {
      await recordFailure(env, ip);
      return json({ error: 'unauthorized' }, 401, cors);
    }

    if (request.method === 'GET') return handleGet(env, cors);
    if (request.method === 'PUT') return handlePut(request, env, cors);
    return json({ error: 'method_not_allowed' }, 405, cors);
  },
};

async function handleGet(env, cors) {
  const row = await env.DB.prepare(
    'SELECT version, iv, ct FROM state WHERE id = ?'
  ).bind(ROW_ID).first();
  if (!row) return json({ version: 0, iv: null, ct: null }, 200, cors);
  return json({ version: row.version, iv: row.iv, ct: row.ct }, 200, cors);
}

async function handlePut(request, env, cors) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'too_large' }, 413, cors);

  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: 'bad_json' }, 400, cors); }

  const version = Number(body.version);
  const { iv, ct } = body;
  if (!Number.isInteger(version) || version < 0) return json({ error: 'bad_version' }, 400, cors);
  if (typeof iv !== 'string' || typeof ct !== 'string' || !iv || !ct) {
    return json({ error: 'bad_payload' }, 400, cors);
  }

  const now = Math.floor(Date.now() / 1000);

  if (version === 0) {
    // Primeira gravação: só entra se ainda não existir linha.
    const ins = await env.DB.prepare(
      'INSERT INTO state (id, version, iv, ct, updated_at) VALUES (?, 1, ?, ?, ?) ' +
      'ON CONFLICT(id) DO NOTHING'
    ).bind(ROW_ID, iv, ct, now).run();
    if (ins.meta.changes === 0) return conflict(env, cors);
    return json({ version: 1 }, 200, cors);
  }

  // Compare-and-swap: só grava se a versão ainda for a que o cliente leu.
  const upd = await env.DB.prepare(
    'UPDATE state SET version = version + 1, iv = ?, ct = ?, updated_at = ? ' +
    'WHERE id = ? AND version = ?'
  ).bind(iv, ct, now, ROW_ID, version).run();
  if (upd.meta.changes === 0) return conflict(env, cors);
  return json({ version: version + 1 }, 200, cors);
}

async function conflict(env, cors) {
  const row = await env.DB.prepare(
    'SELECT version, iv, ct FROM state WHERE id = ?'
  ).bind(ROW_ID).first();
  return json(
    { error: 'conflict', version: row ? row.version : 0, iv: row ? row.iv : null, ct: row ? row.ct : null },
    409, cors
  );
}

/* --- autenticação ---------------------------------------------------------- */

function bearer(request) {
  const h = request.headers.get('Authorization') || '';
  const m = /^Bearer\s+([A-Za-z0-9._-]+)$/.exec(h.trim());
  return m ? m[1] : null;
}

async function tokenOk(env, token) {
  const digest = await sha256Hex(token);
  return timingSafeEqual(digest, String(env.AUTH_HASH || ''));
}

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Comparação de tempo constante: não vaza quantos caracteres bateram.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* --- limite de tentativas -------------------------------------------------- */

async function isRateLimited(env, ip) {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    'SELECT n, window_start FROM auth_fail WHERE ip = ?'
  ).bind(ip).first();
  if (!row) return false;
  if (now - row.window_start >= failWindow(env)) return false; // janela expirou
  return row.n >= FAIL_LIMIT;
}

async function recordFailure(env, ip) {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    'INSERT INTO auth_fail (ip, n, window_start) VALUES (?, 1, ?) ' +
    'ON CONFLICT(ip) DO UPDATE SET ' +
    '  n = CASE WHEN ? - auth_fail.window_start >= ? THEN 1 ELSE auth_fail.n + 1 END, ' +
    '  window_start = CASE WHEN ? - auth_fail.window_start >= ? THEN ? ELSE auth_fail.window_start END'
  ).bind(ip, now, now, failWindow(env), now, failWindow(env), now).run();
}

/* --- utilidades ------------------------------------------------------------ */

function corsHeaders(origin, env) {
  // trim/barra final: ALLOWED_ORIGIN vem de configuracao digitada a mao, e um
  // espaco invisivel derrubaria o CORS inteiro sem mensagem de erro nenhuma.
  const allowed = norm(env.ALLOWED_ORIGIN);
  const h = {
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && allowed && norm(origin) === allowed) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function norm(v) {
  return String(v || '').trim().replace(/\/+$/, '');
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
  });
}
