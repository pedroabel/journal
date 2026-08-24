'use client';

import { JPHASES, MS, MSTYPE, type MsType } from '@/lib/plan';
import { msDone, quarterOf } from '@/lib/derive';
import type { Journal } from '../useJournal';
import Milestone from '../Milestone';

const KINDS: [MsType, string, string][] = [
  ['cap', 'Capacidade', 'Algo que você passa a saber fazer. Prova interna: mudou o que você é capaz de executar.'],
  ['cred', 'Credencial / entregável', 'Algo que existe fora de você e serve de prova para terceiros: certificado, URL, contrato, carta.'],
  ['exp', 'Experiência', 'Algo que você vive e comemora, sem utilidade para currículo. Um por trimestre, obrigatório.'],
];

export default function Marcos({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;
  const doneCount = MS.filter((m) => msDone(state, m.id)).length;

  return (
    <section id="marcos">
      <div className="eyebrow-row">
        <span className="idx">◆</span>
        <span className="tag">Sistema de marcos</span>
      </div>
      <h2 className="sec">Marcos</h2>
      <p className="lead">
        Todo marco tem <b>critério binário e verificável</b> e depende só de você. &quot;Ser fluente&quot; não é
        marco; &quot;gravar 10 min falando sem travar&quot; é.
      </p>

      <div className="grid2">
        {KINDS.map(([k, title, desc]) => (
          <div key={k} className="card" style={{ borderLeft: `3px solid var(${MSTYPE[k].c})` }}>
            <h3 style={{ margin: '0 0 4px' }}>{title}</h3>
            <p className="body" style={{ fontSize: 13, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      <h3>
        Todos os marcos{' '}
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 400 }}>
          — {doneCount}/{MS.length}
        </span>
      </h3>

      {JPHASES.map((ph) => (
        <div key={ph.n}>
          <h3 style={{ fontSize: 14, color: `var(${ph.c})` }}>{ph.n}</h3>
          {MS.filter((m) => ph.qs.includes(quarterOf(m.d)))
            .slice()
            .sort((a, b) => (a.d < b.d ? -1 : 1))
            .map((m) => (
              <Milestone key={m.id} m={m} state={state} onToggle={toggleFlag} />
            ))}
        </div>
      ))}
    </section>
  );
}
