import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Estado vazio padrão. Uma só forma para "não há nada aqui" em todo o sistema:
 * ícone opcional, título curto, uma linha de explicação.
 */
function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center',
        className
      )}
      {...props}
    />
  );
}

function EmptyMedia({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-media"
      className={cn(
        'bg-muted text-muted-foreground mb-1 flex size-9 items-center justify-center rounded-full [&_svg]:size-4',
        className
      )}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="empty-description"
      className={cn('text-muted-foreground max-w-sm text-sm text-balance', className)}
      {...props}
    />
  );
}

export { Empty, EmptyMedia, EmptyTitle, EmptyDescription };
