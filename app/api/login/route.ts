import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/password';
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { callerIp, clearLoginFailures, loginBlocked, recordLoginFailure } from '@/lib/login-limit';

// scrypt precisa do node:crypto — esta rota não roda no Edge.
export const runtime = 'nodejs';

/**
 * Duas barreiras contra quem tenta adivinhar a senha.
 *
 * A primeira é o custo: cada tentativa paga um `scrypt` de ~100ms, no
 * servidor, sempre — inclusive as erradas.
 *
 * A segunda é o contador em `lib/login-limit.ts`, que vive no banco. Ele
 * precisa ficar fora da memória do processo porque na Vercel cada requisição
 * pode cair numa instância diferente, e um limite por instância não limita
 * nada. É esse contador que permite uma senha curta ser segura: como o hash
 * nunca sai do servidor, adivinhar só é possível pela porta da frente.
 */

export async function POST(request: Request): Promise<NextResponse> {
  const ip = callerIp(request);

  if (await loginBlocked(ip)) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429 });
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (!(await verifyPassword(password))) {
    await recordLoginFailure(ip);
    // Mensagem única: não distingue "senha errada" de "servidor mal configurado".
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  await clearLoginFailures(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSession(), sessionCookieOptions);
  return response;
}
