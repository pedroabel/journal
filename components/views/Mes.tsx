'use client';

import { AREAS, MCQ, MONTH_NAMES, MS, TYPE_LABEL, areaOf, type AreaKey } from '@/lib/plan';
import { ds, isReduced, monthKey, monthStats, rateFor, today } from '@/lib/derive';
import type { Journal } from '../useJournal';
import DayDetail from '../DayDetail';
import Milestone from '../Milestone';

const RATE_ORDER = [
  'sono', 'en_write', 'en_speak', 'calistenia', 'roadmap',
  'cs50', 'dsa', 'carreira', 'leitura', 'caminhada', 'en_tutor',
];

export default function Mes({
  journal, selYear, selMonth, onShift, selDetail, onSelDetail,
}: {
  journal: Journal;
  selYear: number;
  selMonth: number;
  onShift: (months: number) => void;
  selDetail: string | null;
  onSelDetail: (dstr: string | null) => void;
}) {
  const { state, toggleFlag, setMonthly } = journal;
  const stats = monthStats(state, selYear, selMonth);
  const mk = monthKey(selYear, selMonth);

  const first = new Date(selYear, selMonth, 1);
  const lead = (first.getDay() + 6) % 7; // grade começa na segunda
  const lastD = new Date(selYear, selMonth + 1, 0).getDate();
  const areaKeys = Object.keys(AREAS) as AreaKey[];
  const msThisMonth = MS.filter((m) => m.d.slice(0, 7) === mk);

  const rates = RATE_ORDER
    .map((t) => ({ t, r: rateFor(t, stats) }))
    .filter((x) => x.r && x.r.exp > 0);

  return (
    <section>
      <div className="eyebrow-row">
        <span className="idx">03</span>
        <span className="tag">Mensal · o mês foi bom</span>
      </div>
      <h2 className="sec">Mês</h2>

      <div className="mnav">
        <button className="arrow" onClick={() => onShift(-1)} aria-label="mês anterior">←</button>
        <span className="mlabel">{MONTH_NAMES[selMonth]} {selYear}</span>
        <button className="arrow" onClick={() => onShift(1)} aria-label="próximo mês">→</button>
      </div>

      <div className="card">
        <div className="hmgrid">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((x, i) => (
            <div key={i} className="hmhead">{x}</div>
          ))}
          {Array.from({ length: lead }, (_, i) => <div key={'e' + i} className="hmcell empty" />)}
          {Array.from({ length: lastD }, (_, i) => {
            const dnum = i + 1;
            const d = new Date(selYear, selMonth, dnum);
            const dstr = ds(d);
            const log = state.day[dstr] || {};
            const areas: Partial<Record<AreaKey, boolean>> = {};
            for (const k of Object.keys(log)) areas[areaOf(k.slice(2))] = true;
            const cls =
              'hmcell' +
              (dstr === today() ? ' today' : '') +
              (isReduced(state, d) ? ' red' : '') +
              (selDetail === dstr ? ' sel' : '');
            return (
              <button
                key={dstr}
                className={cls}
                aria-pressed={selDetail === dstr}
                onClick={() => onSelDetail(selDetail === dstr ? null : dstr)}
              >
                <span className="dn">{dnum}</span>
                <span className="hmdots">
                  {areaKeys.map((a) => areas[a] && <i key={a} style={{ background: `var(${AREAS[a].c})` }} />)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="legend">
          {areaKeys.map((a) => (
            <span key={a}>
              <i style={{ background: `var(${AREAS[a].c})` }} />
              {AREAS[a].n}
            </span>
          ))}
          <span>
            <i style={{ background: 'none', border: '1px dashed var(--violet)' }} />
            reduzida
          </span>
        </div>

        <DayDetail dstr={selDetail} state={state} onClose={() => onSelDetail(null)} />
      </div>

      <h3>Taxa de consistência</h3>
      <div className="card">
        {rates.map(({ t, r }) => {
          const pct = r!.pct;
          const c = pct >= 80 ? '--accent' : pct >= 50 ? '--ink' : '--ink-faint';
          return (
            <div key={t} className="rate" style={{ ['--rc' as string]: `var(${c})` }}>
              <span className="rn">{TYPE_LABEL[t]}</span>
              <span className="rbar"><i style={{ width: pct + '%' }} /></span>
              <span className="rv">{r!.did}/{r!.exp} · {pct}%</span>
            </div>
          );
        })}
        {rates.length === 0 && (
          <p className="body" style={{ margin: 0, fontSize: 13 }}>Sem dados ainda neste mês.</p>
        )}
        {stats.redDays > 0 && (
          <p className="body" style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--violet)' }}>
            {stats.redDays} dia(s) em semana reduzida — fora do cálculo, sem penalidade.
          </p>
        )}
      </div>

      <h3>Marcos deste mês</h3>
      {msThisMonth.length === 0 ? (
        <div className="card">
          <p className="body" style={{ margin: 0, fontSize: 13 }}>Nenhum marco com alvo neste mês.</p>
        </div>
      ) : (
        msThisMonth.map((m) => (
          <Milestone key={m.id} m={m} state={state} onToggle={toggleFlag} />
        ))
      )}

      <h3>Fechamento do mês</h3>
      <div className="card">
        <p className="body" style={{ fontSize: 13, marginBottom: 14 }}>Três toques e o mês está fechado.</p>
        {MCQ.map((q) => {
          const cur = state.monthly[mk]?.[q.id];
          return (
            <div key={q.id} className="mcq">
              <div className="qq">{q.q}</div>
              <div className="mcqopts">
                {q.o.map((o) => (
                  <button
                    key={o}
                    className={'opt' + (cur === o ? ' on' : '')}
                    onClick={() => setMonthly(mk, q.id, o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
