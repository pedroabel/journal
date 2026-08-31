'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';

import {
  TRILHAS, contar, ehFolha, folhas, progresso, proxima, proximas, travadaPor,
  type Node, type Trilha,
} from '@/lib/curriculum';
import type { JournalState } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Section, SectionTitle } from '../Section';
import type { Journal } from '../useJournal';
import { tone } from '../tone';

/** As janelas reais da rotina. "Tenho 20 minutos" é a pergunta que se faz. */
const JANELAS = [20, 45, 60, 120];

export default function Estudar({ journal }: { journal: Journal }) {
  const { state, toggleFlag } = journal;
  const [janela, setJanela] = useState<number | null>(null);

  const total = useMemo(() => {
    const f = TRILHAS.reduce((s, t) => s + contar(t).folhas, 0);
    const d = TRILHAS.reduce((s, t) => s + progresso(t, state.units).feitas, 0);
    return { feitas: d, total: f, pct: f ? Math.round((d / f) * 100) : 0 };
  }, [state.units]);

  // Uma folha por trilha: a próxima que cabe na janela escolhida.
  const cabem = useMemo(() => {
    if (!janela) return [];
    return TRILHAS
      .map((t) => ({ t, f: proximas(t, state.units, janela).filter((x) => x.min! <= janela)[0] }))
      .filter((x): x is { t: Trilha; f: Node } => !!x.f);
  }, [janela, state.units]);

  return (
    <Section
      index="06"
      eyebrow="Conteúdo · o que eu estudo"
      title="Estudar"
      description={
        <>
          O percurso inteiro, do fundamento à folha. A árvore guarda{' '}
          <b className="text-foreground font-medium">o tema e a ordem</b> — o material você procura.
        </>
      }
    >
      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <SectionTitle>Percurso</SectionTitle>
            <span className="text-muted-foreground ml-auto font-mono text-xs tabular-nums">
              {total.feitas}/{total.total} temas · {total.pct}%
            </span>
          </div>
          <Progress value={total.pct} aria-label={`${total.pct}% do percurso`} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <SectionTitle hint="para quando sobrar tempo solto">Quanto tempo você tem?</SectionTitle>
        <Card>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={janela ? String(janela) : ''}
              onValueChange={(v) => setJanela(v ? Number(v) : null)}
            >
              {JANELAS.map((m) => (
                <ToggleGroupItem key={m} value={String(m)} className="rounded-full">
                  {m}min
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {janela === null ? (
              <p className="text-muted-foreground text-xs leading-relaxed">
                Escolha uma janela e o percurso mostra o que cabe nela, sem você abrir a árvore.
              </p>
            ) : cabem.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum tema pendente cabe em {janela}min.</p>
            ) : (
              <ul className="divide-border divide-y">
                {cabem.map(({ t, f }) => (
                  <li key={t.id} style={tone(t.cor)} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                    <Checkbox
                      className="mt-0.5 size-4 rounded"
                      checked={!!state.units[f.id]}
                      aria-label={`${f.t} — concluir tema`}
                      onCheckedChange={() => toggleFlag('units', f.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground font-mono text-[0.625rem]">{t.t}</p>
                      <p className="text-sm">
                        <b className="text-[var(--tone)] font-medium">{f.t}</b>{' '}
                        <span className="text-muted-foreground font-mono text-xs">· {f.min}min</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <SectionTitle>Trilhas</SectionTitle>
        {TRILHAS.map((t) => (
          <TrilhaCard key={t.id} trilha={t} state={state} onToggle={toggleFlag} />
        ))}
      </div>
    </Section>
  );
}

function TrilhaCard({
  trilha, state, onToggle,
}: {
  trilha: Trilha;
  state: JournalState;
  onToggle: (group: 'units', key: string) => void;
}) {
  const pr = progresso(trilha, state.units);
  const atual = proxima(trilha, state.units);
  const c = contar(trilha);

  return (
    <Collapsible
      style={tone(trilha.cor)}
      className="group/tr bg-card relative overflow-hidden rounded-xl border shadow-xs"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[var(--tone)]" />

      <CollapsibleTrigger className="focus-visible:ring-ring/50 w-full cursor-pointer px-4 py-3.5 text-left outline-none focus-visible:ring-[3px]">
        <div className="flex items-start gap-2.5">
          <ChevronRight className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/tr:rotate-90" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold tracking-tight">{trilha.t}</span>
              <span className="text-muted-foreground ml-auto shrink-0 font-mono text-xs tabular-nums">
                {pr.feitas}/{pr.total} · {Math.round(c.minutos / 60)}h
              </span>
            </div>
            <Progress value={pr.pct} indicatorClassName="bg-[var(--tone)]" />
            {atual && (
              <p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
                <MapPin className="text-[var(--tone)] mt-0.5 size-3 shrink-0" />
                <span className="min-w-0">
                  você está em <b className="text-foreground font-medium">{atual.t}</b>
                </span>
              </p>
            )}
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <div className="space-y-1 border-t px-4 py-3">
          {trilha.nota && (
            <p className="text-muted-foreground pb-2 text-xs leading-relaxed">{trilha.nota}</p>
          )}
          {(trilha.filhos ?? []).map((f) => (
            <TreeNode
              key={f.id}
              node={f}
              state={state}
              onToggle={onToggle}
              atualId={atual?.id ?? null}
              nivel={0}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Um nó da árvore, recursivo. Nó interno vira dobra com contagem; folha vira
 * linha com caixa. A dobra que contém o "você está aqui" já abre aberta —
 * quem entra na trilha quer ver onde parou, não a raiz.
 */
function TreeNode({
  node, state, onToggle, atualId, nivel,
}: {
  node: Node;
  state: JournalState;
  onToggle: (group: 'units', key: string) => void;
  atualId: string | null;
  nivel: number;
}) {
  const feito = !!state.units[node.id];

  if (ehFolha(node)) {
    const travada = travadaPor(node, state.units);
    const eAtual = node.id === atualId;
    return (
      <Collapsible className="group/f">
        <div
          className={cn(
            'flex items-start gap-2.5 rounded-md py-1.5',
            eAtual && 'bg-[var(--tone)]/8 -mx-2 px-2'
          )}
        >
          <Checkbox
            className="mt-0.5 size-4 shrink-0 rounded"
            checked={feito}
            aria-label={`${node.t} — concluir tema`}
            onCheckedChange={() => onToggle('units', node.id)}
          />
          <CollapsibleTrigger className="focus-visible:ring-ring/50 min-w-0 flex-1 cursor-pointer rounded text-left outline-none focus-visible:ring-[3px]">
            <span
              className={cn(
                'text-sm',
                feito && 'text-muted-foreground line-through decoration-1',
                eAtual && !feito && 'font-medium'
              )}
            >
              {node.t}
            </span>{' '}
            <span className="text-muted-foreground font-mono text-[0.6875rem] whitespace-nowrap">
              {node.min}min
            </span>
            {eAtual && !feito && (
              <Badge className="ml-1.5 rounded-full align-middle text-[0.625rem]">aqui</Badge>
            )}
            {travada.length > 0 && !feito && (
              <Badge variant="outline" className="text-muted-foreground ml-1.5 rounded-full align-middle text-[0.625rem]">
                depende de {travada.length}
              </Badge>
            )}
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
          <div className="space-y-1.5 pt-0.5 pb-2.5 pl-6.5">
            {node.nota && (
              <p className="text-muted-foreground text-xs leading-relaxed">{node.nota}</p>
            )}
            {node.saber && (
              <>
                <p className="text-muted-foreground font-mono text-[0.625rem] tracking-wider uppercase">
                  Sei isso quando
                </p>
                <ul className="text-muted-foreground space-y-0.5 text-xs">
                  {node.saber.map((s, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span aria-hidden className="text-[var(--tone)]">·</span>
                      <span className="min-w-0 flex-1">{s}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const pr = progresso(node, state.units);
  const contemAtual = !!atualId && folhas(node).some((f) => f.id === atualId);

  return (
    <Collapsible defaultOpen={contemAtual} className="group/n">
      <CollapsibleTrigger className="hover:text-foreground focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 text-left outline-none focus-visible:ring-[3px]">
        <ChevronRight className="text-muted-foreground size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/n:rotate-90" />
        <span
          className={cn(
            'min-w-0 flex-1 truncate',
            nivel === 0 ? 'text-sm font-semibold tracking-tight' : 'text-sm'
          )}
        >
          {node.t}
        </span>
        <span
          className={cn(
            'shrink-0 font-mono text-[0.6875rem] tabular-nums',
            pr.pct === 100 ? 'text-success' : 'text-muted-foreground'
          )}
        >
          {pr.feitas}/{pr.total}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <div className="border-border/60 ml-1.5 space-y-0.5 border-l pl-3">
          {node.nota && (
            <p className="text-muted-foreground py-1 text-xs leading-relaxed">{node.nota}</p>
          )}
          {(node.filhos ?? []).map((f) => (
            <TreeNode
              key={f.id}
              node={f}
              state={state}
              onToggle={onToggle}
              atualId={atualId}
              nivel={nivel + 1}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
