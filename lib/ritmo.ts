/**
 * Ritmo — o cruzamento que o plano nunca fez.
 *
 * O site sabia duas coisas e nunca as juntou: quanto conteúdo falta numa
 * trilha (a árvore em `lib/curriculum`) e quando o marco que ela alimenta
 * vence (`MS` em `lib/plan.ts`). Juntar é aritmética simples, e é ela que
 * transforma uma lista de temas em cronograma — e que avisa em novembro que
 * março vai furar, enquanto ainda dá para corrigir.
 *
 * Três velocidades, e a diferença entre elas é o diagnóstico:
 *
 *   PRECISA      restante ÷ semanas até o alvo. O que o prazo exige.
 *   CAPACIDADE   o que os blocos da semana oferecem, se você não faltar.
 *   REAL         o que você fez de fato nas últimas semanas, pelos carimbos.
 *
 * Capacidade abaixo do necessário é problema de DESENHO: nem cumprindo tudo
 * dá, e a correção é mexer na rotina. Real abaixo da capacidade é problema de
 * EXECUÇÃO, e a correção é outra. Sem separar as duas, "estou atrasado" não
 * diz o que fazer.
 *
 * Puro: recebe estado e devolve números. Nada aqui grava.
 */
import { MS, WEEK } from './plan';
import { blockMinutes, ds, parseD } from './derive';
import { STATE_SEP, type JournalState } from './state';
import { TRILHAS, folhas, nos, type Node, type Trilha } from './curriculum/index';

/** Janela de observação do ritmo real. Curta demais vira ruído; longa demais, história. */
const JANELA_DIAS = 28;

/** Abaixo disto não há amostra: uma folha marcada não é um ritmo. */
const MIN_AMOSTRA = 2;

/** Folga considerada confortável, em semanas, antes de o veredito virar "no limite". */
const FOLGA_CONFORTAVEL = 4;

const SEMANA_MS = 7 * 864e5;

export type Veredito =
  | 'concluida'   // não falta nada
  | 'sem-alvo'    // o ramo não alimenta marco nenhum
  | 'sem-ritmo'   // há alvo, mas nada com que projetar
  | 'folga'       // termina com margem
  | 'no-limite'   // termina em cima da data
  | 'atrasa';     // não termina a tempo

export interface Ritmo {
  feitas: number;
  total: number;
  restanteMin: number;
  /** Id e data do marco que este ramo alimenta. */
  marco: string | null;
  alvo: string | null;
  /** Semanas até o alvo. Negativo quando o marco já venceu. */
  semanas: number | null;
  /** Minutos por semana que o prazo exige. */
  precisa: number | null;
  /** Minutos por semana que os blocos da rotina oferecem. */
  capacidade: number;
  /** Minutos por semana efetivamente cumpridos na janela — `null` sem amostra. */
  real: number | null;
  /** Data prevista de conclusão em cada ritmo. */
  fimNaCapacidade: string | null;
  fimNoReal: string | null;
  veredito: Veredito;
  /**
   * Concluir a árvore basta para o marco? Quando `false`, a previsão é sobre
   * o CONTEÚDO — o marco ainda depende de prática, de prova ou de terceiros,
   * e a folga mostrada não é folga do marco.
   */
  suficiente: boolean;
  /**
   * Semanas de sobra (positivo) ou de estouro (negativo) na projeção usada
   * pelo veredito. É o número que se lê primeiro.
   */
  margem: number | null;
}

/** Minutos por semana que a rotina reserva para estes tipos de bloco. */
export function capacidadeSemanal(tipos: string[]): number {
  if (!tipos.length) return 0;
  let min = 0;
  for (const dia of Object.values(WEEK)) {
    for (const b of dia.night) if (tipos.includes(b.t)) min += blockMinutes(b.d);
    if (dia.lunch && tipos.includes(dia.lunch.t)) min += blockMinutes(dia.lunch.d);
  }
  return min;
}

/**
 * Ritmo real: minutos por semana concluídos na janela.
 *
 * Sai dos carimbos que a sincronização já mantém (`state.t`) — marcar uma
 * folha grava quando, então não é preciso guardar histórico nenhum a mais.
 * Devolve `null` sem amostra suficiente: projetar a partir de uma marcação
 * daria um número confiante e errado.
 */
export function ritmoReal(no: Node, st: JournalState, agora = Date.now()): number | null {
  const corte = agora - JANELA_DIAS * 864e5;
  let min = 0;
  let n = 0;
  for (const f of folhas(no)) {
    if (!st.units[f.id]) continue;
    const quando = st.t['units' + STATE_SEP + f.id];
    if (typeof quando !== 'number' || quando < corte) continue;
    min += f.min ?? 0;
    n++;
  }
  if (n < MIN_AMOSTRA) return null;
  return Math.round(min / (JANELA_DIAS / 7));
}

function dataEm(agora: Date, semanas: number): string {
  return ds(new Date(agora.getTime() + semanas * SEMANA_MS));
}

/** O ritmo de um ramo. `trilha` dá a capacidade — o ramo herda os blocos dela. */
export function ritmo(no: Node, trilha: Trilha, st: JournalState, agora = new Date()): Ritmo {
  const fs = folhas(no);
  const feitas = fs.filter((f) => st.units[f.id]).length;
  const restanteMin = fs.filter((f) => !st.units[f.id]).reduce((s, f) => s + (f.min ?? 0), 0);

  const capacidade = capacidadeSemanal(trilha.tipos);
  const real = ritmoReal(no, st, agora.getTime());

  const ms = no.marco ? MS.find((m) => m.id === no.marco) : undefined;
  const alvo = ms?.d ?? null;
  const semanas = alvo
    ? Math.round(((parseD(alvo).getTime() - agora.getTime()) / SEMANA_MS) * 10) / 10
    : null;

  const base: Ritmo = {
    feitas, total: fs.length, restanteMin,
    marco: no.marco ?? null, alvo, semanas,
    precisa: null, capacidade, real,
    fimNaCapacidade: capacidade > 0 ? dataEm(agora, restanteMin / capacidade) : null,
    fimNoReal: real && real > 0 ? dataEm(agora, restanteMin / real) : null,
    veredito: 'sem-alvo', margem: null,
    suficiente: trilha.fecha !== false,
  };

  if (restanteMin === 0) return { ...base, veredito: 'concluida' };
  if (semanas === null) return base;

  // Prazo vencido não se divide: exigiria ritmo infinito.
  base.precisa = semanas > 0 ? Math.round(restanteMin / semanas) : null;

  // O real manda quando existe: é o que está acontecendo, não o que caberia.
  const usado = real && real > 0 ? real : capacidade;
  if (!usado) return { ...base, veredito: 'sem-ritmo' };

  const semanasNecessarias = restanteMin / usado;
  const margem = Math.round((semanas - semanasNecessarias) * 10) / 10;
  const veredito: Veredito =
    margem >= FOLGA_CONFORTAVEL ? 'folga' : margem >= 0 ? 'no-limite' : 'atrasa';

  return { ...base, veredito, margem };
}

export interface RitmoDeRamo { trilha: Trilha; no: Node; r: Ritmo }

/**
 * Todo ramo com alvo, em todas as trilhas — raiz e módulos internos.
 *
 * Um módulo com prazo próprio (as aplicações da Irlanda, o projeto 1) aparece
 * ao lado da raiz de propósito: é onde o estouro nasce, e a média da trilha
 * inteira o esconderia.
 */
export function ritmos(st: JournalState, agora = new Date()): RitmoDeRamo[] {
  const out: RitmoDeRamo[] = [];
  for (const t of TRILHAS) {
    for (const n of nos(t)) {
      if (!n.marco) continue;
      out.push({ trilha: t, no: n, r: ritmo(n, t, st, agora) });
    }
  }
  return out;
}

/** Só o que não fecha no prazo, do pior para o menos pior. */
export function emRisco(st: JournalState, agora = new Date()): RitmoDeRamo[] {
  return ritmos(st, agora)
    .filter((x) => x.r.veredito === 'atrasa')
    .sort((a, b) => (a.r.margem ?? 0) - (b.r.margem ?? 0));
}

/** 260 → "4h20". O relatório e a tela leem a mesma formatação. */
export function hm(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (!h) return `${m}min`;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}
