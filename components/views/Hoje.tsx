'use client';

import { DAYS, REDUCED_BLOCKS, WEEK } from '@/lib/plan';
import { isReduced, today } from '@/lib/derive';
import type { Journal } from '../useJournal';
import ReducedBar from '../ReducedBar';
import Task from '../Task';

export default function Hoje({
  journal, selDay, onSelDay,
}: {
  journal: Journal;
  selDay: number;
  onSelDay: (n: number) => void;
}) {
  const { state, toggleTask, toggleFlag } = journal;
  const realDay = new Date().getDay();
  const isToday = selDay === realDay;
  const dstr = today();
  const red = isReduced(state, new Date()) && isToday;

  const day = WEEK[selDay];
  const dayName = DAYS.find((x) => x.n === selDay)!.f;
  const blocks = red ? REDUCED_BLOCKS : day.night;
  const lunch = red ? null : day.lunch;

  const total = blocks.length + (lunch ? 1 : 0);
  let doneCount = 0;
  if (isToday) {
    for (const b of blocks) if (state.day[dstr]?.['n:' + b.t]) doneCount++;
    if (lunch && state.day[dstr]?.['l:' + lunch.t]) doneCount++;
  }

  return (
    <section>
      <div className="eyebrow-row">
        <span className="idx">01</span>
        <span className="tag">Diária · o que eu faço agora</span>
      </div>
      <h2 className="sec">Hoje</h2>

      <ReducedBar state={state} onToggle={toggleFlag} />

      <div className="daytabs">
        {DAYS.map((d) => (
          <button
            key={d.n}
            className={'daytab' + (d.n === selDay ? ' sel' : '') + (d.n === realDay ? ' istoday' : '')}
            onClick={() => onSelDay(d.n)}
          >
            {d.ab}
            <span className="dd">{d.n === realDay ? 'hoje' : ' '}</span>
          </button>
        ))}
      </div>

      <div className="dayhead">
        <span className="dname">
          {isToday ? 'Hoje · ' : ''}
          {dayName}
          {red && <span className="redbadge">reduzida</span>}
        </span>
        {isToday ? (
          <span className="prog">{doneCount}/{total} feitos</span>
        ) : (
          <span className="prog" style={{ color: 'var(--ink-faint)' }}>pré-visualização</span>
        )}
      </div>

      {day.note && !red && <div className="daynote">{day.note}</div>}

      {lunch ? (
        <>
          <div className="winlabel">Janela do almoço · uma atividade só<span className="ln" /></div>
          <Task b={lunch} win="l" isToday={isToday} dstr={dstr} state={state} onToggle={toggleTask} />
        </>
      ) : (
        !red && selDay >= 1 && selDay <= 5 && (
          <>
            <div className="winlabel">Janela do almoço<span className="ln" /></div>
            <div className="card" style={{ padding: '13px 16px', fontSize: 13, color: 'var(--ink-faint)' }}>
              Livre hoje. O almoço só é usado 3 dias por semana (ter, qui, sex) — é sua única pausa real do dia.
            </div>
          </>
        )
      )}

      <div className="winlabel">
        {selDay === 6 || selDay === 0 ? 'Janela principal' : 'Janela da noite · 20:00 → 23:00'}
        <span className="ln" />
      </div>
      {blocks.map((b, i) => (
        <Task key={i} b={b} win="n" isToday={isToday} dstr={dstr} state={state} onToggle={toggleTask} />
      ))}
    </section>
  );
}
