/**
 * Relatório em texto puro, para colar numa conversa com o Claude.
 *
 * Portado 1:1 da versão anterior. É texto e não JSON de propósito: o objetivo
 * é ser lido por um humano ou por um modelo, não processado por máquina.
 */
import { CHECKS, MCQ, MS, PLAN_CTX, TRACKS, TYPE_LABEL } from './plan';
import {
  addDays, blockedBy, curQuarter, curTrack, ds, expectedPerWeek, isReduced,
  monthKey, msDone, msState, msTitle, nextMS, typeStreak,
} from './derive';
import type { JournalState } from './state';

const STREAK_TYPES = ['sono', 'en_write', 'en_speak', 'calistenia', 'roadmap', 'cs50'];

export function buildReport(st: JournalState, nDays = 30): string {
  const out: string[] = [];
  const count: Record<string, number> = {};
  let activeDays = 0;
  let redDays = 0;

  for (let i = 0; i < nDays; i++) {
    const d = addDays(new Date(), -i);
    if (isReduced(st, d)) redDays++;
    const log = st.day[ds(d)];
    if (!log) continue;
    activeDays++;
    for (const k of Object.keys(log)) {
      const t = k.slice(2);
      count[t] = (count[t] || 0) + 1;
    }
  }

  const weeks = nDays / 7;
  out.push(`=== RELATÓRIO · ${new Date().toLocaleDateString('pt-BR')} · últimos ${nDays} dias ===`);
  out.push('');
  out.push('CONSISTÊNCIA (feitos / previstos)');

  const line: string[] = [];
  for (const t of Object.keys(TYPE_LABEL)) {
    const per = expectedPerWeek(t);
    if (!per) continue;
    line.push(`${TYPE_LABEL[t]} ${count[t] || 0}/${Math.round(per * weeks)}`);
  }
  out.push(line.join(' · '));
  out.push(
    `Dias com registro: ${activeDays}/${nDays}` +
      (redDays ? ` · dias em semana reduzida: ${redDays}` : '')
  );

  const sq: string[] = [];
  for (const t of STREAK_TYPES) {
    const s = typeStreak(st, t);
    if (s > 1) sq.push(`${TYPE_LABEL[t]} ${s}d`);
  }
  out.push('Sequências ativas: ' + (sq.length ? sq.join(' · ') : 'nenhuma'));

  out.push('');
  out.push('MARCOS');
  const dnc = MS.filter((m) => msDone(st, m.id));
  out.push(
    `Conquistados: ${dnc.length}/${MS.length}` +
      (dnc.length ? ' → ' + dnc.map((m) => m.t).join(' | ') : '')
  );

  const late = MS.filter((m) => msState(st, m).k === 'late');
  if (late.length) {
    out.push('ATRASADOS: ' + late.map((m) => `${m.t} (alvo ${m.d})`).join(' | '));
  }

  const nx = nextMS(st);
  if (nx) {
    const bl = blockedBy(st, nx);
    out.push(
      `Próximo: ${nx.t} — alvo ${nx.d}` +
        (bl.length ? ` (travado por: ${bl.map(msTitle).join(', ')})` : '')
    );
  }
  out.push('Trimestre atual: ' + curQuarter());

  out.push('');
  out.push('TRILHAS');
  for (const tr of TRACKS) {
    let dc = 0;
    tr.items.forEach(([k]) => { if (st.tracks[tr.id + '#' + k]) dc++; });
    const c = curTrack(st, tr);
    out.push(`- ${tr.name}: ${dc}/${tr.items.length}` + (c ? ` · atual: ${c.txt}` : ' · CONCLUÍDA'));
  }

  out.push('');
  out.push('CHECKLISTS');
  for (const cl of CHECKS) {
    let dc = 0;
    let next: string | null = null;
    cl.items.forEach(([k]) => { if (st.checks[cl.id + '#' + k]) dc++; });
    for (const [k, label] of cl.items) {
      if (!st.checks[cl.id + '#' + k]) { next = label; break; }
    }
    out.push(`- ${cl.name}: ${dc}/${cl.items.length}` + (next ? ` · próximo: ${next}` : ' · COMPLETO'));
  }

  const now = new Date();
  const mm = st.monthly[monthKey(now.getFullYear(), now.getMonth())];
  if (mm) {
    out.push('');
    out.push('FECHAMENTO DO MÊS');
    for (const q of MCQ) if (mm[q.id]) out.push(`- ${q.q} ${mm[q.id]}`);
  }

  return out.join('\n');
}

/**
 * Prompt pronto para colar no Claude. O site não chama IA sozinho: sem
 * servidor de IA no meio, não há chave para vazar nem custo surpresa.
 */
export function analysisPrompt(report: string): string {
  return (
    'Você é o mentor estratégico do Abel. Contexto:\n' + PLAN_CTX +
    '\n\nRelatório gerado pelo sistema dele:\n\n' + report +
    '\n\nAnalise em português do Brasil, direto e crítico (não elogie por elogiar). ' +
    'Máximo 250 palavras: (1) o que está funcionando, (2) o que está em risco e por quê, ' +
    '(3) 2-3 ajustes concretos. Se um bloco é pulado repetidamente, diga que o problema é o ' +
    'desenho da rotina e sugira a mudança. Se houver marco atrasado, priorize falar dele. ' +
    'Se não houver dados suficientes, diga isso em vez de inventar. Parágrafos curtos, sem markdown.'
  );
}
