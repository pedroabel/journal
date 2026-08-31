import { DECISOES } from '@/lib/plan';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '../Section';

export default function Decisoes() {
  return (
    <Section
      id="decisoes"
      index="◆"
      eyebrow="Consolidação"
      title="Decisões"
      description="As escolhas de projeto deste sistema, e o porquê de cada uma."
    >
      <div className="space-y-2.5">
        {DECISOES.map(([q, a]) => (
          <Card key={q} className="border-l-primary/40 gap-1.5 rounded-l-sm border-l-2 py-4">
            <CardContent className="space-y-1">
              <p className="text-sm font-semibold tracking-tight">{q}</p>
              {/* O texto do plano traz <b> embutido; é conteúdo do próprio autor. */}
              <p
                className="text-muted-foreground text-sm leading-relaxed [&_b]:text-foreground [&_b]:font-medium"
                dangerouslySetInnerHTML={{ __html: a }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
