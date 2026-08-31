import { Skeleton } from '@/components/ui/skeleton';

/**
 * Carregamento. O primeiro render é sempre o estado vazio (no servidor não
 * existe localStorage), então este esqueleto ocupa o lugar do conteúdo até o
 * estado local entrar — com a mesma silhueta da tela que vem depois.
 */
export default function ViewSkeleton() {
  return (
    <section className="py-10" aria-busy="true" aria-label="carregando">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-3 h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-full max-w-md" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}
