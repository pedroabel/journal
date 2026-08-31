/**
 * Estado do progresso: o que foi marcado, e quando.
 *
 * Fica no localStorage do navegador — é o que faz o site abrir instantâneo e
 * funcionar offline. O mapa `t` guarda quando cada chave mudou; ele existe
 * para permitir fundir alterações entre aparelhos sem perder nada, inclusive
 * desmarcar (que apaga o valor mas deixa o carimbo).
 */
import type { ViewId } from './plan';

export const STORE_KEY = 'sistema-unificado-v2';

/**
 * Separador de caminho no mapa de carimbos: U+001F (unit separator). Nunca
 * colide com uma chave real — datas, ids, nomes de bloco. Escrito por código
 * em vez de literal para não virar um caractere invisível no fonte.
 */
export const STATE_SEP = String.fromCharCode(31);

export interface JournalState {
  day: Record<string, Record<string, true>>;
  tracks: Record<string, true>;
  checks: Record<string, true>;
  ms: Record<string, true>;
  reduced: Record<string, true>;
  monthly: Record<string, Record<string, string>>;
  t: Record<string, number>;
  view: ViewId;
}

export function emptyState(): JournalState {
  return { day: {}, tracks: {}, checks: {}, ms: {}, reduced: {}, monthly: {}, t: {}, view: 'hoje' };
}

/**
 * Mapa congelado das posições que trilhas e checklists tinham quando as
 * marcações passaram a ser gravadas por chave em vez de índice.
 *
 * Congelado é literal: a tabela descreve o passado e não pode acompanhar
 * `lib/plan.ts`. Derivada das listas atuais, a primeira edição de conteúdo
 * depois desta já traduziria um índice antigo para o item errado — que é o
 * bug que a troca de chaves veio encerrar. Nada aqui se altera nunca mais.
 */
const LEGACY_KEYS: Record<'tracks' | 'checks', Record<string, readonly string[]>> = {
  tracks: {
    ingles: ['out', 'rec', 'tutor', 'cards', 'mock', 'ielts'],
    cs50: ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'final'],
    dsa: ['arrays', 'twoptr', 'window', 'stack', 'bsearch', 'list',
          'trees', 'heap', 'backtrack', 'graphs', 'dp'],
    portfolio: ['linkedin', 'github', 'p1', 'p2', 'p3', 'cv', 'apply'],
  },
  checks: {
    docs: ['passport', 'costs', 'programs', 'records', 'sworn', 'statement', 'letters',
           'apps', 'offer', 'funds', 'insurance', 'visa', 'dogs'],
    fin: ['auto', 'k12', 'k25', 'k42', 'k60', 'sinpro', 'bolsas'],
  },
};

/** `fin#3` → `fin#k42`. `null` se já é chave, ou se a posição não existe mais. */
function legacyKey(group: 'tracks' | 'checks', key: string): string | null {
  const m = /^([a-z0-9]+)#(\d+)$/.exec(key);
  if (!m) return null;
  const k = LEGACY_KEYS[group][m[1]]?.[Number(m[2])];
  return k ? `${m[1]}#${k}` : null;
}

/**
 * Traduz as marcações gravadas por índice. Altera o estado recebido.
 *
 * Roda dentro de `adopt`, então alcança tudo que vem de fora — localStorage,
 * servidor e backup antigo — e os dois lados da sincronização convertem do
 * mesmo jeito, que é o que impede os aparelhos de divergirem durante a troca.
 *
 * Idempotente: chave nova não casa com `id#número`, então uma segunda passada
 * não faz nada. Percorre também os carimbos sem valor, senão um item que você
 * desmarcou antes da troca voltaria marcado ao encontrar um aparelho atrasado.
 */
function migrate(state: JournalState): JournalState {
  for (const group of ['tracks', 'checks'] as const) {
    const legacy = new Set(Object.keys(state[group]));
    for (const path of Object.keys(state.t)) {
      const segs = path.split(STATE_SEP);
      if (segs.length === 2 && segs[0] === group) legacy.add(segs[1]);
    }

    for (const old of legacy) {
      const next = legacyKey(group, old);
      if (!next) continue;

      const from = group + STATE_SEP + old;
      const to = group + STATE_SEP + next;
      const marked = state[group][old] === true;
      const at = state.t[from];

      delete state[group][old];
      delete state.t[from];

      // Decisão já tomada com a chave nova é posterior à troca, logo mais
      // recente que qualquer coisa herdada do índice: ela manda, marcada ou
      // desmarcada.
      if (state[group][next] || state.t[to] !== undefined) continue;

      if (marked) state[group][next] = true;
      if (at !== undefined) state.t[to] = at;
    }
  }
  return state;
}

/**
 * Aceita qualquer objeto vindo do disco ou de um backup, sem confiar nele.
 *
 * `tracks`, `checks` e `t` saem copiados porque a migração de chaves reescreve
 * os três — o objeto recebido não deve mudar debaixo de quem chamou.
 */
export function adopt(raw: unknown, fallbackView: ViewId = 'hoje'): JournalState {
  const d = (raw ?? {}) as Partial<JournalState>;
  return migrate({
    day: d.day ?? {},
    tracks: { ...(d.tracks ?? {}) },
    checks: { ...(d.checks ?? {}) },
    ms: d.ms ?? {},
    reduced: d.reduced ?? {},
    monthly: d.monthly ?? {},
    t: { ...(d.t ?? {}) },
    view: d.view ?? fallbackView,
  });
}

export function load(): JournalState | null {
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    return v ? adopt(JSON.parse(v)) : null;
  } catch {
    return null;
  }
}

export function save(state: JournalState): boolean {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Carimba a alteração de uma chave, para a fusão entre aparelhos saber a ordem. */
export function stamp(state: JournalState, ...path: string[]): void {
  state.t[path.join(STATE_SEP)] = Date.now();
}

/** Carimba tudo que existe agora — usado ao restaurar backup e ao reiniciar. */
export function stampAll(state: JournalState): void {
  const n = Date.now();
  for (const g of ['tracks', 'checks', 'ms', 'reduced'] as const) {
    for (const k of Object.keys(state[g])) state.t[g + STATE_SEP + k] = n;
  }
  for (const g of ['day', 'monthly'] as const) {
    for (const a of Object.keys(state[g])) {
      for (const b of Object.keys(state[g][a])) state.t[g + STATE_SEP + a + STATE_SEP + b] = n;
    }
  }
}
