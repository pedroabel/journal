import { PLANO } from '@/lib/plan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from '../Section';
import { tone } from '../tone';

export default function PlanoDeAcao() {
  return (
    <Section id="plano" index="◆" eyebrow="Todas as atividades" title="Plano de Ação">
      <div className="grid gap-3 sm:grid-cols-2">
        {PLANO.map((p) => (
          <Card key={p.area} style={tone(p.color)} className="relative gap-3 overflow-hidden">
            <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--tone)]" />
            <CardHeader>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle className="text-base">{p.area}</CardTitle>
                <span className="text-[var(--tone)] font-mono text-xs">{p.freq}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {p.acoes.map((a) => (
                  <li key={a} className="text-muted-foreground flex gap-2.5 text-sm">
                    <span aria-hidden className="bg-[var(--tone)] mt-2 size-1 shrink-0 rounded-full" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
