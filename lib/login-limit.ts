/**
 * Limite de tentativas de login, com o contador no banco.
 *
 * Por que não bastava contar em memória: na Vercel cada requisição pode cair
 * numa instância diferente, e cada instância tem o próprio `Map`. Um limite de
 * 10 por instância não é um limite de 10 — é 10 vezes quantas instâncias
 * existirem naquele momento, número que ninguém controla. No Postgres o
 * contador é um só, e o limite passa a ser o que está escrito aqui.
 *
 * Isso importa porque é o freio que substitui o comprimento da senha. Como o
 * hash `scrypt` nunca sai do servidor, o único ataque possível é adivinhar
 * pela porta da frente; com 5 tentativas a cada 15 minutos, mesmo uma senha
 * curta leva tempo demais para ser encontrada.
 *
 * O contador em memória continua existindo em paralelo, como rede de proteção:
 * se o banco estiver fora, ele ainda segura alguma coisa. Os dois são
 * consultados, e qualquer um dos dois pode barrar.
 *
 * Limite por IP, e não global: um teto global no total de tentativas seria
 * contornável por quem trocasse de IP e, pior, permitiria que alguém deixasse
 * VOCÊ trancado do lado de fora só mantendo o contador cheio.
 */
import { once, sql } from './sql';

const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const PURGE_MS = 24 * 60 * 60 * 1000; // linhas velhas somem; a tabela não cresce

const ensure = once(async () => {
  await sql()`
    create table if not exists login_attempts (
      ip           text primary key,
      fails        integer not null,
      window_start timestamptz not null
    )
  `;
});

/* --- rede de proteção em memória ------------------------------------------ */

const memory = new Map<string, { fails: number; until: number }>();

function memoryBlocked(ip: string): boolean {
  const rec = memory.get(ip);
  if (!rec) return false;
  if (Date.now() > rec.until) {
    memory.delete(ip);
    return false;
  }
  return rec.fails >= LIMIT;
}

function memoryRecord(ip: string): void {
  const rec = memory.get(ip);
  if (!rec || Date.now() > rec.until) memory.set(ip, { fails: 1, until: Date.now() + WINDOW_MS });
  else rec.fails += 1;
}

/* --- contador no banco ----------------------------------------------------- */

function cutoff(): string {
  return new Date(Date.now() - WINDOW_MS).toISOString();
}

/** `true` quando este IP já gastou as tentativas da janela. */
export async function loginBlocked(ip: string): Promise<boolean> {
  if (memoryBlocked(ip)) return true;
  try {
    await ensure();
    const rows = (await sql()`
      select fails from login_attempts
       where ip = ${ip} and window_start > ${cutoff()}
    `) as Array<{ fails: number }>;
    return rows.length > 0 && Number(rows[0].fails) >= LIMIT;
  } catch {
    // Banco fora não pode trancar o dono do lado de fora: quem decide o acesso
    // é a senha, e ela continua sendo conferida com o mesmo custo de `scrypt`.
    return false;
  }
}

export async function recordLoginFailure(ip: string): Promise<void> {
  memoryRecord(ip);
  try {
    await ensure();
    const since = cutoff();
    await sql()`
      insert into login_attempts (ip, fails, window_start)
      values (${ip}, 1, now())
      on conflict (ip) do update set
        fails = case when login_attempts.window_start > ${since}
                     then login_attempts.fails + 1 else 1 end,
        window_start = case when login_attempts.window_start > ${since}
                            then login_attempts.window_start else now() end
    `;
    await sql()`
      delete from login_attempts where window_start < ${new Date(Date.now() - PURGE_MS).toISOString()}
    `;
  } catch {
    // O contador em memória já registrou; falhar aqui não pode derrubar o login.
  }
}

/** Acertou a senha: zera o contador deste IP. */
export async function clearLoginFailures(ip: string): Promise<void> {
  memory.delete(ip);
  try {
    await ensure();
    await sql()`delete from login_attempts where ip = ${ip}`;
  } catch {
    // idem
  }
}

/**
 * IP de quem chamou. Na Vercel o cabeçalho é reescrito na borda, então o
 * cliente não escolhe o próprio identificador.
 */
export function callerIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'local';
}
