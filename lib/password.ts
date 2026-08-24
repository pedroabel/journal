/**
 * Verificação da senha. Runtime Node apenas (usa node:crypto).
 *
 * Formato do hash guardado em AUTH_PASSWORD_HASH:
 *   scrypt:<N>:<r>:<p>:<salt base64>:<derivado base64>
 *
 * Separador `:` e nao `$` de proposito: o carregador de .env do Next expande
 * `$algo` como variavel, o que apagaria pedacos do hash em silencio.
 *
 * scrypt é deliberadamente lento e usa memória: cada tentativa custa caro para
 * quem tenta adivinhar, e o custo fica registrado no próprio hash, então dá
 * para aumentá-lo depois sem invalidar o que já existe.
 */
import { scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

export async function verifyPassword(password: string): Promise<boolean> {
  const stored = process.env.AUTH_PASSWORD_HASH;
  if (!stored) return false;

  const parts = stored.split(':');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, nRaw, rRaw, pRaw, saltB64, hashB64] = parts;
  const N = Number(nRaw), r = Number(rRaw), p = Number(pRaw);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(hashB64, 'base64');

  let derived: Buffer;
  try {
    derived = await scryptAsync(password.normalize('NFKC'), salt, expected.length, {
      N, r, p, maxmem: 256 * 1024 * 1024,
    });
  } catch {
    return false;
  }

  // Comparação de tempo constante: não vaza quantos bytes bateram.
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
