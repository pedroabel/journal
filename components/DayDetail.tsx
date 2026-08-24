'use client';

import { PROTO, REDUCED_BLOCKS, TYPE_LABEL, WEEK, type Block } from '@/lib/plan';
import { isReduced, parseD } from '@/lib/derive';
import type { JournalState } from '@/lib/state';

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
      <p className="body" style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '10px 0 0' }}>
        Toque em um dia para ver o que foi feito.
      </p>
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
    <div className="ddet">
      <div className="dh">
        <span className="dt">
          {d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          {red && <span className="redbadge">reduzida</span>}
        </span>
        <span className="dc">{doneCount}/{rows.length} feitos</span>
        <button className="closex" onClick={onClose}>fechar ✕</button>
      </div>

      {d > new Date() ? (
        <p className="empty-note">Dia futuro — nada registrado ainda.</p>
      ) : (
        <>
          {rows.map((r, i) => {
            const ok = !!log[r.w + ':' + r.b.t];
            return (
              <div key={i} className={'di ' + (ok ? 'ok' : 'no')}>
                <span className="mk">{ok ? '✓' : '○'}</span>
                <span>{r.b.label || PROTO[r.b.t].title}</span>
                {r.lab && <span className="wtag">{r.lab}</span>}
              </div>
            );
          })}
          {extra.map((k) => (
            <div key={k} className="di ok">
              <span className="mk">✓</span>
              <span>{TYPE_LABEL[k.slice(2)] || k.slice(2)}</span>
              <span className="wtag">extra</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
