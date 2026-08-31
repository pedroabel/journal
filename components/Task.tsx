'use client';

import { PROTO, type Block } from '@/lib/plan';
import { curTrack, trackById } from '@/lib/derive';
import type { JournalState } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ProtoDetails from './Proto';
import { tone } from './tone';

/**
 * Um bloco da rotina. Só o dia de hoje é marcável — os outros são
 * pré-visualização, com a caixa desabilitada e sem interação.
 */
export default function Task({
  b, win, isToday, dstr, state, onToggle,
}: {
  b: Block;
  win: 'l' | 'n';
  isToday: boolean;
  dstr: string;
  state: JournalState;
  onToggle: (dstr: string, key: string) => void;
}) {
  const p = PROTO[b.t];
  const key = `${win}:${b.t}`;
  const dn = isToday && !!state.day[dstr]?.[key];
  const tr = b.track ? trackById(b.track) : null;
  const cur = tr ? curTrack(state, tr) : null;

  return (
    <div
      style={tone(p.color)}
      className={cn(
        'bg-card relative overflow-hidden rounded-xl border px-4 shadow-xs transition-colors',
        dn && 'bg-muted/40'
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--tone)]" />

      <div className="flex items-start gap-3 py-3.5">
        <Checkbox
          className="mt-0.5 size-5 rounded-md"
          checked={dn}
          disabled={!isToday}
          aria-hidden={!isToday}
          aria-label={(b.label || p.title) + (dn ? ' — feito' : '')}
          onCheckedChange={() => onToggle(dstr, key)}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[var(--tone)] font-mono text-xs">{b.s}</span>
            <Badge variant="outline" className="text-muted-foreground rounded-full font-mono">
              {b.d}
            </Badge>
          </div>

          <h4
            className={cn(
              'mt-1 text-sm font-semibold tracking-tight',
              dn && 'text-muted-foreground'
            )}
          >
            {b.label || p.title}
          </h4>

          {tr && (
            <div className="bg-muted/60 mt-2 rounded-md px-3 py-2">
              <span className="text-muted-foreground block font-mono text-[0.625rem] tracking-wider uppercase">
                Foco de hoje
              </span>
              <span className="text-sm">
                {cur ? (
                  <b className="text-[var(--tone)] font-medium">{cur.txt}</b>
                ) : (
                  'Trilha concluída ✓'
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <ProtoDetails p={p} />
    </div>
  );
}
