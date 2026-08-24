/**
 * Entrada pelo Google. Não há senha em lugar nenhum deste projeto.
 *
 * A troca de uma senha por um provedor externo não é preguiça: some tudo o
 * que a senha arrastava junto. Não há hash para guardar, não há o que
 * memorizar nem digitar no celular, não há o que adivinhar — e por isso não
 * há contador de tentativas, nem a possibilidade de você ficar trancado do
 * lado de fora do próprio diário. Trocar a senha deixa de existir como tarefa.
 *
 * O que entra no lugar é curto: o Google confirma quem é você, este arquivo
 * confere se esse "quem" é o dono, e a sessão continua sendo a mesma de antes
 * — o JWT assinado em `lib/auth.ts`, no mesmo cookie, validado pelo mesmo
 * `proxy.ts`. O Google participa do login e nada mais; não é ele que guarda a
 * sessão nem enxerga o diário.
 *
 * Escrito à mão em vez de com uma biblioteca de autenticação porque para um
 * dono só o fluxo cabe em um arquivo, e `jose` — que já está aqui para as
 * sessões — resolve a parte criptográfica.
 */
import { createRemoteJWKSet, jwtVerify } from 'jose';

const AUTHORIZE = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN = 'https://oauth2.googleapis.com/token';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

/** Só o necessário para saber quem é: nada de contatos, agenda ou arquivos. */
const SCOPE = 'openid email';

export const OAUTH_STATE_COOKIE = 'journal_oauth';

export function clientId(): string {
  const v = process.env.GOOGLE_CLIENT_ID;
  if (!v) throw new Error('GOOGLE_CLIENT_ID ausente');
  return v;
}

function clientSecret(): string {
  const v = process.env.GOOGLE_CLIENT_SECRET;
  if (!v) throw new Error('GOOGLE_CLIENT_SECRET ausente');
  return v;
}

/**
 * Quem pode entrar. Uma lista, separada por vírgula — o normal é ter um nome
 * só. Sem ela o site não abre para ninguém: preferir portão trancado a portão
 * aberto quando a configuração falta.
 */
function allowed(): string[] {
  return (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * O endereço de volta precisa ser idêntico ao cadastrado no Google, então é
 * derivado da requisição em vez de escrito à mão em duas listas que depois
 * divergem. `x-forwarded-proto` porque atrás do proxy da Vercel a requisição
 * chega como http.
 */
export function callbackUrl(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') ?? url.host;
  const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  return `${proto}://${host}/api/auth/callback`;
}

/* --- ida ------------------------------------------------------------------- */

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

export interface Handshake {
  url: string;
  /** Vai num cookie de vida curta e é conferido na volta. */
  cookie: string;
}

/**
 * Monta o endereço do Google e o segredo que prova, na volta, que a resposta
 * pertence a este pedido.
 *
 * `state` existe contra CSRF: sem ele, alguém poderia induzir o teu navegador
 * a completar um login que quem começou foi outra pessoa. `code_verifier` é o
 * PKCE — se o código de autorização vazasse do histórico ou de um log, ele
 * sozinho não valeria nada sem este segredo, que nunca sai daqui.
 */
export async function startLogin(request: Request): Promise<Handshake> {
  const state = base64url(crypto.getRandomValues(new Uint8Array(24)));
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(await sha256(verifier));

  const url = new URL(AUTHORIZE);
  url.searchParams.set('client_id', clientId());
  url.searchParams.set('redirect_uri', callbackUrl(request));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', SCOPE);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  // Evita a tela de escolha de conta quando já há sessão do Google aberta.
  url.searchParams.set('prompt', 'select_account');

  return { url: url.toString(), cookie: `${state}.${verifier}` };
}

/* --- volta ----------------------------------------------------------------- */

export type LoginResult =
  | { ok: true; email: string }
  | { ok: false; reason: 'state' | 'exchange' | 'identity' | 'not_allowed' };

/**
 * Confere a resposta do Google e diz se é o dono.
 *
 * A identidade sai do `id_token`, com assinatura verificada contra as chaves
 * públicas do Google, emissor e destinatário conferidos. Não basta o endereço
 * bater: `email_verified` precisa ser verdadeiro, senão bastaria alguém criar
 * uma conta declarando o teu e-mail.
 */
export async function finishLogin(request: Request, cookie: string | undefined): Promise<LoginResult> {
  const params = new URL(request.url).searchParams;
  const code = params.get('code');
  const state = params.get('state');

  const [expectedState, verifier] = (cookie ?? '').split('.');
  if (!code || !state || !expectedState || !verifier || state !== expectedState) {
    return { ok: false, reason: 'state' };
  }

  let idToken: string;
  try {
    const res = await fetch(TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId(),
        client_secret: clientSecret(),
        redirect_uri: callbackUrl(request),
        grant_type: 'authorization_code',
        code_verifier: verifier,
      }),
    });
    if (!res.ok) return { ok: false, reason: 'exchange' };
    const body = (await res.json()) as { id_token?: string };
    if (!body.id_token) return { ok: false, reason: 'exchange' };
    idToken = body.id_token;
  } catch {
    return { ok: false, reason: 'exchange' };
  }

  let email: string;
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: ISSUERS,
      audience: clientId(),
    });
    const claimed = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    if (!claimed || payload.email_verified !== true) return { ok: false, reason: 'identity' };
    email = claimed;
  } catch {
    return { ok: false, reason: 'identity' };
  }

  if (!allowed().includes(email)) return { ok: false, reason: 'not_allowed' };
  return { ok: true, email };
}
