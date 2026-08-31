'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { AREAS, MCQ, MONTH_NAMES, MS, TYPE_LABEL, areaOf, type AreaKey } from '@/lib/plan';
import { ds, isReduced, monthKey, monthStats, rateFor, today } from '@/lib/derive';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Section, SectionTitle } from '../Section';
import type { Journal } from '../useJournal';
import DayDetail from '../DayDetail';
import Milestone from '../Milestone';

const RATE_ORDER = [
  'sono', 'en_write', 'en_speak', 'calistenia', 'roadmap',
  'cs50', 'dsa', 'carreira', 'leitura', 'caminhada', 'en_tutor',
];

export default function Mes({
  journal, selYear, selMonth, onShift, selDetail, onSelDetail,
}: {
  journal: Journal;
  selYear: number;
  selMonth: number;
  onShift: (months: number) => void;
  selDetail: string | null;
  onSelDetail: (dstr: string | null) => void;
}) {
  const { state, toggleFlag, setMonthly } = journal;
  const stats = monthStats(state, selYear, selMonth);
  const mk = monthKey(selYear, selMonth);

  const first = new Date(selYear, selMonth, 1);
  const lead = (first.getDay() + 6) % 7; // grade começa na segunda
  const lastD = new Date(selYear, selMonth + 1, 0).getDate();
  const areaKeys = Object.keys(AREAS) as AreaKey[];
  const msThisMonth = MS.filter((m) => m.d.slice(0, 7) === mk);

  const rates = RATE_ORDER
    .map((t) => ({ t, r: rateFor(t, stats) }))
    .filter((x) => x.r && x.r.exp > 0);

  return (
    <Section
      index="03"
      eyebrow="Mensal · o mês foi bom"
      title="Mês"
      actions={
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={() => onShift(-1)} aria-label="mês anterior">
            <ChevronLeft />
          </Button>
          <span className="min-w-36 text-center text-sm font-medium capitalize">
            {MONTH_NAMES[selMonth]} {selYear}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => onShift(1)} aria-label="próximo mês">
            <ChevronRight />
          </Button>
        </div>
      }
    >
      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((x, i) => (
              <div
                key={i}
                className="text-muted-foreground pb-1 text-center font-mono text-[0.625rem]"
              >
                {x}
              </div>
            ))}

            {Array.from({ length: lead }, (_, i) => <div key={'e' + i} />)}

            {Array.from({ length: lastD }, (_, i) => {
              const dnum = i + 1;
              const d = new Date(selYear, selMonth, dnum);
              const dstr = ds(d);
              const log = state.day[dstr] || {};
              const areas: Partial<Record<AreaKey, boolean>> = {};
              for (const k of Object.keys(log)) areas[areaOf(k.slice(2))] = true;
              const isToday = dstr === today();
              const isSel = selDetail === dstr;
              return (
                <button
                  key={dstr}
                  aria-pressed={isSel}
                  aria-label={d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                  onClick={() => onSelDetail(isSel ? null : dstr)}
                  className={cn(
                    'bg-card hover:border-ring/60 focus-visible:ring-ring/50 flex h-13 cursor-pointer flex-col justify-between rounded-md border p-1.5 text-left transition-colors outline-none focus-visible:ring-[3px] sm:h-16',
                    isReduced(state, d) && 'border-dashed',
                    isToday && 'border-primary/50',
                    isSel && 'ring-primary ring-2'
                  )}
                >
                  <span className="text-muted-foreground font-mono text-[0.6875rem] leading-none">
                    {dnum}
                  </span>
                  <span className="flex flex-wrap gap-[2px]">
                    {areaKeys.map(
                      (a) =>
                        areas[a] && (
                          <i
                            key={a}
                            className="block size-1.5 rounded-[2px]"
                            style={{ background: `var(${AREAS[a].c})` }}
                          />
                        )
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {areaKeys.map((a) => (
              <span
                key={a}
                className="text-muted-foreground flex items-center gap-1.5 font-mono text-[0.6875rem]"
              >
                <i
                  className="block size-2 rounded-[2px]"
                  style={{ background: `var(${AREAS[a].c})` }}
                />
                {AREAS[a].n}
              </span>
            ))}
            <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-[0.6875rem]">
              <i className="border-muted-foreground/60 block size-2 rounded-[2px] border border-dashed" />
              reduzida
            </span>
          </div>

          <Separator />

          <DayDetail dstr={selDetail} state={state} onClose={() => onSelDetail(null)} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <SectionTitle>Taxa de consistência</SectionTitle>
        <Card>
          <CardContent className="space-y-3">
            {rates.length === 0 ? (
              <Empty className="border-0 py-6">
                <EmptyTitle>Sem dados ainda neste mês</EmptyTitle>
                <EmptyDescription>
                  As taxas aparecem conforme os blocos do mês forem marcados.
                </EmptyDescription>
              </Empty>
            ) : (
              rates.map(({ t, r }) => (
                <div key={t} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="min-w-32 flex-1 text-sm">{TYPE_LABEL[t]}</span>
                  <Progress
                    value={r!.pct}
                    className="w-full flex-1 sm:w-28 sm:flex-none"
                    indicatorClassName={
                      r!.pct >= 80 ? 'bg-success' : r!.pct >= 50 ? 'bg-primary' : 'bg-muted-foreground/50'
                    }
                  />
                  <span className="text-muted-foreground w-24 text-right font-mono text-xs tabular-nums">
                    {r!.did}/{r!.exp} · {r!.pct}%
                  </span>
                </div>
              ))
            )}

            {stats.redDays > 0 && (
              <p className="text-muted-foreground border-t pt-3 text-xs">
                {stats.redDays} dia(s) em semana reduzida — fora do cálculo, sem penalidade.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <SectionTitle>Marcos deste mês</SectionTitle>
        {msThisMonth.length === 0 ? (
          <Empty>
            <EmptyTitle>Nenhum marco com alvo neste mês</EmptyTitle>
            <EmptyDescription>Navegue entre os meses para ver os próximos alvos.</EmptyDescription>
          </Empty>
        ) : (
          <div className="space-y-3">
            {msThisMonth.map((m) => (
              <Milestone key={m.id} m={m} state={state} onToggle={toggleFlag} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <SectionTitle>Fechamento do mês</SectionTitle>
        <Card>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-sm">Três toques e o mês está fechado.</p>
            {MCQ.map((q) => {
              const cur = state.monthly[mk]?.[q.id];
              return (
                <div key={q.id} className="space-y-2.5">
                  <p className="text-sm font-medium">{q.q}</p>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    value={cur ?? ''}
                    // Sem valor = clique na opção já marcada. Manter a resposta:
                    // desmarcar não é uma ação que o fechamento do mês oferece.
                    onValueChange={(v) => v && setMonthly(mk, q.id, v)}
                  >
                    {q.o.map((o) => (
                      <ToggleGroupItem key={o} value={o} className="rounded-full">
                        {o}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
