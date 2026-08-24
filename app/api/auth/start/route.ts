import { NextResponse } from 'next/server';
import { OAUTH_STATE_COOKIE, startLogin } from '@/lib/oauth';

export const runtime = 'nodejs';

/**
 * Começo do login: manda para o Google e guarda, num cookie de vida curta, o
 * segredo que a volta precisa apresentar.
 *
 * `sameSite: 'lax'` é obrigatório aqui — em `strict` o cookie não acompanharia
 * a navegação de volta vinda do domínio do Google, e todo login falharia na
 * conferência de `state`.
 */
export async function GET(request: Request): Promise<NextResponse> {
  let handshake;
  try {
    handshake = await startLogin(request);
  } catch {
    // Falta GOOGLE_CLIENT_ID: erro de configuração, não do visitante.
    return NextResponse.redirect(new URL('/login?erro=config', request.url));
  }

  const response = NextResponse.redirect(handshake.url);
  response.cookies.set(OAUTH_STATE_COOKIE, handshake.cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // dez minutos para completar o login
  });
  return response;
}
