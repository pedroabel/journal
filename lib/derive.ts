/**
 * Cálculos derivados do estado: datas, sequências, taxas, situação dos marcos.
 *
 * Portado 1:1 da versão anterior em JavaScript. Nenhuma função aqui altera
 * estado — recebem `JournalState` e devolvem números ou objetos novos.
 */
import { MS, TRACKS, WEEK, type Milestone, type Track } from './plan';
import type { JournalState } from './state';

/* --- datas --------------------------------------------------------------- */

/** Data em AAAA-MM-DD no fuso local (nunca UTC: o dia do usuário é o local). */
export function ds(d: Date): string {
  return (
    d.getFullYear() +
    '-' + String(d.getMonth() + 1).padStart(2, '0') +
    '-' + String(d.getDate()).padStart(2, '0')
  );
}

export function today(): string {
  return ds(new Date());
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

export function parseD(s: string): Date {
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

/** Segunda-feira da semana daquela data — a chave do modo reduzido. */
export function weekKey(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return ds(x);
}

export function quarterOf(s: string): string {
  const d = parseD(s);
  return d.getFullYear() + 'Q' + Math.ceil((d.getMonth() + 1) / 3);
}

export function curQuarter(): string {
  const d = new Date();
  return d.getFullYear() + 'Q' + Math.ceil((d.getMonth() + 1) / 3);
}

export function monthKey(y: number, m: number): string {
  return y + '-' + String(m + 1).padStart(2, '0');
}

/* --- consultas ao estado -------------------------------------------------- */

export function isReduced(st: JournalState, d: Date): boolean {
  return !!st.reduced[weekKey(d)];
}

export function done(st: JournalState, dstr: string, k: string): boolean {
  return !!st.day[dstr]?.[k];
}

/** A chave é "janela:tipo" (ex.: "n:sono"); aqui só importa o tipo. */
export function typeDone(st: JournalState, dstr: string, t: string): boolean {
  const log = st.day[dstr];
  if (!log) return false;
  return Object.keys(log).some((k) => k.slice(2) === t);
}

/* --- estatísticas --------------------------------------------------------- */

export function expectedPerWeek(t: string): number {
  let c = 0;
  for (const d of Object.keys(WEEK)) {
    const w = WEEK[Number(d)];
    for (const b of w.night) if (b.t === t) c++;
    if (w.lunch && w.lunch.t === t) c++;
  }
  return c;
}

export interface MonthStats {
  count: Record<string, number>;
  countable: number;
  redDays: number;
  total: number;
}

/** Só conta dias já passados, e ignora semanas em modo reduzido. */
export function monthStats(st: JournalState, y: number, m: number): MonthStats {
  const last = new Date(y, m + 1, 0);
  const tdy = new Date();
  const count: Record<string, number> = {};
  let countable = 0;
  let redDays = 0;
  const total = last.getDate();

  for (let i = 1; i <= total; i++) {
    const d = new Date(y, m, i);
    if (d > tdy) continue;
    if (isReduced(st, d)) { redDays++; continue; }
    countable++;
    const log = st.day[ds(d)];
    if (!log) continue;
    for (const k of Object.keys(log)) {
      const t = k.slice(2);
      count[t] = (count[t] || 0) + 1;
    }
  }
  return { count, countable, redDays, total };
}

export interface Rate { did: number; exp: number; pct: number }

export function rateFor(t: string, stats: MonthStats): Rate | null {
  const per = expectedPerWeek(t);
  if (!per) return null;
  let exp = Math.round(per * (stats.countable / 7));
  if (exp < 1) exp = stats.countable > 0 ? 1 : 0;
  const did = stats.count[t] || 0;
  return { did, exp, pct: exp ? Math.min(100, Math.round((did / exp) * 100)) : 0 };
}

/** Dias seguidos. Hoje ainda não feito não quebra a corrente — conta de ontem. */
export function typeStreak(st: JournalState, t: string): number {
  let d = new Date();
  let s = 0;
  if (!typeDone(st, ds(d), t)) d = addDays(d, -1);
  while (typeDone(st, ds(d), t)) {
    s++;
    d = addDays(d, -1);
  }
  return s;
}

/* --- marcos --------------------------------------------------------------- */

export function msDone(st: JournalState, id: string): boolean {
  return !!st.ms[id];
}

export type MsStateKind = 'ok' | 'late' | 'now' | 'soon';

export function msState(st: JournalState, m: Milestone): { k: MsStateKind; n: string } {
  if (msDone(st, m.id)) return { k: 'ok', n: 'feito' };
  if (parseD(m.d) < new Date()) return { k: 'late', n: 'atrasado' };
  if (quarterOf(m.d) === curQuarter()) return { k: 'now', n: 'em andamento' };
  return { k: 'soon', n: 'a caminho' };
}

export function nextMS(st: JournalState): Milestone | null {
  const p = MS.filter((m) => !msDone(st, m.id)).sort((a, b) => (a.d < b.d ? -1 : 1));
  return p.length ? p[0] : null;
}

export function blockedBy(st: JournalState, m: Milestone): string[] {
  return (m.dep || []).filter((d) => !msDone(st, d));
}

export function msTitle(id: string): string {
  return MS.find((m) => m.id === id)?.t ?? id;
}

/* --- trilhas -------------------------------------------------------------- */

/** Primeiro item ainda não concluído — o "você está aqui" da trilha. */
export function curTrack(st: JournalState, tr: Track): { i: number; txt: string } | null {
  for (let i = 0; i < tr.items.length; i++) {
    if (!st.tracks[tr.id + '#' + tr.items[i][0]]) return { i, txt: tr.items[i][1] };
  }
  return null;
}

export function trackById(id: string): Track | null {
  return TRACKS.find((t) => t.id === id) ?? null;
}

/* --- blocos × currículo --------------------------------------------------- */

/**
 * Minutos utilizáveis de um bloco, a partir do rótulo em `plan.ts`.
 *
 * Os rótulos são escritos para humano ('25min', '2h', '15–20min', '—'), e é
 * assim que devem continuar. Quem precisa do número é o currículo, para saber
 * quantas folhas cabem na sessão — daí a conversão viver aqui e não lá.
 *
 * Faixa devolve o topo: '15–20min' são 20 minutos disponíveis. Rótulo sem
 * duração ('—', usado por sono) devolve 0, e quem consome trata isso como
 * "cabe uma folha" — nunca como "não cabe nada".
 */
export function blockMinutes(d: string): number {
  const horas = d.match(/(\d+(?:[.,]\d+)?)\s*h/);
  if (horas) return Math.round(parseFloat(horas[1].replace(',', '.')) * 60);
  const mins = d.match(/(\d+)\s*min/g);
  if (mins) return Math.max(...mins.map((m) => parseInt(m, 10)));
  return 0;
}
