'use client';

import { useRef, useState } from 'react';
import { Download, LogOut, RotateCcw, Upload } from 'lucide-react';

import { today } from '@/lib/derive';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    <footer className="py-10">
      <Separator className="mb-6" />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Fonte única de referência · revisar a cada trimestre · privado, atrás de login
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download />
            Baixar backup
          </Button>

          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload />
            Restaurar backup
          </Button>
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

          <Button
            variant={armed ? 'destructive' : 'outline'}
            size="sm"
            onClick={onReset}
          >
            <RotateCcw />
            {armed ? 'Confirmar reset?' : 'Reiniciar progresso'}
          </Button>

          <form action="/api/logout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut />
              Sair
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
}
