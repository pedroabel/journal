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
  /** Folhas da árvore de temas já concluídas — a chave é o id do nó. */
  units: Record<string, true>;
  tracks: Record<string, true>;
  checks: Record<string, true>;
  ms: Record<string, true>;
  reduced: Record<string, true>;
  monthly: Record<string, Record<string, string>>;
  t: Record<string, number>;
  view: ViewId;
}

export function emptyState(): JournalState {
  return { day: {}, units: {}, tracks: {}, checks: {}, ms: {}, reduced: {}, monthly: {}, t: {}, view: 'hoje' };
}

/** Aceita qualquer objeto vindo do disco ou de um backup, sem confiar nele. */
export function adopt(raw: unknown, fallbackView: ViewId = 'hoje'): JournalState {
  const d = (raw ?? {}) as Partial<JournalState>;
  return {
    day: d.day ?? {},
    units: d.units ?? {},
    tracks: d.tracks ?? {},
    checks: d.checks ?? {},
    ms: d.ms ?? {},
    reduced: d.reduced ?? {},
    monthly: d.monthly ?? {},
    t: d.t ?? {},
    view: d.view ?? fallbackView,
  };
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
  for (const g of ['units', 'tracks', 'checks', 'ms', 'reduced'] as const) {
    for (const k of Object.keys(state[g])) state.t[g + STATE_SEP + k] = n;
  }
  for (const g of ['day', 'monthly'] as const) {
    for (const a of Object.keys(state[g])) {
      for (const b of Object.keys(state[g][a])) state.t[g + STATE_SEP + a + STATE_SEP + b] = n;
    }
  }
}
