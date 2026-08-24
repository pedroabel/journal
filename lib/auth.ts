/**
 * Autenticação de dono único.
 *
 * Não há cadastro nem banco de usuários: existe uma senha, guardada apenas
 * como hash scrypt em variável de ambiente. O login troca a senha por um JWT
 * assinado, entregue em cookie httpOnly — o middleware valida esse cookie na
 * borda, antes de qualquer página ser renderizada.
 *
 * scrypt roda só no runtime Node (rota de login). O middleware roda no Edge e
 * por isso usa apenas `jose`, que funciona nos dois.
 */
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'journal_session';
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 dias

function secretKey(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error('AUTH_SECRET ausente ou curto demais (mínimo 32 caracteres)');
  }
  return new TextEncoder().encode(s);
}

export async function createSession(): Promise<string> {
  return new SignJWT({ sub: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(secretKey());
}

/** true só se o token for íntegro, assinado por nós e não expirado. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,                                  // JavaScript da página não lê
  secure: process.env.NODE_ENV === 'production',   // só por HTTPS
  sameSite: 'lax' as const,                        // não viaja em requisição de terceiro
  path: '/',
  maxAge: SESSION_TTL,
};
