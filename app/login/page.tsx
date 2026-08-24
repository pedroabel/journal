export const metadata = { title: 'Entrar · Sistema Unificado' };

/**
 * Tela de entrada. Um botão, nenhum campo.
 *
 * Não há formulário nem JavaScript de cliente porque não há nada para digitar:
 * quem confirma a identidade é o Google, e o site só aceita ou recusa o
 * resultado. É por isso que também não existe limite de tentativas — não há
 * o que tentar.
 */

const MOTIVOS: Record<string, string> = {
  state: 'o login demorou demais ou foi aberto em outra aba. Tente de novo.',
  exchange: 'o Google não confirmou o acesso. Tente de novo.',
  identity: 'não foi possível confirmar a identidade da conta.',
  not_allowed: 'esta conta não tem acesso a este diário.',
  config: 'falta configurar o acesso do Google no servidor.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const erro = (await searchParams).erro;
  const aviso = typeof erro === 'string' ? MOTIVOS[erro] : undefined;

  return (
    <main className="loginwrap">
      <div className="lockbox">
        <span className="kicker">Fonte única de referência</span>
        <h3>Sistema Unificado</h3>
        <p>Este diário é privado. Entre com a conta de sempre.</p>
        <div className="lockmsg">{aviso}</div>
        <div className="lockbtns">
          <a className="lockgo" href="/api/auth/start">Entrar com Google</a>
        </div>
      </div>
    </main>
  );
}
