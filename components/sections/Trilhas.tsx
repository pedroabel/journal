'use client';

import { TRACKS } from '@/lib/plan';
import { curTrack } from '@/lib/derive';
import type { Journal } from '../useJournal';

export default function Trilhas({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;

  return (
    <section id="trilhas">
      <div className="eyebrow-row">
        <span className="idx">◆</span>
        <span className="tag">Progressão</span>
      </div>
      <h2 className="sec">Trilhas</h2>
      <p className="lead">
        Marque conforme avança — o &quot;foco de hoje&quot; na visão diária segue daqui.
      </p>

      {TRACKS.map((tr) => {
        const dc = tr.items.filter((_, i) => state.tracks[`${tr.id}#${i}`]).length;
        const pct = Math.round((dc / tr.items.length) * 100);
        const cur = curTrack(state, tr);
        return (
          <div key={tr.id} className="card" style={{ ['--cc' as string]: `var(${tr.color})` }}>
            <h3 style={{ margin: 0 }}>{tr.name}</h3>
            <div className="barw"><div className="fill" style={{ width: pct + '%' }} /></div>
            <div className="pcount">{dc} de {tr.items.length} · {pct}%</div>
            {tr.items.map((it, i) => {
              const key = `${tr.id}#${i}`;
              const d = !!state.tracks[key];
              const isCur = cur?.i === i;
              return (
                <div key={key} className={'clitem' + (d ? ' done' : '')}>
                  <button
                    className={'box' + (d ? ' done' : '')}
                    aria-pressed={d}
                    aria-label={it}
                    onClick={() => toggleFlag('tracks', key)}
                  >
                    {d ? '✓' : ''}
                  </button>
                  <span className="cltxt" style={isCur ? { color: 'var(--ink)', fontWeight: 600 } : undefined}>
                    {it}
                    {isCur && <span className="cur-badge">atual</span>}
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
