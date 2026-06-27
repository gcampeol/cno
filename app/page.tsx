import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardProvider } from "@/components/dashboard-provider";
import { KpiRow } from "@/components/kpi-row";
import { MapaCalor } from "@/components/mapa-calor";
import { DonutTipologia } from "@/components/donut-tipologia";
import { TabelasRegiao } from "@/components/tabelas-regiao";

export default function Home() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <span className="text-sm font-semibold tracking-tight">
            Radar de Obras · CNO
          </span>
          <ThemeToggle />
        </header>
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
