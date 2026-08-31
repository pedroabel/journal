'use client';

import {
  Activity,
  Brain,
  CalendarDays,
  Compass,
  BookOpen,
  FileText,
  GitBranch,
  Layers,
  LayoutGrid,
  ListChecks,
  ListTodo,
  Route,
  Scale,
  SquareCheck,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

import { VIEWS, type ViewId } from '@/lib/plan';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';

const VIEW_ICON: Record<ViewId, LucideIcon> = {
  hoje: ListChecks,
  semana: Activity,
  mes: CalendarDays,
  ano: LayoutGrid,
  jornada: Route,
  estudar: BookOpen,
};

/** Seções de referência: âncoras na mesma página, na ordem em que aparecem. */
const REF_LINKS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'marcos', label: 'Marcos', icon: Target },
  { id: 'norte', label: 'O Norte', icon: Compass },
  { id: 'fases', label: 'Fases', icon: Layers },
  { id: 'deps', label: 'Dependências', icon: GitBranch },
  { id: 'plano', label: 'Plano de Ação', icon: ListTodo },
  { id: 'trilhas', label: 'Trilhas', icon: TrendingUp },
  { id: 'checklists', label: 'Checklists', icon: SquareCheck },
  { id: 'relatorio', label: 'Relatório', icon: FileText },
  { id: 'metodos', label: 'Métodos', icon: Brain },
  { id: 'decisoes', label: 'Decisões', icon: Scale },
];

export default function AppSidebar({
  view,
  onPickView,
}: {
  view: ViewId;
  onPickView: (id: ViewId) => void;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-1">
          <p className="text-muted-foreground font-mono text-[0.625rem] tracking-[0.14em] uppercase">
            Fonte única de referência
          </p>
          <h1 className="mt-1.5 text-[0.9375rem] leading-tight font-semibold tracking-tight">
            Sistema Unificado
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-xs">2026 — 2029 · Irlanda</p>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Visões</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {VIEWS.map((v) => {
                const Icon = VIEW_ICON[v.id];
                return (
                  <SidebarMenuItem key={v.id}>
                    <SidebarMenuButton
                      isActive={v.id === view}
                      onClick={() => {
                        onPickView(v.id);
                        setOpenMobile(false);
                      }}
                    >
                      <Icon />
                      <span>{v.n}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Referência</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {REF_LINKS.map(({ id, label, icon: Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton asChild size="sm">
                    <a href={`#${id}`} onClick={() => setOpenMobile(false)}>
                      <Icon />
                      <span>{label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-muted-foreground px-2 font-mono text-[0.6875rem] leading-relaxed">
          Intake alvo: set/2028
          <br />
          Plano B: jan/2029
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
