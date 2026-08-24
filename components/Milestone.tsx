'use client';

import { MSTYPE, type Milestone as Ms } from '@/lib/plan';
import { blockedBy, msDone, msState, msTitle, parseD } from '@/lib/derive';
import type { JournalState } from '@/lib/state';

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
    <div className={'ms' + (dn ? ' done' : '')} style={{ ['--mc' as string]: `var(${ty.c})` }}>
      <div className="ms-top">
        <button
          className={'msbox' + (dn ? ' done' : '')}
          aria-pressed={dn}
          aria-label={m.t + (dn ? ' — feito' : '')}
          onClick={() => onToggle('ms', m.id)}
        >
          {dn ? '✓' : ''}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mtitle">{m.t}</div>
          <div className="mrow">
            <span className="mtype">{ty.n}</span>
            <span className={'mstate ' + s.k}>{s.n}</span>
            <span className="mdate">
              alvo {parseD(m.d).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
            </span>
          </div>
          <div className="mcrit">
            <span className="k">Critério (binário)</span>
            {m.crit}
          </div>
          {bl.length > 0 && (
            <div className="mdep">
              depende de: <b>{bl.map(msTitle).join(' · ')}</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
