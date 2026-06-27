import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardProvider } from "@/components/dashboard-provider";
import { CommandPalette } from "@/components/command-palette";
import { FiltrosBar } from "@/components/filtros/filtros-bar";
import { KpiRow } from "@/components/kpi-row";
import { MapaCalor } from "@/components/mapa-calor";
import { DonutTipologia } from "@/components/donut-tipologia";
import { TabelasRegiao } from "@/components/tabelas-regiao";

// Dashboard dirigido por estado na URL (nuqs/useSearchParams): renderiza sob
// demanda em vez de prerender estático.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <span className="text-sm font-semibold tracking-tight">
            Radar de Obras · CNO
          </span>
          <div className="flex items-center gap-2">
            <CommandPalette />
            <ThemeToggle />
          </div>
        </header>
        <FiltrosBar />
        <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
          <KpiRow />
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <MapaCalor />
            <div className="space-y-6">
              <DonutTipologia />
              <TabelasRegiao />
            </div>
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
