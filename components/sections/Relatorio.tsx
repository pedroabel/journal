'use client';

import { useMemo, useState } from 'react';
import { analysisPrompt, buildReport } from '@/lib/report';
import type { Journal } from '../useJournal';

/** Copia texto sem depender de permissão de clipboard moderna. */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}

export default function Relatorio({ journal }: { journal: Journal }) {
  const { state } = journal;
  const [range, setRange] = useState(30);
  const [note, setNote] = useState<React.ReactNode>(null);
  const [copied, setCopied] = useState<'none' | 'report' | 'prompt'>('none');

  const report = useMemo(() => buildReport(state, range), [state, range]);

  async function onCopyReport() {
    if (await copy(report)) {
      setCopied('report');
      setTimeout(() => setCopied('none'), 2000);
    }
  }

  async function onPreparePrompt() {
    if (await copy(analysisPrompt(report))) {
      setCopied('prompt');
      setTimeout(() => setCopied('none'), 2000);
      setNote(
        <>
          Prompt copiado. Abra{' '}
          <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">
            claude.ai
          </a>{' '}
          e cole (Ctrl+V / ⌘V) para receber a análise.
        </>
      );
    }
  }

  return (
    <section id="relatorio">
      <div className="eyebrow-row">
        <span className="idx">◆</span>
        <span className="tag">Acompanhamento externo</span>
      </div>
      <h2 className="sec">Relatório</h2>
      <p className="lead">
        O sistema compila sozinho. <b>Preparar análise</b> copia o prompt pronto (contexto + relatório)
        para colar no Claude; <b>Copiar relatório</b> gera só o texto dos números.
      </p>

      <div className="card">
        <div className="repctl">
          <span className="replab">período</span>
          <select className="repsel" value={range} onChange={(e) => setRange(Number(e.target.value))} aria-label="período do relatório">
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
          </select>
          <button className="repgo" onClick={onPreparePrompt}>
            {copied === 'prompt' ? 'Copiado ✓' : 'Preparar análise (copiar prompt)'}
          </button>
          <button className="repalt" onClick={onCopyReport}>
            {copied === 'report' ? 'Copiado ✓' : 'Copiar relatório'}
          </button>
        </div>

        {note && <div className="repnote">{note}</div>}

        <pre className="repout">{report}</pre>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Quando trazer</h3>
        <ul className="msl" style={{ ['--pc' as string]: 'var(--accent)' }}>
          <li><span className="d">◆</span><div><b>Uma vez por mês</b> — o ritmo padrão.</div></li>
          <li><span className="d">◆</span><div><b>Ao bater um marco</b> — ou quando um passar do alvo.</div></li>
          <li><span className="d">◆</span><div><b>Se algo travar 2 semanas</b> — o problema é o desenho da rotina.</div></li>
          <li><span className="d">◆</span><div><b>Diante de uma decisão real</b> — escolher escola, aceitar vaga, mexer no prazo.</div></li>
        </ul>
      </div>
    </section>
  );
}
