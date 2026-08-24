'use client';

import { weekKey } from '@/lib/derive';
import type { JournalState } from '@/lib/state';

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
    <div className={'redbar' + (on ? ' on' : '')}>
      <div className="rt">
        <b>{on ? 'Semana reduzida ativa' : 'Semana normal'}</b>
        {on
          ? 'Meta no mínimo viável. Esta semana não conta como falha nas estatísticas.'
          : 'Ative para semanas atípicas (viagem, visita, doença). Declarar antes é planejamento, não falha.'}
      </div>
      <button className={'tog' + (on ? ' on' : '')} onClick={() => onToggle('reduced', wk)}>
        {on ? 'ativa ✓' : 'ativar'}
      </button>
    </div>
  );
}
