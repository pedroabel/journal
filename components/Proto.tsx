import type { Proto } from '@/lib/plan';

/** Protocolo de um bloco: passos, método, porquê, recursos, critério. */
export default function ProtoDetails({ p }: { p: Proto }) {
  return (
    <details className="proto">
      <summary>Ver protocolo — como executar</summary>
      <ol className="steps">
        {p.steps.map((s, i) => (
          <li key={i}>
            <span className="st">{s[0]}</span>
            <span dangerouslySetInnerHTML={{ __html: s[1] }} />
          </li>
        ))}
      </ol>
      <div className="prow">
        <span className="k">Método</span>
        {p.metodo}
      </div>
      <div className="prow why">
        <span className="k">Por que assim</span>
        {p.porque}
      </div>
      <div className="prow">
        <span className="k">Recursos</span>
        <div className="chips">
          {p.recursos.map((r, i) => (
            <span key={i}>{r}</span>
          ))}
        </div>
      </div>
      <div className="success">
        <b>Concluí quando:</b> {p.sucesso}
      </div>
      {p.revisao && p.revisao !== '—' && (
        <div className="prow">
          <span className="k">Revisão</span>
          {p.revisao}
        </div>
      )}
    </details>
  );
}
