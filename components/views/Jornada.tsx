'use client';

import { JPHASES, MS, MSTYPE, QLABEL, QUARTERS } from '@/lib/plan';
import { blockedBy, curQuarter, msDone, msTitle, nextMS, parseD, quarterOf } from '@/lib/derive';
import type { Journal } from '../useJournal';

/** Contagem regressiva do próximo marco: dias quando perto, semanas quando longe. */
function countdown(dateStr: string): { num: number; unit: string } {
  const diff = Math.ceil((parseD(dateStr).getTime() - Date.now()) / 864e5);
  if (diff < 0) {
    const num = Math.abs(diff);
    return { num, unit: num === 1 ? 'dia atrasado' : 'dias atrasado' };
  }
  if (diff <= 14) return { num: diff, unit: diff === 1 ? 'dia' : 'dias' };
  return { num: Math.ceil(diff / 7), unit: 'semanas' };
}

export default function Jornada({ journal }: { journal: Journal }) {
  const { state } = journal;
  const nx = nextMS(state);
  const cq = curQuarter();
  const cqi = QUARTERS.indexOf(cq);
  const blocked = nx ? blockedBy(state, nx) : [];
  const withDeps = MS.filter((m) => (m.dep || []).length > 0);

  return (
    <section>
      <div className="eyebrow-row">
        <span className="idx">05</span>
        <span className="tag">3 anos · onde estou na jornada</span>
      </div>
      <h2 className="sec">Jornada</h2>

      {nx && (
        <>
          <div className="cdown">
            <div className="cl">Próximo marco</div>
            <span className="cnum">{countdown(nx.d).num}</span>
            <span className="cunit">{countdown(nx.d).unit}</span>
            <div className="cwhat">{nx.t}</div>
            <div className="cwhen">
              {MSTYPE[nx.ty].n.toLowerCase()} · alvo{' '}
              {parseD(nx.d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
          {blocked.length > 0 && (
            <div className="alerta">
              <b>Trava:</b> este marco depende de {blocked.map(msTitle).join(' e ')}. Resolva isso antes.
            </div>
          )}
        </>
      )}

      <p className="lead">
        Doze trimestres, de ago/2026 a jun/2029.{' '}
        {cqi >= 0 && <>Você está no trimestre <b>{cqi + 1} de 12</b>.</>}
      </p>

      {JPHASES.map((ph) => (
        <div key={ph.n} className="jphase">
          <div className="jphead" style={{ ['--pc' as string]: `var(${ph.c})` }}>
            <span className="jpn">{ph.n}</span>
            <span className="jpd">{ph.d}</span>
          </div>
          {ph.qs.map((q) => {
            const here = q === cq;
            const qms = MS.filter((m) => quarterOf(m.d) === q)
              .slice()
              .sort((a, b) => (a.d < b.d ? -1 : 1));
            return (
              <div key={q} className={'jq' + (here ? ' here' : '')}>
                <div className="jqlab">
                  {QLABEL[q]}
                  {here && (
                    <>
                      <br />
                      <span className="herebadge">aqui</span>
                    </>
                  )}
                </div>
                <div className="jqms">
                  {qms.length === 0 && <div className="jqi" style={{ color: 'var(--ink-faint)' }}>—</div>}
                  {qms.map((m) => {
                    const ty = MSTYPE[m.ty];
                    const dn = msDone(state, m.id);
                    return (
                      <div key={m.id} className={'jqi' + (dn ? ' dn' : '')}>
                        <i style={{ color: `var(${ty.c})` }}>{ty.n.slice(0, 3).toLowerCase()}</i>
                        {m.t}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <h3>Dependências entre marcos</h3>
      <p className="body" style={{ fontSize: 13 }}>
        O que trava o quê. Marcos sem dependência podem ser atacados a qualquer momento.
      </p>
      {withDeps.map((m) => {
        const bl = blockedBy(state, m);
        return (
          <div key={m.id} className="dep">
            <div className="chain-line">
              {m.dep.map((d, i) => (
                <span key={d}>
                  {i > 0 && <span className="arw">+</span>}
                  {msTitle(d)}
                </span>
              ))}
              <span className="arw">→</span>
              <b>{m.t}</b>
              {bl.length > 0 ? (
                <span className="blocker-tag">travado</span>
              ) : (
                <span className="blocker-tag" style={{ color: 'var(--sage)', borderColor: 'rgba(224,225,221,.45)' }}>
                  liberado
                </span>
              )}
            </div>
          </div>
        );
      })}

      <div className="good" style={{ marginTop: 14 }}>
        <b>Um marco de experiência por trimestre, sempre.</b> Você faz essa jornada sozinho — se a única
        recompensa estivesse em 2029, três anos seria tempo demais para aguentar. Os marcos de experiência
        não servem para o currículo. Servem para a viagem valer a pena enquanto ela acontece.
      </div>
    </section>
  );
}
