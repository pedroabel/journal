/**
 * curriculum/ — A ÁRVORE DE TEMAS.
 *
 * Este diretório NÃO guarda links, vídeos nem cursos. Guarda **o que estudar**,
 * em que ordem, e o que você tem que saber fazer quando terminar. O material
 * você procura — e é de propósito: link apodrece em três anos, taxonomia não.
 *
 * A estrutura é uma árvore de profundidade livre: trilha → módulo → tema →
 * subtema → ... → folha. A folha é a unidade estudável: cabe num bloco da
 * rotina (`WEEK` em lib/plan.ts) e termina num critério binário.
 *
 * Nada de lógica aqui além de travessia. O conteúdo vive nos arquivos irmãos.
 */

export interface Node {
  /** Identificador estável. É a chave do progresso — nunca renomeie um id. */
  id: string;
  /** O tema. */
  t: string;
  /** Uma linha: o que é, ou por que existe. Aparece como apoio, não como aula. */
  nota?: string;
  /** Minutos de sessão. Presente só na folha — é o que faz a folha caber num bloco. */
  min?: number;
  /**
   * O critério binário de conclusão: o que você tem que conseguir fazer, sem
   * olhar, para marcar a folha. Presente só na folha. Sem isto o tema é um
   * desejo, não um item.
   */
  saber?: string[];
  /** Ids que precisam estar feitos antes. Vazio = pode começar a qualquer momento. */
  pre?: string[];
  /**
   * Id do marco em `MS` (lib/plan.ts) que este ramo precisa alimentar.
   *
   * É o que permite cruzar conteúdo com prazo: quantas horas faltam aqui
   * contra quantas semanas faltam até lá. Vive no nó e não só na raiz porque
   * uma trilha pode ter prazos internos diferentes — a Irlanda tem custos em
   * 2026, aplicações em 2028 e visto em ago/2028, e a média entre eles não
   * significaria nada.
   */
  marco?: string;
  /** Subtemas. Ausente na folha. */
  filhos?: Node[];
}

/** Uma trilha inteira, com o tipo de bloco da rotina que a consome. */
export interface Trilha extends Node {
  /** Tipos de bloco em `WEEK` que estudam esta trilha (ex.: ['dsa']). */
  tipos: string[];
  /** Token de cor, como em lib/plan.ts — nome, nunca valor. */
  cor: string;
  /**
   * Concluir a árvore fecha o marco?
   *
   * Em CS50 sim: os psets SÃO o certificado. Em inglês não — estudar os 76
   * temas é condição necessária para a banda 7, nunca suficiente, porque o
   * que move a banda é volume de prática e a prova. Em algoritmos idem: a
   * árvore ensina os 18 padrões, e a entrevista cobra os ~150 problemas de
   * treino em cima deles.
   *
   * A distinção existe para o ritmo não mentir. Sem ela, "termina em nov/2026
   * com 68 semanas de folga" apareceria para o inglês — um número correto
   * sobre o conteúdo e completamente falso sobre o marco.
   *
   * Ausente = true.
   */
  fecha?: boolean;
}

/** É folha quando não tem filhos. `min` e `saber` só fazem sentido aqui. */
export function ehFolha(n: Node): boolean {
  return !n.filhos || n.filhos.length === 0;
}

/** Todas as folhas, na ordem da árvore — que é a ordem de estudo. */
export function folhas(n: Node): Node[] {
  if (ehFolha(n)) return [n];
  return n.filhos!.flatMap(folhas);
}

/** Todos os nós, incluindo os internos. */
export function nos(n: Node): Node[] {
  return [n, ...(n.filhos ?? []).flatMap(nos)];
}

export interface Contagem { folhas: number; minutos: number }

export function contar(n: Node): Contagem {
  const f = folhas(n);
  return { folhas: f.length, minutos: f.reduce((s, x) => s + (x.min ?? 0), 0) };
}

/** Quanto de um nó (e de tudo abaixo dele) está concluído. */
export function progresso(n: Node, feito: Record<string, true>): { feitas: number; total: number; pct: number } {
  const f = folhas(n);
  const feitas = f.filter((x) => feito[x.id]).length;
  return { feitas, total: f.length, pct: f.length ? Math.round((feitas / f.length) * 100) : 0 };
}

/** Pré-requisitos ainda não cumpridos. Vazio = liberada. */
export function travadaPor(n: Node, feito: Record<string, true>): string[] {
  return (n.pre ?? []).filter((p) => !feito[p]);
}

/**
 * As próximas folhas que cabem no bloco, na ordem da árvore.
 *
 * Preenche o orçamento de minutos: um bloco de 60min pode receber uma folha de
 * 60 ou duas de 30. Pula o que está travado por pré-requisito, nunca pula por
 * dificuldade — a ordem da árvore é a ordem de estudo.
 */
export function proximas(raiz: Node, feito: Record<string, true>, minutos: number): Node[] {
  const out: Node[] = [];
  let resta = minutos;
  for (const f of folhas(raiz)) {
    if (feito[f.id]) continue;
    if (travadaPor(f, feito).length) continue;
    const custo = f.min ?? 0;
    if (custo > resta) {
      // A primeira folha sempre entra, mesmo que estoure: é a próxima da fila,
      // e um bloco curto demais é problema da rotina, não motivo para pular tema.
      if (out.length === 0) out.push(f);
      break;
    }
    out.push(f);
    resta -= custo;
  }
  return out;
}

/** A única próxima folha — o "você está aqui" da trilha. */
export function proxima(raiz: Node, feito: Record<string, true>): Node | null {
  return proximas(raiz, feito, Number.MAX_SAFE_INTEGER).slice(0, 1)[0] ?? null;
}

/** O caminho da raiz até um nó, para mostrar "Algoritmos › Ordenação › Merge sort". */
export function caminho(raiz: Node, id: string): Node[] {
  if (raiz.id === id) return [raiz];
  for (const f of raiz.filhos ?? []) {
    const c = caminho(f, id);
    if (c.length) return [raiz, ...c];
  }
  return [];
}
