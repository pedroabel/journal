import { JPHASES } from '@/lib/plan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from '../Section';
import { tone } from '../tone';

export default function Fases() {
  return (
    <Section id="fases" index="◆" eyebrow="Prioridade por período" title="Fases">
      {JPHASES.map((f) => (
        <Card key={f.n} style={tone(f.c)} className="relative gap-4 overflow-hidden">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-[var(--tone)]" />
          <CardHeader>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <CardTitle className="text-base">{f.n}</CardTitle>
              <span className="text-[var(--tone)] font-mono text-xs">{f.d}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted/60 rounded-md px-3 py-2">
              <span className="text-muted-foreground block font-mono text-[0.625rem] tracking-wider uppercase">
                Prioridade
              </span>
              <p className="mt-0.5 text-sm leading-relaxed">{f.prioridade}</p>
            </div>
            <ul className="space-y-1.5">
              {f.itens.map((it) => (
                <li key={it} className="text-muted-foreground flex gap-2.5 text-sm">
                  <span aria-hidden className="bg-[var(--tone)] mt-2 size-1 shrink-0 rounded-full" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </Section>
  );
}
