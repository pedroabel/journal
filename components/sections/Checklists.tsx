'use client';

import { CHECKS } from '@/lib/plan';
import type { Journal } from '../useJournal';

export default function Checklists({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;

  return (
    <section id="checklists">
      <div className="eyebrow-row">
        <span className="idx">◆</span>
        <span className="tag">Acompanhamento</span>
      </div>
      <h2 className="sec">Checklists</h2>

      {CHECKS.map((cl) => {
        const dc = cl.items.filter((_, i) => state.checks[`${cl.id}#${i}`]).length;
        const pct = Math.round((dc / cl.items.length) * 100);
        return (
          <div key={cl.id} className="card" style={{ ['--cc' as string]: `var(${cl.color})` }}>
            <h3 style={{ margin: 0 }}>{cl.name}</h3>
            <div className="barw"><div className="fill" style={{ width: pct + '%' }} /></div>
            <div className="pcount">{dc} de {cl.items.length}</div>
            {cl.items.map((it, i) => {
              const key = `${cl.id}#${i}`;
              const d = !!state.checks[key];
              return (
                <div key={key} className={'clitem' + (d ? ' done' : '')}>
                  <button
                    className={'box' + (d ? ' done' : '')}
                    aria-pressed={d}
                    aria-label={it[0]}
                    onClick={() => toggleFlag('checks', key)}
                  >
                    {d ? '✓' : ''}
                  </button>
                  <span className="cltxt">
                    {it[0]}
                    <small>{it[1]}</small>
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
