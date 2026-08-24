/**
 * Acesso ao Postgres (Neon). Uma linha, o progresso inteiro.
 *
 * Não há tabela por marcação nem por dia: o estado é pequeno (kB) e sempre
 * lido e escrito por completo, então uma linha com um `jsonb` evita um esquema
 * que precisaria migrar toda vez que o plano ganhasse um campo novo.
 *
 * A concorrência que existe de verdade é duas abas gravando quase junto —
 * celular e notebook. Ler, fundir e gravar não é atômico, então a gravação usa
 * CAS: só entra se a revisão ainda for a que foi lida. Perdeu a corrida, lê de
 * novo e refunde. Dá para fazer com transação e `select ... for update`, mas
 * isso exige conexão com sessão; o driver HTTP do Neon é uma requisição por
 * consulta, que é o que serve bem numa função serverless.
 */
import { neon } from '@neondatabase/serverless';

const ROW_ID = 'me';

type Sql = ReturnType<typeof neon>;

let cached: Sql | null = null;

function sql(): Sql {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ausente');
  cached = neon(url);
  return cached;
}

/**
 * `create table if not exists` a cada instância fria. É uma consulta a mais
 * na primeira requisição de cada instância, e poupa um passo manual de
 * migração num projeto de uma tabela só.
 *
 * `rev` é `integer` e não `bigint` de propósito: `bigint` volta como string no
 * driver, e 2 bilhões de sincronizações não vão acontecer.
 */
let schema: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  schema ??= (async () => {
    await sql()`
      create table if not exists journal_state (
        id         text primary key,
        rev        integer not null default 0,
        doc        jsonb not null,
        updated_at timestamptz not null default now()
      )
    `;
  })().catch((e) => {
    schema = null; // falhou: a próxima requisição tenta de novo
    throw e;
  });
  return schema;
}

export interface StoredState {
  rev: number;
  doc: unknown;
}

/** `null` quando ainda não existe nada gravado. */
export async function readState(): Promise<StoredState | null> {
  await ensureSchema();
  const rows = (await sql()`
    select rev, doc from journal_state where id = ${ROW_ID}
  `) as Array<{ rev: number; doc: unknown }>;
  return rows.length ? { rev: Number(rows[0].rev), doc: rows[0].doc } : null;
}

/**
 * Grava se ninguém tiver escrito no meio do caminho. `rev` é a revisão lida
 * antes de fundir, ou `null` se a linha não existia.
 *
 * Devolve `false` quando perdeu a corrida — o chamador relê e tenta de novo.
 */
export async function writeState(rev: number | null, doc: unknown): Promise<boolean> {
  await ensureSchema();
  const json = JSON.stringify(doc);

  if (rev === null) {
    const ins = (await sql()`
      insert into journal_state (id, rev, doc) values (${ROW_ID}, 1, ${json}::jsonb)
      on conflict (id) do nothing
      returning rev
    `) as unknown[];
    return ins.length > 0;
  }

  const upd = (await sql()`
    update journal_state
       set rev = rev + 1, doc = ${json}::jsonb, updated_at = now()
     where id = ${ROW_ID} and rev = ${rev}
    returning rev
  `) as unknown[];
  return upd.length > 0;
}
