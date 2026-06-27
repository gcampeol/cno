import { ThemeToggle } from "@/components/theme-toggle";
import { KpiRow } from "@/components/kpi-row";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">
          Radar de Obras · CNO
        </span>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <KpiRow />
        <p className="text-sm text-muted-foreground">
          Próximas fases: mapa de calor, donut por tipologia, tabelas e filtros.
        </p>
      </main>
    </div>
  );
}
