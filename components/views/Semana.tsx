'use client';

import { DAYS, PROTO, TYPE_LABEL, WEEK } from '@/lib/plan';
import {
  addDays, ds, expectedPerWeek, parseD, today, typeDone, typeStreak, weekKey,
} from '@/lib/derive';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Section, SectionTitle } from '../Section';
import type { Journal } from '../useJournal';
import ReducedBar from '../ReducedBar';
import { tone } from '../tone';

const HABITS = ['sono', 'en_write', 'en_speak', 'calistenia', 'roadmap', 'cs50', 'leitura'];
const CHAIN_DAYS = 21;

export default function Semana({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;
  const now = new Date();
  const wk = weekKey(now);
  const mon = parseD(wk);

  return (
    <Section
      index="02"
      eyebrow="Semanal · estou mantendo o ritmo"
      title="Semana"
      description="Aqui o streak faz sentido: em escala de dias, a corrente é o que sustenta o hábito."
    >
      <ReducedBar state={state} onToggle={toggleFlag} />

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(mon, i);
          const dstr = ds(d);
          const isT = dstr === today();
          const dd = WEEK[d.getDay()];
          const exp = dd.night.length + (dd.lunch ? 1 : 0);
          const log = state.day[dstr];
          const did = log ? Object.keys(log).length : 0;
          const pct = exp ? Math.round((did / exp) * 100) : 0;
          return (
            <div
              key={dstr}
              className={cn(
                'bg-card rounded-lg border px-1 py-2.5 text-center',
                isT && 'border-primary/50 ring-primary/15 ring-2'
              )}
            >
              <div className="text-muted-foreground font-mono text-[0.625rem]">
                {DAYS.find((x) => x.n === d.getDay())!.ab}
              </div>
              <div
                className={cn(
                  'mt-1 text-lg leading-none font-semibold tabular-nums',
                  !did && 'text-muted-foreground/50'
                )}
              >
                {did}
              </div>
              <div className="text-muted-foreground mt-1 font-mono text-[0.625rem]">
                {d > now ? '—' : pct + '%'}
              </div>
            </div>
          );
        })}
      </div>

      {state.reduced[wk] && (
        <Alert variant="warning">
          <AlertTitle>Semana reduzida.</AlertTitle>
          <AlertDescription>
            <p>Ela não entra no cálculo mensal — nada aqui conta contra você.</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <SectionTitle>Corrente por hábito</SectionTitle>

        {HABITS.map((t) => {
          const p = PROTO[t];
          const streak = typeStreak(state, t);
          const per = expectedPerWeek(t);
          let wdid = 0;
          for (let i = 0; i < 7; i++) {
            const d = addDays(mon, i);
            if (d <= now && typeDone(state, ds(d), t)) wdid++;
          }
          return (
            <div
              key={t}
              style={tone(p.color)}
              className="bg-card relative flex items-center gap-4 overflow-hidden rounded-xl border px-4 py-3 shadow-xs"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--tone)]" />

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight">{TYPE_LABEL[t]}</div>
                <div className="text-muted-foreground mt-0.5 font-mono text-xs">
                  {wdid}/{per} nesta semana
                </div>
                <div className="mt-2 flex flex-wrap gap-[3px]">
                  {Array.from({ length: CHAIN_DAYS }, (_, k) => {
                    const dd = ds(addDays(now, -(CHAIN_DAYS - 1 - k)));
                    const filled = typeDone(state, dd, t);
                    return (
                      <span
                        key={dd}
                        className={cn(
                          'size-2 rounded-[3px] border',
                          filled ? 'border-[var(--tone)] bg-[var(--tone)]' : 'bg-muted'
                        )}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[var(--tone)] font-mono text-lg leading-none font-medium tabular-nums">
                  {streak}
                </div>
                <div className="text-muted-foreground mt-1 text-[0.625rem]">seguidos</div>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="py-4">
        <CardContent className="text-muted-foreground text-xs leading-relaxed">
          A corrente mostra os últimos 21 dias. Um dia mínimo viável conta como dia cumprido — a
          corrente não quebra por você ter feito a versão curta.
        </CardContent>
      </Card>
    </Section>
  );
}
