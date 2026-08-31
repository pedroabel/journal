/**
 * merge.ts — fusão de dois estados de progresso, chave a chave.
 *
 * É a peça que faz o mesmo diário abrir igual em qualquer aparelho. Não existe
 * "o estado mais novo vence": isso perderia trabalho toda vez que dois
 * aparelhos mudassem coisas diferentes sem se falar. O que vence é cada chave
 * separadamente, pelo carimbo em `state.t`.
 *
 * Marcar a caminhada no celular às 8h e fechar uma checklist no notebook às
 * 14h não são alterações concorrentes — são chaves diferentes, e as duas
 * sobrevivem. Só disputam duas escritas na MESMA chave, e aí a mais recente
 * ganha.
 *
 * Três propriedades sustentam o resto do sistema de sincronização, e os testes
 * em `merge.test.ts` existem para não deixá-las quebrar em silêncio:
 *
 *   comutativo   merge(a, b) ≡ merge(b, a) em tudo que sincroniza
 *   idempotente  merge(a, a) ≡ a, e refundir o resultado não muda nada
 *   associativo  a ordem em que os aparelhos se encontram é irrelevante
 *
 * Com elas, sincronizar vira uma chamada só, repetível: o cliente manda o que
 * tem, o servidor funde e devolve a verdade. Sem versão, sem 409, sem tela de
 * conflito, e reenviar depois de uma falha de rede é inofensivo.
 *
 * Puro de propósito: nada aqui toca rede, relógio ou localStorage. O mesmo
 * arquivo roda no navegador e no servidor — se cada lado fundisse do seu
 * jeito, os aparelhos divergiriam devagar, que é o pior tipo de bug para
 * perceber.
 */
import { STATE_SEP, emptyState, type JournalState } from './state';

/** Grupos com um nível: `units␟dsa.pad.win`. O valor só pode ser `true`. */
const FLAT = ['units', 'tracks', 'checks', 'ms', 'reduced'] as const;

/** Grupos com dois níveis: `day␟2026-08-23␟sono`, `monthly␟2026-08␟q1`. */
const NESTED = ['day', 'monthly'] as const;

type FlatGroup = (typeof FLAT)[number];
type NestedGroup = (typeof NESTED)[number];

/** `true` para marcações; texto para as respostas mensais. */
type Value = true | string;

const isFlat = (g: string): g is FlatGroup => (FLAT as readonly string[]).includes(g);
const isNested = (g: string): g is NestedGroup => (NESTED as readonly string[]).includes(g);

/**
 * O estado pode chegar de um backup antigo, de outro aparelho ou do corpo de
 * uma requisição — `adopt` garante que os campos existam, não que sejam sãos.
 * Daí a desconfiança em cada leitura.
 */
function rec(x: unknown): Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x)
    ? (x as Record<string, unknown>)
    : {};
}

function num(x: unknown): number {
  return typeof x === 'number' && Number.isFinite(x) ? x : 0;
}

/** Caminho válido é o que o `stamp()` sabe escrever. O resto é ruído. */
function validPath(segs: string[]): boolean {
  const g = segs[0];
  if (isFlat(g)) return segs.length === 2;
  if (isNested(g)) return segs.length === 3;
  return false;
}

/**
 * Valor de um caminho, ou `undefined` se ele não existe — o que também
 * significa "foi desmarcado", já que desmarcar apaga o valor e mantém o
 * carimbo. Resposta mensal vazia conta como ausente: apagar o texto é apagar
 * a resposta.
 */
function readPath(st: JournalState, segs: string[]): Value | undefined {
  const [g, a, b] = segs;
  if (isFlat(g)) {
    return rec(st[g])[a] === true ? true : undefined;
  }
  if (g === 'day') {
    return rec(rec(st.day)[a])[b] === true ? true : undefined;
  }
  if (g === 'monthly') {
    const v = rec(rec(st.monthly)[a])[b];
    return typeof v === 'string' && v !== '' ? v : undefined;
  }
  return undefined;
}

function writePath(st: JournalState, segs: string[], v: Value): void {
  const [g, a, b] = segs;
  if (isFlat(g)) {
    if (v === true) st[g][a] = true;
    return;
  }
  if (g === 'day') {
    if (v === true) (st.day[a] ||= {})[b] = true;
    return;
  }
  if (g === 'monthly' && typeof v === 'string') {
    (st.monthly[a] ||= {})[b] = v;
  }
}

/** Caminhos que têm valor de fato, independente de haver carimbo. */
function valuePaths(st: JournalState): string[] {
  const out: string[] = [];
  for (const g of FLAT) {
    for (const k of Object.keys(rec(st[g]))) out.push(g + STATE_SEP + k);
  }
  for (const g of NESTED) {
    const outer = rec(st[g]);
    for (const a of Object.keys(outer)) {
      for (const b of Object.keys(rec(outer[a]))) out.push(g + STATE_SEP + a + STATE_SEP + b);
    }
  }
  return out;
}

/**
 * Empate de carimbo, resolvido sem olhar de que lado o valor veio.
 *
 * A tentação é "em caso de empate, o local ganha" — e aí o cliente e o
 * servidor escolhem valores diferentes para a mesma chave, cada um se acha
 * certo, e os dois ficam trocando de opinião a cada sincronização. A regra
 * precisa depender só dos valores: presente vence ausente, e entre dois
 * presentes vence o maior lexicograficamente. Arbitrário, mas idêntico nos
 * dois lados, que é o que importa.
 */
function tiebreak(va: Value | undefined, vb: Value | undefined): Value | undefined {
  if (va === undefined) return vb;
  if (vb === undefined) return va;
  if (va === vb) return va;
  return String(va) > String(vb) ? va : vb;
}

/**
 * Funde dois estados. Nenhum dos dois é alterado.
 *
 * `view` é a única exceção à comutatividade, de propósito: é preferência de
 * aparelho, não progresso. Sai sempre de `a` — passe o lado local ali para a
 * aba aberta no notebook não mandar na do celular.
 */
export function merge(a: JournalState, b: JournalState): JournalState {
  const out = emptyState();
  out.view = a.view;

  const paths = new Set<string>([
    ...Object.keys(rec(a.t)),
    ...Object.keys(rec(b.t)),
    // Sem esta parte, um valor sem carimbo seria apagado em silêncio — e ele
    // existe: localStorage gravado antes de o mapa `t` passar a ser mantido.
    ...valuePaths(a),
    ...valuePaths(b),
  ]);

  for (const path of paths) {
    const segs = path.split(STATE_SEP);
    if (!validPath(segs)) continue; // carimbo órfão ou payload torto

    const ta = num(a.t?.[path]);
    const tb = num(b.t?.[path]);
    const va = readPath(a, segs);
    const vb = readPath(b, segs);

    const win = ta === tb ? tiebreak(va, vb) : ta > tb ? va : vb;
    if (win !== undefined) writePath(out, segs, win);

    // Carimbo sobrevive mesmo sem valor: é ele que faz o "desmarcado" viajar
    // em vez de ser ressuscitado pelo outro aparelho.
    const tm = Math.max(ta, tb);
    if (tm > 0) out.t[path] = tm;
  }

  return out;
}

/**
 * JSON com as chaves ordenadas, para comparar dois estados por conteúdo.
 *
 * `merge` monta um objeto novo, então a ordem das chaves quase nunca bate com
 * a do original mesmo quando nada mudou. Sem isto, o cliente gravaria e
 * anunciaria "sincronizado" a cada verificação, e o servidor gravaria uma
 * revisão nova a cada requisição de cada aparelho.
 *
 * `view` fica de fora: é preferência local e não deve contar como diferença.
 */
export function canonical(doc: unknown): string {
  const walk = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) return v;
    const o = v as Record<string, unknown>;
    return Object.fromEntries(Object.keys(o).sort().map((k) => [k, walk(o[k])]));
  };
  if (doc !== null && typeof doc === 'object' && !Array.isArray(doc)) {
    const { view: _local, ...rest } = doc as Record<string, unknown>;
    return JSON.stringify(walk(rest));
  }
  return JSON.stringify(walk(doc));
}

/** Um minuto de folga para relógio de aparelho fora de hora. */
const SKEW_MS = 60 * 1000;

/**
 * Limita carimbos vindos do futuro. Alterna o estado recebido e o devolve.
 *
 * Um celular com o relógio adiantado carimbaria tudo à frente e venceria
 * qualquer alteração futura, de qualquer aparelho, para sempre — e não há como
 * consertar isso depois, porque o carimbo errado já está gravado.
 *
 * O conserto óbvio seria carimbar tudo na chegada ao servidor, mas isso quebra
 * o offline: uma marcação feita ontem sem sinal viraria mais nova que uma
 * marcação feita hoje online, invertendo a ordem real dos fatos. Por isso
 * limitar, e não substituir.
 */
export function clampFuture(st: JournalState, now: number): JournalState {
  const cap = now + SKEW_MS;
  for (const path of Object.keys(rec(st.t))) {
    const v = num(st.t[path]);
    st.t[path] = v > cap ? cap : v;
  }
  return st;
}

/** Noventa dias: tempo de sobra para um aparelho esquecido voltar a abrir. */
const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Descarta carimbos de chaves que não têm mais valor e já são antigas.
 *
 * O mapa `t` cresce para sempre — cada desmarcação deixa um carimbo que nunca
 * mais some. São uns poucos kB por ano, então isto é higiene, não urgência.
 *
 * O risco é real, porém: um aparelho que não abre há mais tempo que o prazo e
 * ainda tem o valor antigo vai ressuscitá-lo ao voltar, porque não sobrou
 * carimbo para dizer que aquilo foi apagado. Daí o prazo largo.
 */
export function pruneTombstones(st: JournalState, now: number): JournalState {
  for (const path of Object.keys(rec(st.t))) {
    if (now - num(st.t[path]) < TOMBSTONE_TTL_MS) continue;
    if (readPath(st, path.split(STATE_SEP)) === undefined) delete st.t[path];
  }
  return st;
}
