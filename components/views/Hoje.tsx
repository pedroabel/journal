'use client';

import { DAYS, REDUCED_BLOCKS, WEEK } from '@/lib/plan';
import { isReduced, today } from '@/lib/derive';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rule, Section } from '../Section';
import type { Journal } from '../useJournal';
import ReducedBar from '../ReducedBar';
import Task from '../Task';

export default function Hoje({
  journal, selDay, onSelDay,
}: {
  journal: Journal;
  selDay: number;
  onSelDay: (n: number) => void;
}) {
  const { state, toggleTask, toggleFlag } = journal;
  const realDay = new Date().getDay();
  const isToday = selDay === realDay;
  const dstr = today();
  const red = isReduced(state, new Date()) && isToday;

  const day = WEEK[selDay];
  const dayName = DAYS.find((x) => x.n === selDay)!.f;
  const blocks = red ? REDUCED_BLOCKS : day.night;
  const lunch = red ? null : day.lunch;

  const total = blocks.length + (lunch ? 1 : 0);
  let doneCount = 0;
  if (isToday) {
    for (const b of blocks) if (state.day[dstr]?.['n:' + b.t]) doneCount++;
    if (lunch && state.day[dstr]?.['l:' + lunch.t]) doneCount++;
  }

  return (
    <Section index="01" eyebrow="Diária · o que eu faço agora" title="Hoje">
      <ReducedBar state={state} onToggle={toggleFlag} />

      <div className="space-y-4">
        <div className="no-scrollbar overflow-x-auto">
          <Tabs value={String(selDay)} onValueChange={(v) => onSelDay(Number(v))}>
            <TabsList className="w-full min-w-md">
              {DAYS.map((d) => (
                <TabsTrigger key={d.n} value={String(d.n)} className="flex-col gap-0 py-1.5">
                  <span>{d.ab}</span>
                  <span className="text-muted-foreground text-[0.625rem] leading-3">
                    {d.n === realDay ? 'hoje' : ' '}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="text-lg font-semibold tracking-tight capitalize">
            {isToday ? 'Hoje · ' : ''}
            {dayName}
          </h3>
          {red && (
            <Badge variant="warning" className="rounded-full">
              reduzida
            </Badge>
          )}
          <span className="text-muted-foreground ml-auto font-mono text-xs">
            {isToday ? `${doneCount}/${total} feitos` : 'pré-visualização'}
          </span>
        </div>

        {isToday && (
          <Progress
            value={total ? (doneCount / total) * 100 : 0}
            aria-label={`${doneCount} de ${total} blocos feitos`}
          />
        )}

        {day.note && !red && (
          <Alert variant="muted">
            <AlertDescription>
              <p>{day.note}</p>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {lunch ? (
        <div className="space-y-3">
          <Rule>Janela do almoço · uma atividade só</Rule>
          <Task b={lunch} win="l" isToday={isToday} dstr={dstr} state={state} onToggle={toggleTask} />
        </div>
      ) : (
        !red &&
        selDay >= 1 &&
        selDay <= 5 && (
          <div className="space-y-3">
            <Rule>Janela do almoço</Rule>
            <Alert variant="muted">
              <AlertDescription>
                <p>Livre hoje. O almoço só é usado 3 dias por semana (ter, qui, sex) — é sua única
                  pausa real do dia.</p>
              </AlertDescription>
            </Alert>
          </div>
        )
      )}

      <div className="space-y-3">
        <Rule>
          {selDay === 6 || selDay === 0 ? 'Janela principal' : 'Janela da noite · 20:00 → 23:00'}
        </Rule>
        {blocks.map((b, i) => (
          <Task key={i} b={b} win="n" isToday={isToday} dstr={dstr} state={state} onToggle={toggleTask} />
        ))}
      </div>
    </Section>
  );
}
