import { ArrowRight } from 'lucide-react';

import { DEPS } from '@/lib/plan';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionTitle } from '../Section';

export default function Dependencias() {
  return (
    <Section
      id="deps"
      index="◆"
      eyebrow="Ordem ideal"
      title="Dependências"
      description={
        <>
          Cadeias de atividade. As marcadas como{' '}
          <b className="text-foreground font-medium">bloqueante</b> não têm atalho.
        </>
      }
    >
      <div className="space-y-2.5">
        {DEPS.map((d) => (
          <Card key={d.chain.join('>')} className="gap-2 py-4">
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-xs [overflow-wrap:anywhere]">
                {d.chain.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    {i > 0 && <ArrowRight className="text-muted-foreground/60 size-3.5 shrink-0" />}
                    <span className={i === d.chain.length - 1 ? 'text-foreground font-medium' : ''}>
                      {step}
                    </span>
                  </span>
                ))}
                {d.b && (
                  <Badge
                    variant="warning"
                    className="rounded-full text-[0.625rem] tracking-wider uppercase"
                  >
                    bloqueante
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{d.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <SectionTitle>Em uma frase</SectionTitle>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Estabilize o <B>sono</B> → destrave o <B>inglês falado</B> (cadeia mais longa, começa
          hoje) → acumule <B>credenciais e portfólio</B> em paralelo → <B>IELTS</B> → <B>emprego</B>{' '}
          → <B>candidatura</B> → com o aceite, <B>visto e logística</B> → parta. O dinheiro corre
          por baixo, todo mês, sem depender de nada.
        </p>
      </div>
    </Section>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return <b className="text-foreground font-medium">{children}</b>;
}
