'use client';

import { ChevronRight } from 'lucide-react';

import type { Proto } from '@/lib/plan';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

/** Protocolo de um bloco: passos, método, porquê, recursos, critério. */
export default function ProtoDetails({ p }: { p: Proto }) {
  return (
    <Collapsible className="group/proto border-t">
      <CollapsibleTrigger className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-1.5 rounded-md py-2.5 text-left text-xs font-medium transition-colors outline-none focus-visible:ring-[3px]">
        <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/proto:rotate-90" />
        Ver protocolo — como executar
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <div className="space-y-4 pt-1 pb-4">
          <ol className="space-y-2.5">
            {p.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[0.625rem]">
                  {i + 1}
                </span>
                <span className="text-muted-foreground min-w-0">
                  <span className="text-[var(--tone)] mr-1.5 font-mono text-xs">{s[0]}</span>
                  <span
                    className="[&_b]:text-foreground [&_b]:font-medium"
                    dangerouslySetInnerHTML={{ __html: s[1] }}
                  />
                </span>
              </li>
            ))}
          </ol>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Método">{p.metodo}</Field>
            <Field label="Por que assim">{p.porque}</Field>
          </dl>

          <div>
            <Label>Recursos</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {p.recursos.map((r, i) => (
                <Badge key={i} variant="secondary" className="font-normal">
                  {r}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-success/10 border-success/25 rounded-md border px-3 py-2 text-sm">
            <span className="text-foreground font-medium">Concluí quando:</span>{' '}
            <span className="text-muted-foreground">{p.sucesso}</span>
          </div>

          {p.revisao && p.revisao !== '—' && <Field label="Revisão">{p.revisao}</Field>}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <dt className="text-muted-foreground font-mono text-[0.625rem] tracking-wider uppercase">
      {children}
    </dt>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 rounded-md px-3 py-2">
      <Label>{label}</Label>
      <dd className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}
