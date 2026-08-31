import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Casca única de seção. Toda tela e toda seção de referência passa por aqui:
 * mesmo espaçamento, mesma hierarquia (rótulo → título → linha de apoio) e
 * mesma divisória. É o que impede telas de mesma finalidade de divergirem.
 */
export function Section({
  eyebrow,
  index,
  title,
  description,
  actions,
  className,
  children,
  ...props
}: React.ComponentProps<'section'> & {
  eyebrow?: string;
  index?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className={cn('scroll-mt-24 py-10 first:pt-8', className)} {...props}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {(eyebrow || index) && (
            <div className="text-muted-foreground mb-2 flex items-center gap-2 font-mono text-[0.6875rem] tracking-wider uppercase">
              {index && <span className="text-foreground/70">{index}</span>}
              {index && eyebrow && <span aria-hidden className="bg-border h-3 w-px" />}
              {eyebrow && <span>{eyebrow}</span>}
            </div>
          )}
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </h2>
          {description && (
            <div className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed text-pretty">
              {description}
            </div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

/** Subtítulo dentro de uma seção. Um só tamanho, um só peso, em todo o sistema. */
export function SectionTitle({
  className,
  hint,
  children,
  ...props
}: React.ComponentProps<'h3'> & { hint?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 className={cn('text-base font-semibold tracking-tight', className)} {...props}>
        {children}
      </h3>
      {hint && <span className="text-muted-foreground font-mono text-xs">{hint}</span>}
    </div>
  );
}

/** Divisória rotulada. Separa janelas do dia, grupos de lista, etc. */
export function Rule({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <span className="text-muted-foreground font-mono text-[0.6875rem] tracking-wider uppercase">
        {children}
      </span>
      <span aria-hidden className="bg-border h-px flex-1" />
    </div>
  );
}
