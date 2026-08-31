'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';

import { analysisPrompt, buildReport } from '@/lib/report';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Section } from '../Section';
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

const QUANDO: [string, string][] = [
  ['Uma vez por mês', 'o ritmo padrão.'],
  ['Ao bater um marco', 'ou quando um passar do alvo.'],
  ['Se algo travar 2 semanas', 'o problema é o desenho da rotina.'],
  ['Diante de uma decisão real', 'escolher escola, aceitar vaga, mexer no prazo.'],
];

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
          <a
            className="text-foreground font-medium underline underline-offset-4"
            href="https://claude.ai/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            claude.ai
          </a>{' '}
          e cole (Ctrl+V / ⌘V) para receber a análise.
        </>
      );
    }
  }

  return (
    <Section
      id="relatorio"
      index="◆"
      eyebrow="Acompanhamento externo"
      title="Relatório"
      description={
        <>
          O sistema compila sozinho.{' '}
          <b className="text-foreground font-medium">Preparar análise</b> copia o prompt pronto
          (contexto + relatório) para colar no Claude;{' '}
          <b className="text-foreground font-medium">Copiar relatório</b> gera só o texto dos
          números.
        </>
      }
    >
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground mr-1 font-mono text-xs">período</span>
            <Select value={String(range)} onValueChange={(v) => setRange(Number(v))}>
              <SelectTrigger size="sm" className="w-28" aria-label="período do relatório">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" onClick={onPreparePrompt} className="max-sm:flex-1">
              {copied === 'prompt' ? <Check /> : <Sparkles />}
              {copied === 'prompt' ? 'Copiado ✓' : 'Preparar análise'}
            </Button>

            <Button variant="outline" size="sm" onClick={onCopyReport} className="max-sm:flex-1">
              {copied === 'report' ? <Check /> : <Copy />}
              {copied === 'report' ? 'Copiado ✓' : 'Copiar relatório'}
            </Button>
          </div>

          {note && (
            <Alert variant="muted">
              <AlertDescription>
                <p>{note}</p>
              </AlertDescription>
            </Alert>
          )}

          <pre className="bg-muted/50 text-muted-foreground overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
            {report}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quando trazer</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-border divide-y">
            {QUANDO.map(([label, desc]) => (
              <li key={label} className="py-2.5 text-sm first:pt-0 last:pb-0">
                <b className="font-medium">{label}</b>{' '}
                <span className="text-muted-foreground">— {desc}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Section>
  );
}
