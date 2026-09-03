'use client';

import { PROTO, type Block } from '@/lib/plan';
import type { JournalState } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ProtoDetails from './Proto';
import StudyNext from './StudyNext';
import { tone } from './tone';

/**
 * Um bloco da rotina. Hoje e os dias que já passaram são marcáveis — o que
 * ficou para trás pode ser registrado na data certa. Dias futuros são
 * pré-visualização, com a caixa desabilitada e sem interação.
 *
 * O bloco não diz só QUANDO e COMO: `StudyNext` resolve O QUE, puxando da
 * árvore de temas o próximo assunto que cabe nesta sessão.
 */
export default function Task({
  b, win, canMark, dstr, state, onToggle, onToggleUnit,
}: {
  b: Block;
  win: 'l' | 'n';
  canMark: boolean;
  dstr: string;
  state: JournalState;
  onToggle: (dstr: string, key: string) => void;
  onToggleUnit: (group: 'units', key: string) => void;
}) {
  const p = PROTO[b.t];
  const key = `${win}:${b.t}`;
  const dn = !!state.day[dstr]?.[key];

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
          disabled={!canMark}
          aria-hidden={!canMark}
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

          <StudyNext
            tipo={b.t}
            dur={b.d}
            state={state}
            podeMarcar={canMark}
            onToggle={onToggleUnit}
          />
        </div>
      </div>

      <ProtoDetails p={p} />
    </div>
  );
}
