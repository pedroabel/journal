'use client';

import { AlertTriangle, CalendarClock, CircleCheck, TriangleAlert } from 'lucide-react';

import { emRisco, hm, ritmos, type Ritmo as R, type RitmoDeRamo } from '@/lib/ritmo';
import type { JournalState } from '@/lib/state';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SectionTitle } from './Section';

/** '2027-03-31' → 'mar/2027'. Data cheia não cabe e não acrescenta nada aqui. */
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function quando(iso: string): string {
  return `${MES[Number(iso.slice(5, 7)) - 1]}/${iso.slice(0, 4)}`;
}

function semanas(n: number): string {
  const v = Math.abs(Math.round(n));
  return v === 1 ? '1 semana' : `${v} semanas`;
}

/** A margem em uma frase — é o que se lê primeiro. */
export function RitmoBadge({ r }: { r: R }) {
  if (r.veredito === 'concluida') {
    return <Badge variant="outline" className="text-success rounded-full">concluída</Badge>;
  }
  if (r.veredito === 'atrasa') {
    return (
      <Badge variant="destructive" className="rounded-full">
        {r.margem === null ? 'vencido' : `${semanas(r.margem)} tarde`}
      </Badge>
    );
  }
  if (r.veredito === 'no-limite') {
    return <Badge variant="warning" className="rounded-full">no limite</Badge>;
  }
  if (r.veredito === 'folga') {
    return (
      <Badge variant="outline" className="text-muted-foreground rounded-full">
        {semanas(r.margem ?? 0)} de folga
      </Badge>
    );
  }
  if (r.veredito === 'sem-ritmo') {
    return <Badge variant="warning" className="rounded-full">sem bloco</Badge>;
  }
  return null;
}

/**
 * O ritmo de um ramo, por extenso.
 *
 * Mostra as três velocidades separadas de propósito. Capacidade abaixo do
 * necessário é problema de desenho da rotina; ritmo real abaixo da capacidade
 * é problema de execução. Juntar os dois num número só devolveria "atrasado"
 * sem dizer o que fazer a respeito.
 */
export function RitmoLinha({ r, className }: { r: R; className?: string }) {
  if (r.veredito === 'sem-alvo') return null;

  if (r.veredito === 'concluida') {
    return (
      <p className={cn('text-success flex items-center gap-1.5 text-xs', className)}>
        <CircleCheck className="size-3.5 shrink-0" />
        Nada pendente neste ramo.
      </p>
    );
  }

  const projecao = r.fimNoReal ?? r.fimNaCapacidade;

  return (
    <div className={cn('space-y-1.5 text-xs leading-relaxed', className)}>
      <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
        <CalendarClock className="size-3.5 shrink-0" />
        <span>
          alvo <b className="text-foreground font-medium">{quando(r.alvo!)}</b>
          {r.semanas !== null && r.semanas > 0 && <> · faltam {semanas(r.semanas)}</>}
        </span>
        <span aria-hidden className="bg-border h-3 w-px" />
        <span>restam <b className="text-foreground font-medium">{hm(r.restanteMin)}</b></span>
      </p>

      <dl className="text-muted-foreground grid grid-cols-3 gap-2 font-mono text-[0.6875rem]">
        <Vel rotulo="precisa" v={r.precisa} />
        <Vel rotulo="rotina dá" v={r.capacidade || null} />
        <Vel rotulo="você faz" v={r.real} />
      </dl>

      {r.veredito === 'sem-ritmo' ? (
        <p className="text-warning">
          {r.capacidade === 0
            ? 'Nenhum bloco da semana alimenta este ramo — ele acontece nas brechas ou não acontece.'
            : 'Sem dados ainda para estimar o seu ritmo real.'}
        </p>
      ) : (
        <p
          className={cn(
            r.veredito === 'atrasa' ? 'text-destructive'
              : r.veredito === 'no-limite' ? 'text-warning' : 'text-muted-foreground'
          )}
        >
          {r.margem === null
            ? 'O alvo já venceu.'
            : <>
                No ritmo {r.fimNoReal ? 'atual' : 'da rotina'}, termina em{' '}
                <b className="font-medium">{quando(projecao!)}</b>
                {' — '}
                {r.margem >= 0
                  ? `${semanas(r.margem)} antes do alvo.`
                  : `${semanas(r.margem)} depois do alvo.`}
              </>}
        </p>
      )}

      {!r.suficiente && (
        <p className="text-muted-foreground border-t pt-1.5">
          Concluir a árvore é condição necessária, não suficiente: este marco também depende de
          prática repetida, de prova ou de terceiros. A folga acima é do conteúdo.
        </p>
      )}
    </div>
  );
}

function Vel({ rotulo, v }: { rotulo: string; v: number | null }) {
  return (
    <div>
      <dt className="text-[0.625rem] tracking-wider uppercase">{rotulo}</dt>
      <dd className={cn('tabular-nums', v === null && 'opacity-50')}>
        {v === null ? '—' : `${hm(v)}/sem`}
      </dd>
    </div>
  );
}

/**
 * O resumo do percurso contra o calendário.
 *
 * Existe para responder uma pergunta só, e antes de qualquer trilha ser
 * aberta: alguma coisa não vai dar tempo?
 */
export function RitmoResumo({ state }: { state: JournalState }) {
  const todos = ritmos(state);
  const risco = emRisco(state);
  const semBloco = todos.filter((x) => x.r.veredito === 'sem-ritmo' && x.r.capacidade === 0);

  return (
    <div className="space-y-3">
      <SectionTitle hint="conteúdo restante contra a data do marco">Ritmo</SectionTitle>

      {risco.length > 0 ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>
            {risco.length === 1 ? '1 ramo não fecha no prazo' : `${risco.length} ramos não fecham no prazo`}
          </AlertTitle>
          <AlertDescription>
            <ul className="space-y-1">
              {risco.map(({ trilha, no, r }) => (
                <li key={no.id}>
                  <b className="font-medium">{no.id === trilha.id ? no.t : `${trilha.t} › ${no.t}`}</b>
                  {' — '}
                  {r.margem === null ? 'alvo vencido' : `${semanas(r.margem)} depois de ${quando(r.alvo!)}`}
                  {r.capacidade > 0 && r.precisa !== null && (
                    <> · precisaria de {hm(r.precisa)}/sem, a rotina dá {hm(r.capacidade)}</>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed">
            <p>
              <b className="text-foreground font-medium">Todo o conteúdo cabe no calendário.</b>{' '}
              Nenhum ramo com bloco na rotina termina depois do seu marco.
            </p>
            <p className="text-xs">
              O que isto diz e o que não diz: o volume de estudo não é o risco do plano — a
              execução é. As trilhas de prática (inglês, algoritmos, carreira) fecham o conteúdo
              com folga e ainda assim dependem de repetição que esta conta não mede.
            </p>
          </CardContent>
        </Card>
      )}

      {semBloco.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>
            {semBloco.length === 1
              ? '1 ramo com prazo e sem bloco na semana'
              : `${semBloco.length} ramos com prazo e sem bloco na semana`}
          </AlertTitle>
          <AlertDescription>
            <p>
              A rotina não reserva tempo para eles. Acontecem nas brechas — ou não acontecem.
            </p>
            <ul className="mt-1 space-y-1">
              {semBloco
                .slice()
                .sort((a, b) => (a.r.alvo! < b.r.alvo! ? -1 : 1))
                .map(({ trilha, no, r }) => (
                  <li key={no.id}>
                    <b className="font-medium">{no.id === trilha.id ? no.t : `${trilha.t} › ${no.t}`}</b>
                    {' — '}
                    {hm(r.restanteMin)} até {quando(r.alvo!)}
                    {r.precisa !== null && <> ({hm(r.precisa)}/sem)</>}
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export type { RitmoDeRamo };
