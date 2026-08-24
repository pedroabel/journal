import { NextResponse } from 'next/server';
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { finishLogin, OAUTH_STATE_COOKIE } from '@/lib/oauth';

export const runtime = 'nodejs';

/**
 * Volta do Google. Se for o dono, emite a sessão do site — o mesmo JWT no
 * mesmo cookie de sempre. Daqui em diante o Google não participa de mais nada.
 *
 * O motivo da recusa vai na URL para a tela de login saber o que dizer, mas
 * sem detalhe que ajude quem estiver tentando entrar: "não é a conta certa"
 * não revela qual seria.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.slice(OAUTH_STATE_COOKIE.length + 1);

  const result = await finishLogin(request, cookie ? decodeURIComponent(cookie) : undefined);

  const response = result.ok
    ? NextResponse.redirect(new URL('/', request.url))
    : NextResponse.redirect(new URL(`/login?erro=${result.reason}`, request.url));

  // O cookie do aperto de mão serve uma vez só.
  response.cookies.delete(OAUTH_STATE_COOKIE);
  if (result.ok) {
    response.cookies.set(SESSION_COOKIE, await createSession(), sessionCookieOptions);
  }
  return response;
}
