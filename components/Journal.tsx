'use client';

import { useState } from 'react';

import { VIEWS, type ViewId } from '@/lib/plan';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppSidebar from './layout/AppSidebar';
import Footer from './Footer';
import { useJournal } from './useJournal';
import ViewSkeleton from './ViewSkeleton';
import Hoje from './views/Hoje';
import Semana from './views/Semana';
import Mes from './views/Mes';
import Ano from './views/Ano';
import Jornada from './views/Jornada';
import Marcos from './sections/Marcos';
import Norte from './sections/Norte';
import Fases from './sections/Fases';
import Dependencias from './sections/Dependencias';
import PlanoDeAcao from './sections/PlanoDeAcao';
import Trilhas from './sections/Trilhas';
import Checklists from './sections/Checklists';
import Relatorio from './sections/Relatorio';
import Metodos from './sections/Metodos';
import Decisoes from './sections/Decisoes';

export default function Journal() {
  const journal = useJournal();
  const { state, ready, status, setView } = journal;

  const [selDay, setSelDay] = useState(() => new Date().getDay());
  const [selMonth, setSelMonth] = useState(() => new Date().getMonth());
  const [selYear, setSelYear] = useState(() => new Date().getFullYear());
  const [selDetail, setSelDetail] = useState<string | null>(null);

  function shiftMonth(delta: number) {
    setSelDetail(null);
    let m = selMonth + delta;
    let y = selYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setSelMonth(m);
    setSelYear(y);
  }

  function pickView(id: ViewId) {
    setView(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const view = state.view;
  const current = VIEWS.find((v) => v.id === view);

  return (
    <SidebarProvider>
      <AppSidebar view={view} onPickView={pickView} />

      <SidebarInset>
        <header className="bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-20 border-b backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:px-10">
            <SidebarTrigger className="-ml-2" />
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-sm font-semibold tracking-tight">
                {current?.n ?? 'Sistema Unificado'}
              </span>
              <span className="text-muted-foreground hidden truncate text-xs sm:inline">
                {current?.q}
              </span>
            </div>
            <div className="ml-auto pl-2">
              <SyncStatus status={status} />
            </div>
          </div>

          <div className="no-scrollbar overflow-x-auto px-4 pb-2.5 sm:px-6 lg:px-10">
            <Tabs value={view} onValueChange={(v) => pickView(v as ViewId)}>
              <TabsList className="w-max">
                {VIEWS.map((v) => (
                  <TabsTrigger key={v.id} value={v.id} className="px-3">
                    {v.n}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </header>

        <div className="mx-auto w-full max-w-4xl px-4 pb-[max(4rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-10">
          {!ready ? (
            <ViewSkeleton />
          ) : view === 'hoje' ? (
            <Hoje journal={journal} selDay={selDay} onSelDay={setSelDay} />
          ) : view === 'semana' ? (
            <Semana journal={journal} />
          ) : view === 'mes' ? (
            <Mes
              journal={journal}
              selYear={selYear}
              selMonth={selMonth}
              onShift={shiftMonth}
              selDetail={selDetail}
              onSelDetail={setSelDetail}
            />
          ) : view === 'ano' ? (
            <Ano journal={journal} selYear={selYear} onShift={(d) => setSelYear(selYear + d)} />
          ) : (
            <Jornada journal={journal} />
          )}

          <Separator />

          <div className="divide-border divide-y">
            <Marcos journal={journal} />
            <Norte />
            <Fases />
            <Dependencias />
            <PlanoDeAcao />
            <Trilhas journal={journal} />
            <Checklists journal={journal} />
            <Relatorio journal={journal} />
            <Metodos />
            <Decisoes />
          </div>

          <Footer journal={journal} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Sinal de sincronização. Ocupa espaço fixo mesmo vazio para o cabeçalho não
 * saltar quando a mensagem aparece e some.
 */
function SyncStatus({ status }: { status: string }) {
  return (
    <span
      aria-live="polite"
      className={cn(
        'text-muted-foreground inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 font-mono text-[0.6875rem] transition-opacity duration-300',
        status ? 'bg-muted opacity-100' : 'opacity-0'
      )}
    >
      {status}
    </span>
  );
}
