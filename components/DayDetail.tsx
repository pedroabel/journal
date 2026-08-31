'use client';

import { Check, Circle, X } from 'lucide-react';

import { PROTO, REDUCED_BLOCKS, TYPE_LABEL, WEEK, type Block } from '@/lib/plan';
import { isReduced, parseD } from '@/lib/derive';
import type { JournalState } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/** O que foi feito num dia específico do heatmap. */
export default function DayDetail({
  dstr, state, onClose,
}: {
  dstr: string | null;
  state: JournalState;
  onClose: () => void;
}) {
  if (!dstr) {
    return (
      <p className="text-muted-foreground text-xs">Toque em um dia para ver o que foi feito.</p>
    );
  }

  const d = parseD(dstr);
  const red = isReduced(state, d);
  const log = state.day[dstr] || {};
  const day = WEEK[d.getDay()];
  const blocks = red ? REDUCED_BLOCKS : day.night;
  const lunch = red ? null : day.lunch;

  const rows: { w: string; b: Block; lab: string }[] = [];
  if (lunch) rows.push({ w: 'l', b: lunch, lab: 'almoço' });
  for (const b of blocks) {
    rows.push({ w: 'n', b, lab: d.getDay() === 0 || d.getDay() === 6 ? '' : 'noite' });
  }

  const doneCount = rows.filter((r) => log[r.w + ':' + r.b.t]).length;
  // Marcações que não pertencem à rotina daquele dia (rotina mudou desde então).
  const extra = Object.keys(log).filter((k) => !rows.some((r) => r.w + ':' + r.b.t === k));

  return (
    <div className="bg-muted/40 rounded-lg border">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
        <span className="text-sm font-semibold capitalize">
          {d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        {red && (
          <Badge variant="warning" className="rounded-full">
            reduzida
          </Badge>
        )}
        <span className="text-muted-foreground font-mono text-xs">
          {doneCount}/{rows.length} feitos
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto -mr-1"
          onClick={onClose}
          aria-label="fechar detalhe do dia"
        >
          <X />
        </Button>
      </div>

      {d > new Date() ? (
        <p className="text-muted-foreground px-4 py-3 text-sm">
          Dia futuro — nada registrado ainda.
        </p>
      ) : (
        <ul className="divide-border divide-y">
          {rows.map((r, i) => {
            const ok = !!log[r.w + ':' + r.b.t];
            return (
              <Row key={i} ok={ok} tag={r.lab}>
                {r.b.label || PROTO[r.b.t].title}
              </Row>
            );
          })}
          {extra.map((k) => (
            <Row key={k} ok tag="extra">
              {TYPE_LABEL[k.slice(2)] || k.slice(2)}
            </Row>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({
  ok, tag, children,
}: {
  ok: boolean;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2.5 px-4 py-2 text-sm">
      {ok ? (
        <Check className="text-success size-3.5 shrink-0" />
      ) : (
        <Circle className="text-muted-foreground/50 size-3.5 shrink-0" />
      )}
      <span className={cn('min-w-0 flex-1', ok ? 'text-foreground' : 'text-muted-foreground')}>
        {children}
      </span>
      {tag && (
        <Badge variant="outline" className="text-muted-foreground rounded-full font-mono">
          {tag}
        </Badge>
      )}
    </li>
  );
}
