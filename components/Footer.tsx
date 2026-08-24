'use client';

import { useRef, useState } from 'react';
import { today } from '@/lib/derive';
import type { Journal } from './useJournal';

/**
 * Backup manual em JSON. Com autenticação e dados no servidor isso deixa de
 * ser a única ponte entre aparelhos, mas segue valendo como cópia de segurança
 * — e é a saída se algum dia você quiser levar os dados para outro lugar.
 */
export default function Footer({ journal }: { journal: Journal }) {
  const { state, reset, importBackup, flash } = journal;
  const fileRef = useRef<HTMLInputElement>(null);
  const [armed, setArmed] = useState(false);

  function onExport() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `sistema-unificado-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    flash('backup baixado ✓');
  }

  function onImport(file: File) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        importBackup(JSON.parse(String(rd.result)));
        flash('backup restaurado ✓');
      } catch {
        flash('arquivo inválido');
      }
    };
    rd.readAsText(file);
  }

  function onReset() {
    if (armed) {
      reset();
      setArmed(false);
      return;
    }
    setArmed(true);
    setTimeout(() => setArmed(false), 3500);
  }

  return (
    <div className="footer">
      <span>Fonte única de referência · revisar a cada trimestre · privado, atrás de login</span>
      <span style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <button className="reset" onClick={onExport}>baixar backup</button>
        <button className="reset" onClick={() => fileRef.current?.click()}>restaurar backup</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = '';
          }}
        />
        <button className={'reset' + (armed ? ' armed' : '')} onClick={onReset}>
          {armed ? 'Confirmar reset?' : 'reiniciar progresso'}
        </button>
        <form action="/api/logout" method="post">
          <button className="reset" type="submit">sair</button>
        </form>
      </span>
    </div>
  );
}
