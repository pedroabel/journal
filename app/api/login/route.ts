import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/password';
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

// scrypt precisa do node:crypto — esta rota não roda no Edge.
export const runtime = 'nodejs';

/**
 * Uma tentativa custa um scrypt (~100ms), o que já limita força bruta online.
 * Este contador acrescenta um teto por instância: barato, e some sozinho.
 */
const attempts = new Map<string, { n: number; until: number }>();
const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

function tooMany(ip: string): boolean {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (Date.now() > rec.until) { attempts.delete(ip); return false; }
  return rec.n >= LIMIT;
}

function recordFailure(ip: string): void {
  const rec = attempts.get(ip);
  if (!rec || Date.now() > rec.until) {
    attempts.set(ip, { n: 1, until: Date.now() + WINDOW_MS });
  } else {
    rec.n += 1;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';

  if (tooMany(ip)) {
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
    recordFailure(ip);
    // Mensagem única: não distingue "senha errada" de "servidor mal configurado".
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSession(), sessionCookieOptions);
  return response;
}
