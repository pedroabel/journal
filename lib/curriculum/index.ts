/**
 * O percurso inteiro: todas as trilhas, e como um bloco da rotina encontra a sua.
 *
 * Ler junto com `lib/plan.ts`: lá está QUANDO estudar (a semana), aqui está O
 * QUE estudar (a árvore). O elo é `Trilha.tipos`, que casa com o `t` dos
 * blocos em `WEEK`.
 */
import type { Node, Trilha } from './types';
import { INGLES } from './ingles';
import { CS50 } from './cs50';
import { ALGORITMOS } from './algoritmos';
import { ENGENHARIA } from './engenharia';
import { CARREIRA } from './carreira';
import { CORPO } from './corpo';
import { IRLANDA } from './irlanda';
import { BASE } from './base';

export * from './types';
export { INGLES, CS50, ALGORITMOS, ENGENHARIA, CARREIRA, CORPO, IRLANDA, BASE };

/** Ordem de exibição. Não é ordem de prioridade — as trilhas correm em paralelo. */
export const TRILHAS: Trilha[] = [
  INGLES, CS50, ALGORITMOS, ENGENHARIA, CARREIRA, CORPO, IRLANDA, BASE,
];

/**
 * A trilha que um bloco da rotina estuda.
 *
 * `null` para bloco sem currículo (caminhada, sono) — ali não há o que
 * resolver, o próprio bloco já é a instrução.
 */
export function trilhaParaBloco(tipo: string): Trilha | null {
  return TRILHAS.find((t) => t.tipos.includes(tipo)) ?? null;
}

export function trilhaPorId(id: string): Trilha | null {
  return TRILHAS.find((t) => t.id === id) ?? null;
}

/** Índice id → nó, de todas as trilhas. Construído uma vez. */
let indice: Map<string, Node> | null = null;

export function porId(id: string): Node | null {
  if (!indice) {
    indice = new Map();
    const visitar = (n: Node) => {
      indice!.set(n.id, n);
      for (const f of n.filhos ?? []) visitar(f);
    };
    for (const t of TRILHAS) visitar(t);
  }
  return indice.get(id) ?? null;
}

/** Busca por texto no tema e na nota — para a visão "Estudar". */
export function buscar(termo: string): Node[] {
  const q = termo.trim().toLowerCase();
  if (!q) return [];
  const out: Node[] = [];
  const visitar = (n: Node) => {
    if (n.t.toLowerCase().includes(q) || (n.nota ?? '').toLowerCase().includes(q)) out.push(n);
    for (const f of n.filhos ?? []) visitar(f);
  };
  for (const t of TRILHAS) visitar(t);
  return out;
}
