'use client';

import { DAYS, PROTO, TYPE_LABEL, WEEK } from '@/lib/plan';
import {
  addDays, ds, expectedPerWeek, parseD, today, typeDone, typeStreak, weekKey,
} from '@/lib/derive';
import type { Journal } from '../useJournal';
import ReducedBar from '../ReducedBar';

const HABITS = ['sono', 'en_write', 'en_speak', 'calistenia', 'roadmap', 'cs50', 'leitura'];
const CHAIN_DAYS = 21;

export default function Semana({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;
  const now = new Date();
  const wk = weekKey(now);
  const mon = parseD(wk);

  return (
    <section>
      <div className="eyebrow-row">
        <span className="idx">02</span>
        <span className="tag">Semanal · estou mantendo o ritmo</span>
      </div>
      <h2 className="sec">Semana</h2>
      <p className="lead">
        Aqui o streak faz sentido: em escala de dias, a corrente é o que sustenta o hábito.
      </p>

      <ReducedBar state={state} onToggle={toggleFlag} />

      <div className="wkgrid">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(mon, i);
          const dstr = ds(d);
          const isT = dstr === today();
          const dd = WEEK[d.getDay()];
          const exp = dd.night.length + (dd.lunch ? 1 : 0);
          const log = state.day[dstr];
          const did = log ? Object.keys(log).length : 0;
          const pct = exp ? Math.round((did / exp) * 100) : 0;
          return (
            <div key={dstr} className={'wkcell' + (isT ? ' today' : '')}>
              <div className="wd">{DAYS.find((x) => x.n === d.getDay())!.ab}</div>
              <div className="wn" style={{ color: did ? 'var(--sage)' : 'var(--ink-faint)' }}>{did}</div>
              <div className="wpc">{d > now ? '—' : pct + '%'}</div>
            </div>
          );
        })}
      </div>

      {state.reduced[wk] && (
        <div className="alerta" style={{ borderColor: 'var(--violet)', background: 'rgba(224,225,221,.08)' }}>
          <b style={{ color: 'var(--violet)' }}>Semana reduzida.</b> Ela não entra no cálculo mensal — nada aqui conta contra você.
        </div>
      )}

      <h3>Corrente por hábito</h3>
      {HABITS.map((t) => {
        const p = PROTO[t];
        const streak = typeStreak(state, t);
        const per = expectedPerWeek(t);
        let wdid = 0;
        for (let i = 0; i < 7; i++) {
          const d = addDays(mon, i);
          if (d <= now && typeDone(state, ds(d), t)) wdid++;
        }
        return (
          <div key={t} className="habrow" style={{ ['--tc' as string]: `var(${p.color})` }}>
            <div className="hn">
              <div className="hname">{TYPE_LABEL[t]}</div>
              <div className="hsub">{wdid}/{per} nesta semana</div>
              <div className="chain">
                {Array.from({ length: CHAIN_DAYS }, (_, k) => {
                  const dd = ds(addDays(now, -(CHAIN_DAYS - 1 - k)));
                  return <span key={dd} className={'dot' + (typeDone(state, dd, t) ? ' f' : '')} />;
                })}
              </div>
            </div>
            <div className="hstk">
              {streak}
              <small>seguidos</small>
            </div>
          </div>
        );
      })}

      <p className="body" style={{ fontSize: 12.5, color: 'var(--ink-faint)', marginTop: 12 }}>
        A corrente mostra os últimos 21 dias. Um dia mínimo viável conta como dia cumprido — a corrente
        não quebra por você ter feito a versão curta.
      </p>
    </section>
  );
}
