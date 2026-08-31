import { CircleAlert, Sparkles } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionTitle } from '../Section';

const ALAVANCAS: [string, string, string][] = [
  ['01', 'Inglês — o portão.', 'IELTS com a banda da escola. Compreensão já é C2; falta produção.'],
  ['02', 'Dinheiro — o combustível.', 'R$2.500/mês + renda do SinPro (roda no expediente).'],
  ['03', 'Currículo — a tração.', 'CS50, roadmap, DSA, portfólio. Aplicar desde já, inclusive remoto internacional.'],
];

export default function Norte() {
  return (
    <Section
      id="norte"
      index="◆"
      eyebrow="Estratégia"
      title="O Norte"
      description={
        <>
          Todo objetivo serve a um só:{' '}
          <mark className="bg-primary/10 text-foreground rounded px-1 font-medium">
            emigrar e construir carreira fora
          </mark>
          . O que não te aproxima da Irlanda ou não te sustenta no caminho desce de prioridade.
        </>
      }
    >
      <div className="space-y-3">
        <SectionTitle>A rota</SectionTitle>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Um curso <B>nível 9 na Irlanda</B> — mestrado ou <B>Postgraduate Diploma</B> (mais curto e
          barato, mesmo direito). Ao concluir: <B>Stamp 1G</B>, até{' '}
          <mark className="bg-primary/10 text-foreground rounded px-1 font-medium">24 meses</mark>{' '}
          trabalhando em tempo integral sem patrocínio. Com emprego nessa janela, migra para
          autorização de longo prazo e, com o tempo, residência.{' '}
          <B>Intake alvo: setembro/2028</B> — e o seguinte, janeiro/2029, se a conta não
          fechar. Adiar é saída prevista, não atraso.
        </p>

        <Alert variant="warning">
          <CircleAlert />
          <AlertTitle>Armadilha de nome</AlertTitle>
          <AlertDescription>
            <p>Especialização ou MBA lato sensu no Brasil não serve — não dá visto nem permanência. O
              que destrava os 24 meses é nível 9 <B>feito na Irlanda</B>. Fora de Dublin (Cork,
              Galway) o custo cai bastante.</p>
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-3">
        <SectionTitle>As três alavancas</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {ALAVANCAS.map(([n, title, desc]) => (
            <Card key={n} className="gap-2 py-4">
              <CardContent className="space-y-1">
                <span className="text-muted-foreground font-mono text-xs">{n}</span>
                <p className="text-sm font-semibold tracking-tight">{title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionTitle>A conta honesta</SectionTitle>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          O visto exige a mensalidade do 1º ano <B>+ ~€10.000</B> de custo de vida; o gasto real do
          ano fica entre <B>€27.000 e €38.000</B>. Sua poupança sozinha não cobre. Por isso{' '}
          <B>PgDip + cidade fora de Dublin + meio período durante o curso + SinPro + eventual bolsa</B>{' '}
          não são extras: são o que fecha a conta.
        </p>

        <Alert variant="success">
          <Sparkles />
          <AlertTitle>A seu favor</AlertTitle>
          <AlertDescription>
            <p>Sendo C2 na compreensão, reading e listening puxam sua média no IELTS — o trabalho
              concentra-se em speaking e writing. Isso põe a prova em 2027/início de 2028 e torna o
              intake de set/2028 realista.</p>
          </AlertDescription>
        </Alert>
      </div>
    </Section>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return <b className="text-foreground font-medium">{children}</b>;
}
