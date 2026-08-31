import { Sparkles } from 'lucide-react';

import { ANTIPROC, METHODS } from '@/lib/plan';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionTitle } from '../Section';
import { tone } from '../tone';

const FREIOS: { c: string; title: string; body: React.ReactNode }[] = [
  {
    c: '--chart-3',
    title: 'Freio físico',
    body: (
      <>
        Não lute com força de vontade. Rotina de pouso fixa ao chegar (janta, cães, banho), e só
        então comece pequeno. Em dia esgotado, <B>dia mínimo viável</B>.
      </>
    ),
  },
  {
    c: '--chart-1',
    title: 'Freio mental',
    body: (
      <>
        Descansado mas fugindo pro celular: <B>design de fricção</B> (celular em outro cômodo),
        tarefa já decidida e a <B>regra dos 2 minutos</B>.
      </>
    ),
  },
];

export default function Metodos() {
  return (
    <Section id="metodos" index="◆" eyebrow="Por que assim" title="Métodos & Energia">
      <div className="space-y-3">
        <SectionTitle>Aprendizagem</SectionTitle>
        <NoteGrid items={METHODS} />
      </div>

      <div className="space-y-3">
        <SectionTitle>Gestão de energia</SectionTitle>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Seu cansaço não é preguiça: é <B>ciclo de sono mal administrado</B>. Irregular → acorda
          cansado → chega exausto → cochila → o cochilo tira o sono → dorme tarde → repete. O
          cochilo longo é o elo que quebra tudo.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {FREIOS.map((f) => (
            <Card key={f.title} style={tone(f.c)} className="relative gap-2 overflow-hidden py-4">
              <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-[var(--tone)]" />
              <CardContent className="space-y-1">
                <p className="text-sm font-semibold tracking-tight">{f.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionTitle>Anti-procrastinação</SectionTitle>
        <NoteGrid items={ANTIPROC} />
      </div>

      <Alert variant="success">
        <Sparkles />
        <AlertTitle>Nos dias difíceis</AlertTitle>
        <AlertDescription>
          <p>O objetivo nunca foi um dia perfeito — foi não quebrar a corrente. Um dia mínimo ainda é
            vitória.</p>
        </AlertDescription>
      </Alert>
    </Section>
  );
}

function NoteGrid({ items }: { items: string[][] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([title, desc]) => (
        <Card key={title} className="gap-1.5 py-4">
          <CardContent className="space-y-1">
            <p className="text-sm font-semibold tracking-tight">{title}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return <b className="text-foreground font-medium">{children}</b>;
}
