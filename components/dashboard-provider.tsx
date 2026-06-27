"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { mockObras } from "@/lib/mock-data";
import { EMPTY_FILTROS, filterObras, type Filtros } from "@/lib/filters";
import type { Obra } from "@/lib/types";

interface DashboardContextValue {
  /** Dataset completo (não filtrado). */
  todasObras: Obra[];
  /** Dataset após aplicar os filtros ativos. */
  obras: Obra[];
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
  /** Liga/desliga um valor numa dimensão (usado por facetas e cross-filter). */
  toggleFiltro: (dimensao: keyof Filtros, valor: string) => void;
  /** Define exatamente os valores de uma dimensão. */
  setDimensao: (dimensao: keyof Filtros, valores: string[]) => void;
  limparFiltros: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filtros, setFiltros] = useState<Filtros>(EMPTY_FILTROS);

  const todasObras = mockObras;
  const obras = useMemo(
    () => filterObras(todasObras, filtros),
    [todasObras, filtros],
  );

  const toggleFiltro = useCallback(
    (dimensao: keyof Filtros, valor: string) => {
      setFiltros((prev) => {
        const atual = prev[dimensao];
        const proximo = atual.includes(valor)
          ? atual.filter((v) => v !== valor)
          : [...atual, valor];
        return { ...prev, [dimensao]: proximo };
      });
    },
    [],
  );

  const setDimensao = useCallback(
    (dimensao: keyof Filtros, valores: string[]) => {
      setFiltros((prev) => ({ ...prev, [dimensao]: valores }));
    },
    [],
  );

  const limparFiltros = useCallback(() => setFiltros(EMPTY_FILTROS), []);

  const value = useMemo<DashboardContextValue>(
    () => ({
      todasObras,
      obras,
      filtros,
      setFiltros,
      toggleFiltro,
      setDimensao,
      limparFiltros,
    }),
    [todasObras, obras, filtros, toggleFiltro, setDimensao, limparFiltros],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard precisa estar dentro de <DashboardProvider>");
  }
  return ctx;
}
