/**
 * Cliente do Postgres (Neon), compartilhado.
 *
 * O driver é HTTP: cada consulta é uma requisição, sem conexão persistente e
 * sem pool para gerenciar. É o que serve numa função serverless, onde a
 * instância pode morrer entre uma requisição e outra.
 */
import { neon } from '@neondatabase/serverless';

type Sql = ReturnType<typeof neon>;

let cached: Sql | null = null;

export function sql(): Sql {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ausente');
  cached = neon(url);
  return cached;
}

/**
 * `create table if not exists` na primeira vez de cada instância fria.
 *
 * Uma consulta a mais por instância, e o projeto não precisa de um passo de
 * migração manual. Se falhar, esquece a promessa: a próxima requisição tenta
 * de novo em vez de ficar presa a um erro antigo.
 */
export function once(run: () => Promise<void>): () => Promise<void> {
  let started: Promise<void> | null = null;
  return () => {
    started ??= run().catch((e) => {
      started = null;
      throw e;
    });
    return started;
  };
}
