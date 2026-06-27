"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { countByTipologia } from "@/lib/aggregations";
import { useDashboard } from "@/components/dashboard-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Paleta de dados (PLANO.md seção 3): principais saturadas, cauda em cinza.
const PALETA_PRINCIPAL = ["#3B6CF6", "#22B8CF", "#5C7CFA", "#748FFC", "#9775FA"];
const PALETA_CAUDA = ["#52525B", "#3F3F46", "#2E2E33"];

function corDaFatia(index: number): string {
  if (index < PALETA_PRINCIPAL.length) return PALETA_PRINCIPAL[index];
  return PALETA_CAUDA[(index - PALETA_PRINCIPAL.length) % PALETA_CAUDA.length];
}

function fmtInt(n: number): string {
  return n.toLocaleString("pt-BR");
}

function fmtPct(n: number): string {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DonutTipologia() {
  const { obras, filtros, toggleFiltro } = useDashboard();
  const dados = useMemo(() => countByTipologia(obras), [obras]);
  const total = obras.length;

  const ativos = filtros.tipologia;
  const temSelecao = ativos.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Obras por tipologia
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dados}
                dataKey="quantidade"
                nameKey="categoria"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={1.5}
                stroke="none"
                isAnimationActive={false}
              >
                {dados.map((d, i) => {
                  const ativo = ativos.includes(d.categoria);
                  const opacidade = !temSelecao || ativo ? 1 : 0.25;
                  return (
                    <Cell
                      key={d.categoria}
                      fill={corDaFatia(i)}
                      fillOpacity={opacidade}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-semibold tabular-nums">
              {fmtInt(total)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              obras
            </span>
          </div>
        </div>

        <ul className="flex-1 space-y-1">
          {dados.map((d, i) => {
            const ativo = ativos.includes(d.categoria);
            return (
              <li key={d.categoria}>
                <button
                  type="button"
                  onClick={() => toggleFiltro("tipologia", d.categoria)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    temSelecao && !ativo && "opacity-50",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: corDaFatia(i) }}
                  />
                  <span className="flex-1 truncate text-foreground">
                    {d.categoria}
                  </span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {fmtInt(d.quantidade)}
                  </span>
                  <span className="w-12 text-right font-mono tabular-nums text-muted-foreground">
                    {fmtPct(d.percentual)}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
