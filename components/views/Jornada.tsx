'use client';

import { ArrowRight, Lock } from 'lucide-react';

import { JPHASES, MS, MSTYPE, QLABEL, QUARTERS } from '@/lib/plan';
import { blockedBy, curQuarter, msDone, msTitle, nextMS, parseD, quarterOf } from '@/lib/derive';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionTitle } from '../Section';
import type { Journal } from '../useJournal';
import { tone } from '../tone';

/** Contagem regressiva do próximo marco: dias quando perto, semanas quando longe. */
function countdown(dateStr: string): { num: number; unit: string } {
  const diff = Math.ceil((parseD(dateStr).getTime() - Date.now()) / 864e5);
  if (diff < 0) {
    const num = Math.abs(diff);
    return { num, unit: num === 1 ? 'dia atrasado' : 'dias atrasado' };
  }
  if (diff <= 14) return { num: diff, unit: diff === 1 ? 'dia' : 'dias' };
  return { num: Math.ceil(diff / 7), unit: 'semanas' };
}

export default function Jornada({ journal }: { journal: Journal }) {
  const { state } = journal;
  const nx = nextMS(state);
  const cq = curQuarter();
  const cqi = QUARTERS.indexOf(cq);
  const blocked = nx ? blockedBy(state, nx) : [];
  const withDeps = MS.filter((m) => (m.dep || []).length > 0);

  return (
    <Section
      index="05"
      eyebrow="3 anos · onde estou na jornada"
      title="Jornada"
      description={
        <>
          Doze trimestres, de ago/2026 a jun/2029.{' '}
          {cqi >= 0 && (
            <>
              Você está no trimestre{' '}
              <b className="text-foreground font-medium">{cqi + 1} de 12</b>.
            </>
          )}
        </>
      }
    >
      {nx && (
        <div className="space-y-3">
          <Card className="bg-muted/40 py-5">
            <CardContent>
              <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-wider uppercase">
                Próximo marco
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl leading-none font-semibold tracking-tight tabular-nums">
                  {countdown(nx.d).num}
                </span>
                <span className="text-muted-foreground font-mono text-sm">
                  {countdown(nx.d).unit}
                </span>
              </div>
              <p className="mt-3 text-base font-semibold tracking-tight text-balance">{nx.t}</p>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                {MSTYPE[nx.ty].n.toLowerCase()} · alvo{' '}
                {parseD(nx.d).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </p>
            </CardContent>
          </Card>

          {blocked.length > 0 && (
            <Alert variant="warning">
              <Lock />
              <AlertTitle>Trava</AlertTitle>
              <AlertDescription>
                <p>Este marco depende de {blocked.map(msTitle).join(' e ')}. Resolva isso antes.</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="space-y-4">
        {JPHASES.map((ph) => (
          <div key={ph.n} style={tone(ph.c)} className="overflow-hidden rounded-xl border">
            <div className="bg-muted/50 relative flex flex-wrap items-baseline justify-between gap-2 py-3 pr-4 pl-4">
              <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--tone)]" />
              <span className="text-sm font-semibold tracking-tight">{ph.n}</span>
              <span className="text-[var(--tone)] font-mono text-xs">{ph.d}</span>
            </div>

            <div className="divide-border divide-y">
              {ph.qs.map((q) => {
                const here = q === cq;
                const qms = MS.filter((m) => quarterOf(m.d) === q)
                  .slice()
                  .sort((a, b) => (a.d < b.d ? -1 : 1));
                return (
                  <div
                    key={q}
                    className={cn(
                      'flex flex-col gap-2 px-4 py-3 sm:flex-row sm:gap-4',
                      here && 'bg-primary/5'
                    )}
                  >
                    <div className="flex shrink-0 items-center gap-2 sm:w-28 sm:flex-col sm:items-start sm:gap-1.5">
                      <span
                        className={cn(
                          'font-mono text-xs',
                          here ? 'text-foreground font-medium' : 'text-muted-foreground'
                        )}
                      >
                        {QLABEL[q]}
                      </span>
                      {here && (
                        <Badge className="rounded-full text-[0.625rem] tracking-wider uppercase">
                          aqui
                        </Badge>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      {qms.length === 0 && <span className="text-muted-foreground text-sm">—</span>}
                      {qms.map((m) => {
                        const ty = MSTYPE[m.ty];
                        const dn = msDone(state, m.id);
                        return (
                          <div
                            key={m.id}
                            style={tone(ty.c)}
                            className={cn(
                              'flex items-baseline gap-2 text-sm',
                              dn && 'text-muted-foreground line-through decoration-1'
                            )}
                          >
                            <Badge
                              variant="outline"
                              className="border-[var(--tone)]/40 text-[var(--tone)] shrink-0 rounded-full font-mono text-[0.625rem]"
                            >
                              {ty.n.slice(0, 3).toLowerCase()}
                            </Badge>
                            <span className="min-w-0">{m.t}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <SectionTitle>Dependências entre marcos</SectionTitle>
        <p className="text-muted-foreground text-sm">
          O que trava o quê. Marcos sem dependência podem ser atacados a qualquer momento.
        </p>

        <div className="space-y-2.5">
          {withDeps.map((m) => {
            const bl = blockedBy(state, m);
            return (
              <Card key={m.id} className="gap-2 py-3.5">
                <CardContent className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-xs">
                  {m.dep.map((d, i) => (
                    <span key={d} className="text-muted-foreground flex items-center gap-2">
                      {i > 0 && <span className="text-muted-foreground/60">+</span>}
                      {msTitle(d)}
                    </span>
                  ))}
                  <ArrowRight className="text-muted-foreground/60 size-3.5 shrink-0" />
                  <b className="text-foreground font-medium">{m.t}</b>
                  <Badge
                    variant={bl.length > 0 ? 'warning' : 'success'}
                    className="rounded-full text-[0.625rem] tracking-wider uppercase"
                  >
                    {bl.length > 0 ? 'travado' : 'liberado'}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Alert variant="success">
        <AlertTitle>Um marco de experiência por trimestre, sempre.</AlertTitle>
        <AlertDescription>
          <p>Você faz essa jornada sozinho — se a única recompensa estivesse em 2029, três anos seria
            tempo demais para aguentar. Os marcos de experiência não servem para o currículo. Servem
            para a viagem valer a pena enquanto ela acontece.</p>
        </AlertDescription>
      </Alert>
    </Section>
  );
}
