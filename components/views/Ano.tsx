'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { AREAS, MONTH_AB, MONTH_NAMES, MS, QLABEL, type AreaKey } from '@/lib/plan';
import { curQuarter, monthStats, msDone, quarterOf, rateFor } from '@/lib/derive';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty';
import { Section, SectionTitle } from '../Section';
import type { Journal } from '../useJournal';
import Milestone from '../Milestone';

export default function Ano({
  journal, selYear, onShift,
}: {
  journal: Journal;
  selYear: number;
  onShift: (years: number) => void;
}) {
  const { state, toggleFlag } = journal;
  const now = new Date();
  const curM = now.getMonth();
  const curY = now.getFullYear();
  const areaKeys = Object.keys(AREAS) as AreaKey[];

  const cq = curQuarter();
  const inQuarter = MS.filter((m) => quarterOf(m.d) === cq);
  const yearMs = MS.filter((m) => m.d.slice(0, 4) === String(selYear))
    .slice()
    .sort((a, b) => (a.d < b.d ? -1 : 1));
  const doneCount = yearMs.filter((m) => msDone(state, m.id)).length;

  return (
    <Section
      index="04"
      eyebrow="Anual · estou saindo do lugar"
      title="Ano"
      description={
        <>
          Sem streak aqui. No ano, o que importa é{' '}
          <b className="text-foreground font-medium">o que ficou pronto</b>.
        </>
      }
      actions={
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={() => onShift(-1)} aria-label="ano anterior">
            <ChevronLeft />
          </Button>
          <span className="min-w-16 text-center text-sm font-medium tabular-nums">{selYear}</span>
          <Button variant="outline" size="icon-sm" onClick={() => onShift(1)} aria-label="próximo ano">
            <ChevronRight />
          </Button>
        </div>
      }
    >
      <Card>
        <CardContent className="space-y-3">
          <div className="no-scrollbar overflow-x-auto">
            <div className="min-w-[34rem] max-w-2xl space-y-1">
              <div className="grid grid-cols-[6rem_repeat(12,1fr)] gap-1">
                <div />
                {MONTH_AB.map((m, i) => (
                  <div
                    key={i}
                    className="text-muted-foreground text-center font-mono text-[0.625rem]"
                  >
                    {m}
                  </div>
                ))}
              </div>

              {areaKeys.map((a) => (
                <div key={a} className="grid grid-cols-[6rem_repeat(12,1fr)] items-center gap-1">
                  <div className="text-muted-foreground pr-2 font-mono text-[0.6875rem]">
                    {AREAS[a].n}
                  </div>
                  {Array.from({ length: 12 }, (_, m) => {
                    const stats = monthStats(state, selYear, m);
                    let tot = 0;
                    let did = 0;
                    for (const t of AREAS[a].t) {
                      const r = rateFor(t, stats);
                      if (r && r.exp) { tot += r.exp; did += r.did; }
                    }
                    const pct = tot ? Math.min(100, did / tot) : 0;
                    const op = pct === 0 ? 0.12 : 0.2 + pct * 0.8;
                    return (
                      <div
                        key={m}
                        className={cn(
                          'aspect-square rounded-[4px]',
                          selYear === curY && m === curM && 'ring-primary ring-2 ring-offset-1 ring-offset-[var(--card)]'
                        )}
                        style={{
                          background: `var(${AREAS[a].c})`,
                          opacity: Number(op.toFixed(2)),
                        }}
                        title={`${MONTH_NAMES[m]}: ${Math.round(pct * 100)}%`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed">
            Intensidade = consistência do mês. Colunas apagadas são meses sem dados ainda.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <SectionTitle>Metas do trimestre atual · {QLABEL[cq] || cq}</SectionTitle>
        {inQuarter.length === 0 ? (
          <Empty>
            <EmptyTitle>Nenhum marco com alvo neste trimestre</EmptyTitle>
            <EmptyDescription>A jornada mostra os alvos dos próximos trimestres.</EmptyDescription>
          </Empty>
        ) : (
          <div className="space-y-3">
            {inQuarter.map((m) => (
              <Milestone key={m.id} m={m} state={state} onToggle={toggleFlag} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <SectionTitle hint={`${doneCount}/${yearMs.length} conquistados`}>
          Marcos de {selYear}
        </SectionTitle>
        {yearMs.length === 0 ? (
          <Empty>
            <EmptyTitle>Sem marcos definidos para este ano</EmptyTitle>
            <EmptyDescription>Use as setas acima para navegar entre os anos.</EmptyDescription>
          </Empty>
        ) : (
          <div className="space-y-3">
            {yearMs.map((m) => (
              <Milestone key={m.id} m={m} state={state} onToggle={toggleFlag} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
