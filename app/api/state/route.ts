import { NextResponse } from 'next/server';
import { canonical, clampFuture, merge, pruneTombstones } from '@/lib/merge';
import { readState, writeState } from '@/lib/db';
import { adopt } from '@/lib/state';

// O driver do Neon é HTTP e roda nos dois runtimes; Node fica alinhado com o
// resto das rotas e com o `scrypt` do login.
export const runtime = 'nodejs';

/**
 * Sincronização entre aparelhos — uma rota, um verbo.
 *
 * O aparelho manda o estado que tem; a resposta é a verdade fundida. Não há
 * GET separado: mandar um estado vazio já é o "só me diga o que existe".
 * Não há versão no protocolo, nem 409, nem tela de conflito — a fusão é
 * comutativa e idempotente (ver `lib/merge.ts`), então reenviar depois de uma
 * falha de rede é inofensivo, e é isso que faz o modo offline funcionar sem
 * fila de pendências.
 *
 * A sessão já foi checada pelo `proxy.ts` antes de chegar aqui.
 */

const MAX_BODY = 4 * 1024 * 1024; // o progresso é kB; isto é folga larga
const ATTEMPTS = 4;               // tentativas de CAS antes de desistir

export async function POST(request: Request): Promise<NextResponse> {
  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const now = Date.now();
  // O relógio de quem envia não é confiável; o daqui é.
  const incoming = clampFuture(adopt(parsed), now);

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const current = await readState();
    const stored = adopt(current?.doc);
    const merged = pruneTombstones(merge(stored, incoming), now);

    // `view` é preferência de aparelho: não é guardada nem devolvida.
    const { view: _local, ...doc } = merged;

    // Nada mudou: sem gravação, sem revisão nova. Sem isto, cada verificação
    // de cada aparelho — inclusive as automáticas — escreveria no banco.
    if (current && canonical(stored) === canonical(doc)) {
      return NextResponse.json(doc);
    }

    if (await writeState(current?.rev ?? null, doc)) {
      return NextResponse.json(doc);
    }
    // Perdeu a corrida para o outro aparelho: relê e refunde.
  }

  // Quatro derrotas seguidas não acontecem com um dono só; se acontecer, o
  // cliente tenta de novo sozinho no próximo gatilho.
  return NextResponse.json({ error: 'busy' }, { status: 503 });
}
