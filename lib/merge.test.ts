/**
 * Testes de `merge.ts`.
 *
 * Dois tipos, e os dois importam:
 *
 * As PROPRIEDADES (comutativo, idempotente, associativo) são o que permite o
 * sync ser uma chamada só e repetível. Se qualquer uma cair, o sintoma não é
 * um erro na tela — é um aparelho que discorda do outro para sempre, ou uma
 * marcação que some semanas depois. São verificadas contra centenas de estados
 * gerados, porque o caso que quebra nunca é o que a gente pensaria em escrever.
 *
 * Os CENÁRIOS são as situações concretas que motivaram cada regra do arquivo.
 * Servem de documentação executável: quando alguém quiser "simplificar" o
 * desempate ou o carimbo de remoção, um deles cai e explica o porquê.
 *
 * Rodar: npm test
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canonical, clampFuture, merge, pruneTombstones } from './merge';
import { emptyState, STATE_SEP, type JournalState } from './state';

/* --- utilidades ----------------------------------------------------------- */

const SEP = STATE_SEP;
const T0 = 1_755_000_000_000; // instante fixo: teste não depende do relógio
const DAY = 24 * 60 * 60 * 1000;

/** Comparação sem depender da ordem das chaves — e ignorando `view`. */
function canon(st: JournalState): string {
  const stable = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(stable);
    const o = v as Record<string, unknown>;
    return Object.fromEntries(Object.keys(o).sort().map((k) => [k, stable(o[k])]));
  };
  const { view: _ignored, ...rest } = st;
  return JSON.stringify(stable(rest));
}

function same(a: JournalState, b: JournalState, msg: string): void {
  assert.equal(canon(a), canon(b), msg);
}

/**
 * Escreve (ou apaga) um caminho e o seu carimbo. Reproduz o que o app faz:
 * desmarcar remove o valor e mantém o carimbo.
 */
function put(st: JournalState, path: string, t: number, value?: true | string): void {
  st.t[path] = t;
  const [g, a, b] = path.split(SEP);
  const flat = st as never as Record<string, Record<string, true>>;

  if (b === undefined) {
    if (value === undefined) delete flat[g][a];
    else flat[g][a] = true;
    return;
  }
  const outer = (st as never as Record<string, Record<string, Record<string, unknown>>>)[g];
  if (value === undefined) {
    delete outer[a]?.[b];
    if (outer[a] && !Object.keys(outer[a]).length) delete outer[a];
    return;
  }
  (outer[a] ||= {})[b] = g === 'monthly' ? value : true;
}

/** Monta um estado a partir de `[caminho, carimbo, valor?]`. */
function build(entries: Array<[string, number, (true | string)?]>): JournalState {
  const st = emptyState();
  for (const [path, t, value] of entries) put(st, path, t, value);
  return st;
}

/* --- gerador de estados --------------------------------------------------- */

/** PRNG com semente: quando um caso quebra, ele quebra igual na próxima vez. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Poucos caminhos e poucos carimbos distintos, de propósito: é o que faz
// colisão e empate acontecerem de verdade, que é onde mora o bug.
const PATHS = [
  `tracks${SEP}roadmap`,
  `tracks${SEP}cs50`,
  `checks${SEP}docs-3`,
  `ms${SEP}passport`,
  `ms${SEP}ielts`,
  `reduced${SEP}2026-08-17`,
  `day${SEP}2026-08-20${SEP}sono`,
  `day${SEP}2026-08-20${SEP}caminhada`,
  `day${SEP}2026-08-21${SEP}en_write`,
  `monthly${SEP}2026-08${SEP}q1`,
  `monthly${SEP}2026-09${SEP}q2`,
];
const TEXTS = ['', 'foi bem', 'travei na quarta', 'zzz'];

function randomState(rnd: () => number): JournalState {
  const st = emptyState();
  const n = Math.floor(rnd() * PATHS.length);
  for (let i = 0; i < n; i++) {
    const path = PATHS[Math.floor(rnd() * PATHS.length)];
    const t = T0 + Math.floor(rnd() * 4) * 1000;
    const [g] = path.split(SEP);
    const value = g === 'monthly' ? TEXTS[Math.floor(rnd() * TEXTS.length)] : true;
    put(st, path, t, rnd() < 0.7 ? value : undefined); // 30% são remoções
  }
  // Às vezes um valor sem carimbo nenhum: é o localStorage anterior ao sync.
  if (rnd() < 0.2) st.checks.legado = true;
  return st;
}

/* --- propriedades --------------------------------------------------------- */

describe('propriedades de convergência', () => {
  const ROUNDS = 300;

  it('é comutativo: a ordem dos aparelhos não muda o resultado', () => {
    for (let i = 0; i < ROUNDS; i++) {
      const rnd = mulberry32(i + 1);
      const a = randomState(rnd);
      const b = randomState(rnd);
      same(merge(a, b), merge(b, a), `semente ${i + 1}`);
    }
  });

  it('é idempotente: refundir o resultado não muda nada', () => {
    for (let i = 0; i < ROUNDS; i++) {
      const rnd = mulberry32(i + 1000);
      const a = randomState(rnd);
      const b = randomState(rnd);
      const m = merge(a, b);
      same(merge(m, m), m, `merge(m, m) — semente ${i}`);
      same(merge(m, a), m, `reenviar o mesmo estado — semente ${i}`);
      same(merge(m, b), m, `reenviar do outro aparelho — semente ${i}`);
    }
  });

  it('é associativo: tanto faz quem encontra quem primeiro', () => {
    for (let i = 0; i < ROUNDS; i++) {
      const rnd = mulberry32(i + 2000);
      const a = randomState(rnd);
      const b = randomState(rnd);
      const c = randomState(rnd);
      same(merge(merge(a, b), c), merge(a, merge(b, c)), `semente ${i}`);
    }
  });

  it('três aparelhos convergem para o mesmo estado, em qualquer ordem', () => {
    for (let i = 0; i < 100; i++) {
      const rnd = mulberry32(i + 3000);
      const [a, b, c] = [randomState(rnd), randomState(rnd), randomState(rnd)];
      // celular → servidor → notebook → servidor → tablet
      const viaServidor = merge(merge(merge(a, b), c), a);
      // todos se encontram na ordem inversa
      const inverso = merge(c, merge(b, merge(a, c)));
      same(viaServidor, inverso, `semente ${i}`);
    }
  });
});

/* --- cenários ------------------------------------------------------------- */

describe('o bug que motivou tudo', () => {
  it('marcação offline no celular não apaga a checklist do notebook', () => {
    // 8h, sem sinal, no celular:
    const celular = build([[`day${SEP}2026-08-20${SEP}caminhada`, T0 + 8 * 3600_000, true]]);
    // 14h, no notebook, já sincronizado:
    const notebook = build([[`checks${SEP}docs-3`, T0 + 14 * 3600_000, true]]);
    // 19h, o celular recupera o sinal e envia — por último.
    const fim = merge(notebook, celular);

    assert.equal(fim.day['2026-08-20']?.caminhada, true, 'a caminhada entrou');
    assert.equal(fim.checks['docs-3'], true, 'e a checklist NÃO foi sobrescrita');
  });
});

describe('desmarcar precisa viajar', () => {
  it('remoção recente vence marcação antiga no outro aparelho', () => {
    const antigo = build([[`ms${SEP}passport`, T0, true]]);
    const desmarcou = build([[`ms${SEP}passport`, T0 + 5000]]); // carimbo sem valor
    same(merge(antigo, desmarcou), merge(desmarcou, antigo), 'simétrico');
    assert.equal(merge(antigo, desmarcou).ms.passport, undefined, 'ficou desmarcado');
  });

  it('o carimbo da remoção sobrevive à fusão, senão ela ressuscita depois', () => {
    const fundido = merge(
      build([[`ms${SEP}passport`, T0, true]]),
      build([[`ms${SEP}passport`, T0 + 5000]])
    );
    assert.equal(fundido.t[`ms${SEP}passport`], T0 + 5000);
    // um terceiro aparelho, desatualizado, tenta reenviar o valor antigo:
    const terceiro = build([[`ms${SEP}passport`, T0, true]]);
    assert.equal(merge(fundido, terceiro).ms.passport, undefined, 'continua desmarcado');
  });

  it('remarcar depois da remoção volta a valer', () => {
    const removido = build([[`ms${SEP}passport`, T0 + 5000]]);
    const remarcou = build([[`ms${SEP}passport`, T0 + 9000, true]]);
    assert.equal(merge(removido, remarcou).ms.passport, true);
  });
});

describe('empate de carimbo', () => {
  it('resolve igual dos dois lados — senão os aparelhos ficam se corrigindo', () => {
    const a = build([[`monthly${SEP}2026-08${SEP}q1`, T0, 'texto A']]);
    const b = build([[`monthly${SEP}2026-08${SEP}q1`, T0, 'texto B']]);
    same(merge(a, b), merge(b, a), 'mesmo vencedor nos dois sentidos');
  });

  it('valor presente vence ausente quando o carimbo é o mesmo', () => {
    const marcado = build([[`tracks${SEP}cs50`, T0, true]]);
    const vazio = build([[`tracks${SEP}cs50`, T0]]);
    assert.equal(merge(marcado, vazio).tracks.cs50, true);
    assert.equal(merge(vazio, marcado).tracks.cs50, true);
  });
});

describe('estado sem carimbo (localStorage antigo)', () => {
  it('valor sem carimbo nenhum sobrevive à fusão', () => {
    const legado = emptyState();
    legado.tracks.roadmap = true; // gravado antes de existir o mapa `t`
    const outro = emptyState();
    assert.equal(merge(legado, outro).tracks.roadmap, true);
    assert.equal(merge(outro, legado).tracks.roadmap, true);
  });

  it('mas perde para uma remoção carimbada', () => {
    const legado = emptyState();
    legado.ms.passport = true;
    const removeu = build([[`ms${SEP}passport`, T0]]);
    assert.equal(merge(legado, removeu).ms.passport, undefined);
  });
});

describe('respostas mensais', () => {
  it('texto mais recente vence', () => {
    const a = build([[`monthly${SEP}2026-08${SEP}q1`, T0, 'primeira versão']]);
    const b = build([[`monthly${SEP}2026-08${SEP}q1`, T0 + 1000, 'reescrevi']]);
    assert.equal(merge(a, b).monthly['2026-08'].q1, 'reescrevi');
  });

  it('apagar o texto conta como remoção, não como texto vazio', () => {
    const escreveu = build([[`monthly${SEP}2026-08${SEP}q1`, T0, 'algo']]);
    const apagou = build([[`monthly${SEP}2026-08${SEP}q1`, T0 + 1000, '']]);
    assert.equal(merge(escreveu, apagou).monthly['2026-08']?.q1, undefined);
  });
});

describe('view não sincroniza', () => {
  it('sai sempre do primeiro argumento — é preferência de aparelho', () => {
    const local = emptyState();
    local.view = 'jornada';
    const remoto = emptyState();
    remoto.view = 'hoje';
    assert.equal(merge(local, remoto).view, 'jornada');
  });
});

describe('payload torto não derruba nem entope', () => {
  it('ignora carimbo de caminho inválido', () => {
    const sujo = emptyState();
    sujo.t['view'] = T0;
    sujo.t[`tracks${SEP}a${SEP}b${SEP}c`] = T0;
    sujo.t['__proto__'] = T0;
    const out = merge(sujo, emptyState());
    assert.deepEqual(Object.keys(out.t), [], 'nada disso entra no estado');
  });

  it('sobrevive a grupos com o tipo errado', () => {
    const torto = { ...emptyState(), day: 'nao sou objeto', tracks: null } as never as JournalState;
    assert.doesNotThrow(() => merge(torto, emptyState()));
  });
});

/* --- canonical ------------------------------------------------------------ */

describe('canonical', () => {
  it('ignora a ordem das chaves — é o que evita gravação e aviso à toa', () => {
    const a = { tracks: { cs50: true, roadmap: true }, t: { x: 1 } };
    const b = { t: { x: 1 }, tracks: { roadmap: true, cs50: true } };
    assert.equal(canonical(a), canonical(b));
  });

  it('ignora `view`, que é preferência local', () => {
    assert.equal(
      canonical({ ...emptyState(), view: 'hoje' }),
      canonical({ ...emptyState(), view: 'jornada' })
    );
  });

  it('mas enxerga diferença de conteúdo', () => {
    assert.notEqual(
      canonical(build([[`ms${SEP}passport`, T0, true]])),
      canonical(build([[`ms${SEP}passport`, T0]]))
    );
  });

  it('o resultado de merge é canonicamente igual ao próprio merge refeito', () => {
    const a = build([[`day${SEP}2026-08-20${SEP}sono`, T0, true]]);
    const b = build([[`checks${SEP}docs-3`, T0 + 10, true]]);
    const m = merge(a, b);
    assert.equal(canonical(merge(m, m)), canonical(m));
  });
});

/* --- clampFuture ---------------------------------------------------------- */

describe('clampFuture', () => {
  const agora = T0;

  it('limita carimbo do futuro, que venceria para sempre', () => {
    const adiantado = build([[`tracks${SEP}cs50`, agora + 10 * DAY, true]]);
    clampFuture(adiantado, agora);
    assert.ok(adiantado.t[`tracks${SEP}cs50`] <= agora + 60_000);
  });

  it('não mexe em carimbo do passado — offline depende disso', () => {
    const ontem = agora - DAY;
    const st = build([[`tracks${SEP}cs50`, ontem, true]]);
    clampFuture(st, agora);
    assert.equal(st.t[`tracks${SEP}cs50`], ontem, 'a marcação de ontem continua sendo de ontem');
  });

  it('depois de limitado, o carimbo do futuro perde para uma edição real', () => {
    const adiantado = clampFuture(build([[`ms${SEP}ielts`, agora + 10 * DAY, true]]), agora);
    const edicaoReal = build([[`ms${SEP}ielts`, agora + 5 * DAY]]); // 5 dias depois, desmarcou
    assert.equal(merge(adiantado, edicaoReal).ms.ielts, undefined);
  });
});

/* --- pruneTombstones ------------------------------------------------------ */

describe('pruneTombstones', () => {
  const agora = T0;

  it('descarta carimbo velho de chave sem valor', () => {
    const st = build([[`ms${SEP}passport`, agora - 200 * DAY]]);
    pruneTombstones(st, agora);
    assert.deepEqual(Object.keys(st.t), []);
  });

  it('mantém carimbo velho que ainda tem valor', () => {
    const st = build([[`ms${SEP}passport`, agora - 200 * DAY, true]]);
    pruneTombstones(st, agora);
    assert.equal(st.t[`ms${SEP}passport`], agora - 200 * DAY);
  });

  it('mantém remoção recente — é ela que impede a ressurreição', () => {
    const st = build([[`ms${SEP}passport`, agora - 10 * DAY]]);
    pruneTombstones(st, agora);
    assert.equal(st.t[`ms${SEP}passport`], agora - 10 * DAY);
  });
});
