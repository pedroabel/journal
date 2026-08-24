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
          <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
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
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-faint)' }}>período</span>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            style={{
              background: 'var(--bg-2)', border: '1px solid var(--line-soft)', color: 'var(--ink)',
              borderRadius: 8, padding: '6px 10px', fontFamily: 'var(--mono)', fontSize: 12,
            }}
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
          </select>
          <button
            onClick={onPreparePrompt}
            style={{
              fontFamily: 'var(--body)', fontWeight: 600, fontSize: 13, color: 'var(--bg)',
              background: 'var(--accent)', border: 'none', padding: '9px 15px', borderRadius: 8, cursor: 'pointer',
            }}
          >
            {copied === 'prompt' ? 'Copiado ✓' : 'Preparar análise (copiar prompt)'}
          </button>
          <button
            onClick={onCopyReport}
            style={{
              fontFamily: 'var(--body)', fontWeight: 600, fontSize: 13, color: 'var(--ink)',
              background: 'var(--surface-2)', border: '1px solid var(--line)', padding: '9px 15px',
              borderRadius: 8, cursor: 'pointer',
            }}
          >
            {copied === 'report' ? 'Copiado ✓' : 'Copiar relatório'}
          </button>
        </div>

        {note && (
          <div
            style={{
              background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderRadius: 10,
              padding: '14px 16px', fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.6, marginBottom: 12,
            }}
          >
            {note}
          </div>
        )}

        <pre
          style={{
            background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderRadius: 10,
            padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-dim)',
            lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0,
          }}
        >
          {report}
        </pre>
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
