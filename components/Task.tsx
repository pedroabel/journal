'use client';

import { PROTO, type Block } from '@/lib/plan';
import { curTrack, trackById } from '@/lib/derive';
import type { JournalState } from '@/lib/state';
import ProtoDetails from './Proto';

/**
 * Um bloco da rotina. Só o dia de hoje é marcável — os outros são
 * pré-visualização, com o círculo tracejado e sem interação.
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
    <div className={'task' + (dn ? ' done' : '')} style={{ ['--tc' as string]: `var(${p.color})` }}>
      <div className="task-top">
        {isToday ? (
          <button
            className={'check' + (dn ? ' done' : '')}
            aria-pressed={dn}
            aria-label={(b.label || p.title) + (dn ? ' — feito' : '')}
            onClick={() => onToggle(dstr, key)}
          >
            {dn ? '✓' : ''}
          </button>
        ) : (
          <button className="check preview" tabIndex={-1} aria-hidden="true" />
        )}
        <div className="tmeta">
          <div className="tline">
            <span className="ttime">{b.s}</span>
            <span className="tdur">{b.d}</span>
          </div>
          <div className="ttitle">{b.label || p.title}</div>
          {tr && (
            <div className="tfocus">
              <span className="fl">Foco de hoje</span>
              {cur ? <b>{cur.txt}</b> : 'Trilha concluída ✓'}
            </div>
          )}
        </div>
      </div>
      <ProtoDetails p={p} />
    </div>
  );
}
