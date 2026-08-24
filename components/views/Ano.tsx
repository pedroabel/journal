'use client';

import { AREAS, MONTH_AB, MONTH_NAMES, MS, QLABEL, type AreaKey } from '@/lib/plan';
import { curQuarter, monthStats, msDone, quarterOf, rateFor } from '@/lib/derive';
import type { Journal } from '../useJournal';
import Milestone from '../Milestone';

export default function Ano({
  journal, selYear, onShift,
}: {
  journal: Journal;
  selYear: number;
  onShift: (years: number) => void;
}) {
  const { state, toggleFlag } = journal;
  const now = new Date();
  const curM = now.getMonth();
  const curY = now.getFullYear();
  const areaKeys = Object.keys(AREAS) as AreaKey[];

  const cq = curQuarter();
  const inQuarter = MS.filter((m) => quarterOf(m.d) === cq);
  const yearMs = MS.filter((m) => m.d.slice(0, 4) === String(selYear))
    .slice()
    .sort((a, b) => (a.d < b.d ? -1 : 1));
  const doneCount = yearMs.filter((m) => msDone(state, m.id)).length;

  return (
    <section>
      <div className="eyebrow-row">
        <span className="idx">04</span>
        <span className="tag">Anual · estou saindo do lugar</span>
      </div>
      <h2 className="sec">Ano</h2>

      <div className="mnav">
        <button className="arrow" onClick={() => onShift(-1)} aria-label="ano anterior">←</button>
        <span className="mlabel">{selYear}</span>
        <button className="arrow" onClick={() => onShift(1)} aria-label="próximo ano">→</button>
      </div>

      <p className="lead">
        Sem streak aqui. No ano, o que importa é <b>o que ficou pronto</b>.
      </p>

      <div className="card">
        <div className="ygrid">
          <div className="yinner">
            <div className="yrow head">
              <div className="ylab" />
              {MONTH_AB.map((m, i) => <div key={i} className="ycell">{m}</div>)}
            </div>
            {areaKeys.map((a) => (
              <div key={a} className="yrow">
                <div className="ylab">{AREAS[a].n}</div>
                {Array.from({ length: 12 }, (_, m) => {
                  const stats = monthStats(state, selYear, m);
                  let tot = 0;
                  let did = 0;
                  for (const t of AREAS[a].t) {
                    const r = rateFor(t, stats);
                    if (r && r.exp) { tot += r.exp; did += r.did; }
                  }
                  const pct = tot ? Math.min(100, did / tot) : 0;
                  const op = pct === 0 ? 0.12 : 0.2 + pct * 0.8;
                  return (
                    <div
                      key={m}
                      className={'ycell' + (selYear === curY && m === curM ? ' cur' : '')}
                      style={{ background: `var(${AREAS[a].c})`, opacity: Number(op.toFixed(2)) }}
                      title={`${MONTH_NAMES[m]}: ${Math.round(pct * 100)}%`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="body" style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '10px 0 0' }}>
          Intensidade = consistência do mês. Colunas apagadas são meses sem dados ainda.
        </p>
      </div>

      <h3>Metas do trimestre atual · {QLABEL[cq] || cq}</h3>
      {inQuarter.length === 0 ? (
        <div className="card">
          <p className="body" style={{ margin: 0, fontSize: 13 }}>Nenhum marco com alvo neste trimestre.</p>
        </div>
      ) : (
        inQuarter.map((m) => <Milestone key={m.id} m={m} state={state} onToggle={toggleFlag} />)
      )}

      <h3>
        Marcos de {selYear}{' '}
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 400 }}>
          — {doneCount}/{yearMs.length} conquistados
        </span>
      </h3>
      {yearMs.length === 0 ? (
        <div className="card">
          <p className="body" style={{ margin: 0, fontSize: 13 }}>Sem marcos definidos para este ano.</p>
        </div>
      ) : (
        yearMs.map((m) => <Milestone key={m.id} m={m} state={state} onToggle={toggleFlag} />)
      )}
    </section>
  );
}
