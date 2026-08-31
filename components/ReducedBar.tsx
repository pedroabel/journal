'use client';

import { Moon } from 'lucide-react';

import { weekKey } from '@/lib/derive';
import type { JournalState } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Modo reduzido: semana atípica declarada de propósito não conta como falha
 * nas estatísticas. Declarar antes é planejamento, não desculpa.
 */
export default function ReducedBar({
  state, onToggle,
}: {
  state: JournalState;
  onToggle: (group: 'reduced', key: string) => void;
}) {
  const wk = weekKey(new Date());
  const on = !!state.reduced[wk];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-dashed px-4 py-3.5',
        on && 'border-warning/40 bg-warning/10 border-solid'
      )}
    >
      <Moon className={cn('size-4 shrink-0', on ? 'text-warning' : 'text-muted-foreground')} />
      <div className="min-w-40 flex-1">
        <p className="text-sm font-medium">
          {on ? 'Semana reduzida ativa' : 'Semana normal'}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
          {on
            ? 'Meta no mínimo viável. Esta semana não conta como falha nas estatísticas.'
            : 'Ative para semanas atípicas (viagem, visita, doença). Declarar antes é planejamento, não falha.'}
        </p>
      </div>
      <Button
        variant={on ? 'default' : 'outline'}
        size="sm"
        aria-pressed={on}
        onClick={() => onToggle('reduced', wk)}
      >
        {on ? 'ativa ✓' : 'ativar'}
      </Button>
    </div>
  );
}
