import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from '../Section';
import { tone } from '../tone';

const FASES: { n: string; d: string; c: string; prioridade: string; itens: string[] }[] = [
  {
    n: 'Fase 1 — Fundação e credencial',
    d: 'ago/2026 → jul/2027',
    c: '--chart-3',
    prioridade: 'Consistência e destravar a fala. Nada mais importa se a rotina não pegar.',
    itens: [
      'Rotina (almoço + noite) rodando de forma estável',
      'Sono regular: ~23:00 / 06:30, cochilo curto',
      'Inglês: output diário + tutor até o 3º mês',
      'CS50 em sprint · 1º projeto no ar · LinkedIn em inglês',
      'Poupança iniciada · planilha de custos reais',
      'Passaporte conferido',
    ],
  },
  {
    n: 'Fase 2 — Prova e aplicação',
    d: 'ago/2027 → jul/2028',
    c: '--chart-2',
    prioridade: 'Gerar as provas: uma nota, um certificado, aplicações enviadas, emprego novo.',
    itens: [
      'IELTS feito com a banda exigida',
      '3 escolas escolhidas e aplicações submetidas',
      'Carta de aceite até jun/2028',
      '2º e 3º projeto no ar · DSA coberto',
      'Emprego novo assinado (ideal: remoto internacional)',
      'SinPro faturando',
    ],
  },
  {
    n: 'Fase 3 — Saída e chegada',
    d: 'ago/2028 → jun/2029',
    c: '--chart-4',
    prioridade: 'Logística, não aprendizado. Executar a mudança sem sustos.',
    itens: [
      'Fundos comprovados · visto aprovado',
      'Passagem comprada · casa e cães resolvidos',
      'Primeiro dia de aula',
      'Explorar o país e viver a experiência',
      'Iniciar a janela de 24 meses do Stamp 1G',
    ],
  },
];

export default function Fases() {
  return (
    <Section id="fases" index="◆" eyebrow="Prioridade por período" title="Fases">
      {FASES.map((f) => (
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
