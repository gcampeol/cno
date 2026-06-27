import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">
          Radar de Obras · CNO
        </span>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard em construção
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Shell e tema prontos. Próximas fases: dados mock, filtros, KPIs, mapa,
          donut e tabelas.
        </p>
      </main>
    </div>
  );
}
