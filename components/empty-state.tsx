"use client";

import { SearchX } from "lucide-react";

import { useDashboard } from "@/components/dashboard-provider";
import { Button } from "@/components/ui/button";

export function EmptyState({
  mensagem = "Nenhuma obra com esses filtros.",
}: {
  mensagem?: string;
}) {
  const { limparFiltros } = useDashboard();
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <SearchX className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{mensagem}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={limparFiltros}
        className="mt-1 h-8 text-xs"
      >
        Limpar filtros
      </Button>
    </div>
  );
}
