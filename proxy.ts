import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

/**
 * Barreira única do site. Roda antes de qualquer página ou rota de API: sem
 * sessão válida, o HTML nem chega a ser gerado. É o que diferencia isto de uma
 * tela de senha em JavaScript, que só esconde conteúdo já entregue.
 *
 * Chamava-se `middleware` até o Next 15; no 16 a convenção é `proxy`.
 */
export async function proxy(request: NextRequest) {
  const ok = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  // API responde 401; navegação vai para o login.
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  // Tudo é protegido, menos o próprio login, os endpoints de sessão e os
  // estáticos do build (que não contêm dado nenhum do plano).
  matcher: ['/((?!login|api/auth|api/logout|_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
