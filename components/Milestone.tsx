'use client';

import { Lock } from 'lucide-react';

import { MSTYPE, type Milestone as Ms } from '@/lib/plan';
import { blockedBy, msDone, msState, msTitle, parseD, type MsStateKind } from '@/lib/derive';
import type { JournalState } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { tone } from './tone';

/** Um estado de marco = um variante de badge, sempre o mesmo em todo o sistema. */
const STATE_VARIANT: Record<MsStateKind, 'success' | 'danger' | 'warning' | 'muted'> = {
  ok: 'success',
  late: 'danger',
  now: 'warning',
  soon: 'muted',
};

/** Marco com critério binário. Sem critério verificável não é marco, é desejo. */
export default function Milestone({
  m, state, onToggle,
}: {
  m: Ms;
  state: JournalState;
  onToggle: (group: 'ms', key: string) => void;
}) {
  const s = msState(state, m);
  const ty = MSTYPE[m.ty];
  const dn = msDone(state, m.id);
  const bl = blockedBy(state, m);

  return (
    <div
      style={tone(ty.c)}
      className={cn(
        'bg-card relative overflow-hidden rounded-xl border px-4 py-3.5 shadow-xs',
        dn && 'bg-muted/40'
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--tone)]" />

      <div className="flex items-start gap-3">
        <Checkbox
          className="mt-0.5 size-5 rounded-md"
          checked={dn}
          aria-label={m.t + (dn ? ' — feito' : '')}
          onCheckedChange={() => onToggle('ms', m.id)}
        />

        <div className="min-w-0 flex-1">
          <h4
            className={cn(
              'text-sm leading-snug font-semibold tracking-tight',
              dn && 'text-muted-foreground line-through decoration-1'
            )}
          >
            {m.t}
          </h4>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-[var(--tone)]/40 text-[var(--tone)] rounded-full"
            >
              {ty.n}
            </Badge>
            <Badge variant={STATE_VARIANT[s.k]} className="rounded-full">
              {s.n}
            </Badge>
            <span className="text-muted-foreground font-mono text-xs">
              alvo {parseD(m.d).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
            </span>
          </div>

          <div className="bg-muted/60 mt-2.5 rounded-md px-3 py-2">
            <span className="text-muted-foreground block font-mono text-[0.625rem] tracking-wider uppercase">
              Critério (binário)
            </span>
            <p className="mt-0.5 text-sm leading-relaxed">{m.crit}</p>
          </div>

          {bl.length > 0 && (
            <p className="text-muted-foreground mt-2 flex items-start gap-1.5 text-xs">
              <Lock className="mt-px size-3 shrink-0" />
              <span>
                depende de: <b className="text-foreground font-medium">{bl.map(msTitle).join(' · ')}</b>
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
