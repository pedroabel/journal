/**
 * Relatório em texto puro, para colar numa conversa com o Claude.
 *
 * Portado 1:1 da versão anterior. É texto e não JSON de propósito: o objetivo
 * é ser lido por um humano ou por um modelo, não processado por máquina.
 */
import { CHECKS, MCQ, MS, PLAN_CTX, TRACKS, TYPE_LABEL } from './plan';
import { hm, ritmos } from './ritmo';
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
    tr.items.forEach((_, i) => { if (st.tracks[tr.id + '#' + i]) dc++; });
    const c = curTrack(st, tr);
    out.push(`- ${tr.name}: ${dc}/${tr.items.length}` + (c ? ` · atual: ${c.txt}` : ' · CONCLUÍDA'));
  }

  out.push('');
  out.push('RITMO \u2014 conte\u00fado que falta \u00d7 prazo do marco');
  out.push(
    'Tr\u00eas velocidades: PRECISA (o prazo exige), ROTINA (os blocos oferecem), ' +
    'FAZ (o observado nos \u00faltimos 28 dias). Rotina < precisa \u00e9 problema de desenho da ' +
    'semana; ' +
    'faz < rotina \u00e9 problema de execu\u00e7\u00e3o.'
  );
  for (const { trilha, no, r } of ritmos(st)) {
    const nome = no.id === trilha.id ? trilha.t : trilha.t + ' / ' + no.t;
    if (r.veredito === 'concluida') { out.push(`- ${nome}: CONCLU\u00cdDA`); continue; }

    const vel = [
      `precisa ${r.precisa !== null ? hm(r.precisa) + '/sem' : '-'}`,
      `rotina ${r.capacidade ? hm(r.capacidade) + '/sem' : 'nenhum bloco'}`,
      `faz ${r.real !== null ? hm(r.real) + '/sem' : 'sem dados'}`,
    ].join(' - ');

    const fim = r.fimNoReal ?? r.fimNaCapacidade;
    const situacao =
      r.veredito === 'sem-ritmo' ? 'SEM RITMO PARA PROJETAR'
      : r.margem === null ? 'ALVO VENCIDO'
      : r.margem < 0 ? `ATRASA ${Math.abs(Math.round(r.margem))} semanas (termina ${fim})`
      : r.veredito === 'no-limite' ? `no limite (termina ${fim})`
      : `folga de ${Math.round(r.margem)} semanas (termina ${fim})`;

    out.push(
      `- ${nome}: ${r.feitas}/${r.total} temas, restam ${hm(r.restanteMin)}, ` +
      `alvo ${r.alvo}, ${vel}, ${situacao}` +
      (r.suficiente ? '' : ' [concluir a \u00e1rvore n\u00e3o basta para este marco]')
    );
  }

  out.push('');
  out.push('CHECKLISTS');
  for (const cl of CHECKS) {
    let dc = 0;
    let next: string | null = null;
    cl.items.forEach((_, i) => { if (st.checks[cl.id + '#' + i]) dc++; });
    for (let i = 0; i < cl.items.length; i++) {
      if (!st.checks[cl.id + '#' + i]) { next = cl.items[i][0]; break; }
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
    '(3) 2-3 ajustes concretos. Use a seção RITMO: se a rotina oferece menos do que o prazo exige, o problema está no desenho da semana e o ajuste é remanejar blocos \u2014 diga quais. Se a rotina basta e o observado não, o problema é execução. Se um bloco é pulado repetidamente, diga que o problema é o ' +
    'desenho da rotina e sugira a mudança. Se houver marco atrasado, priorize falar dele. ' +
    'Se não houver dados suficientes, diga isso em vez de inventar. Parágrafos curtos, sem markdown.'
  );
}
