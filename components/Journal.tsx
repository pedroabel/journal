'use client';

import { useState } from 'react';
import { VIEWS, type ViewId } from '@/lib/plan';
import { PROSE, PROSE_IDS } from '@/lib/prose';
import { useJournal } from './useJournal';
import Footer from './Footer';
import Hoje from './views/Hoje';
import Semana from './views/Semana';
import Mes from './views/Mes';
import Ano from './views/Ano';
import Jornada from './views/Jornada';
import Marcos from './sections/Marcos';
import Trilhas from './sections/Trilhas';
import Checklists from './sections/Checklists';
import Relatorio from './sections/Relatorio';

const REF_LINKS: [string, string][] = [
  ['marcos', 'Marcos'], ['norte', 'O Norte'], ['fases', 'Fases'], ['deps', 'Dependências'],
  ['plano', 'Plano de Ação'], ['trilhas', 'Trilhas'], ['checklists', 'Checklists'],
  ['relatorio', 'Relatório'], ['metodos', 'Métodos'], ['decisoes', 'Decisões'],
];

export default function Journal() {
  const journal = useJournal();
  const { state, ready, status, setView } = journal;

  const [selDay, setSelDay] = useState(() => new Date().getDay());
  const [selMonth, setSelMonth] = useState(() => new Date().getMonth());
  const [selYear, setSelYear] = useState(() => new Date().getFullYear());
  const [selDetail, setSelDetail] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  function shiftMonth(delta: number) {
    setSelDetail(null);
    let m = selMonth + delta;
    let y = selYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setSelMonth(m);
    setSelYear(y);
  }

  function pickView(id: ViewId) {
    setView(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const view = state.view;

  return (
    <div className="app">
      <nav className="nav">
        <button className="navtoggle" onClick={() => setNavOpen((o) => !o)} aria-expanded={navOpen}>
          <span>Sistema Unificado</span>
          <span className="bars">≡</span>
        </button>
        <div id="navBody" className={navOpen ? 'open' : undefined}>
          <div className="brand">
            <span className="kicker">Fonte única de referência</span>
            <h1>Sistema Unificado</h1>
            <div className="yr">2026 — 2029 · Irlanda</div>
          </div>
          <div className="navsec">Visões</div>
          <ul className="navlist">
            {VIEWS.map((v, i) => (
              <li key={v.id}>
                <button
                  className={v.id === view ? 'active' : undefined}
                  onClick={() => { pickView(v.id); setNavOpen(false); }}
                >
                  <span className="n">{String(i + 1).padStart(2, '0')}</span> {v.n}
                </button>
              </li>
            ))}
          </ul>
          <div className="navsec">Referência</div>
          <ul className="navlist">
            {REF_LINKS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} onClick={() => setNavOpen(false)}>
                  <span className="n">◆</span> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="main">
        <header className="hero">
          <div className="wrap">
            <span className="eyebrow">Intake alvo: set/2028 · plano B: jan/2029</span>
            <h1>Sistema Unificado</h1>
            <span id="status" className={status ? 'show' : undefined}>{status}</span>
            <div className="views">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  className={'vtab' + (v.id === view ? ' sel' : '')}
                  onClick={() => pickView(v.id)}
                >
                  {v.n}
                  <span className="q">{v.q}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="wrap">
          <div id="view">
            {!ready ? (
              <div className="loading">carregando…</div>
            ) : view === 'hoje' ? (
              <Hoje journal={journal} selDay={selDay} onSelDay={setSelDay} />
            ) : view === 'semana' ? (
              <Semana journal={journal} />
            ) : view === 'mes' ? (
              <Mes
                journal={journal}
                selYear={selYear}
                selMonth={selMonth}
                onShift={shiftMonth}
                selDetail={selDetail}
                onSelDetail={setSelDetail}
              />
            ) : view === 'ano' ? (
              <Ano journal={journal} selYear={selYear} onShift={(d) => setSelYear(selYear + d)} />
            ) : (
              <Jornada journal={journal} />
            )}
          </div>

          <div id="doc">
            <Marcos journal={journal} />
            <Prose id="norte" />
            <Prose id="fases" />
            <Prose id="deps" />
            <Prose id="plano" />
            <Trilhas journal={journal} />
            <Checklists journal={journal} />
            <Relatorio journal={journal} />
            <Prose id="metodos" />
            <Prose id="decisoes" />
            <Footer journal={journal} />
          </div>
        </div>
      </main>
    </div>
  );
}

/** Seção de texto do plano, preservada verbatim da versão anterior. */
function Prose({ id }: { id: (typeof PROSE_IDS)[number] }) {
  return <div dangerouslySetInnerHTML={{ __html: PROSE[id] }} />;
}
