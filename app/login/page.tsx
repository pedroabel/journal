import { KeyRound, ShieldCheck } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="gap-3">
          <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
            <ShieldCheck className="size-4" />
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-wider uppercase">
              Fonte única de referência
            </p>
            <CardTitle className="text-xl">Sistema Unificado</CardTitle>
            <CardDescription>Este diário é privado. Entre com a conta de sempre.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {aviso && (
            <Alert variant="destructive">
              <AlertDescription>
                <p>{aviso}</p>
              </AlertDescription>
            </Alert>
          )}
          <Button asChild className="w-full">
            <a href="/api/auth/start">
              <KeyRound />
              Entrar com Google
            </a>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
