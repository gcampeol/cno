"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";

import { getDataProvider } from "@/lib/data-provider";
import { filterObras, type Filtros } from "@/lib/filters";
import type { Obra } from "@/lib/types";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

interface DashboardContextValue {
  todasObras: Obra[];
  obras: Obra[];
  filtros: Filtros;
  toggleFiltro: (dimensao: keyof Filtros, valor: string) => void;
  setDimensao: (dimensao: keyof Filtros, valores: string[]) => void;
  limparFiltros: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const arr = () => parseAsArrayOf(parseAsString).withDefault([]);

const filtroParsers = {
  tipologia: arr(),
  situacao: arr(),
  metragem: arr(),
  responsavelTipo: arr(),
  uf: arr(),
  municipio: arr(),
  bairro: arr(),
  ano: arr(),
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filtros, setFiltros] = useQueryStates(filtroParsers, {
    history: "replace",
    clearOnDefault: true,
  });

  // Fonte de dados (mock ou Supabase) carregada de forma assíncrona.
  const [todasObras, setTodasObras] = useState<Obra[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    getDataProvider()
      .getAllObras()
      .then((dados) => {
        if (!cancelado) setTodasObras(dados);
      })
      .catch((err) => {
        console.error("Falha ao carregar obras:", err);
        if (!cancelado) setTodasObras([]);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const base = todasObras ?? [];
  const obras = useMemo(() => filterObras(base, filtros), [base, filtros]);

  const toggleFiltro = useCallback(
    (dimensao: keyof Filtros, valor: string) => {
      const atual = filtros[dimensao];
      const proximo = atual.includes(valor)
        ? atual.filter((v) => v !== valor)
        : [...atual, valor];
      void setFiltros({ [dimensao]: proximo } as Partial<Filtros>);
    },
    [filtros, setFiltros],
  );

  const setDimensao = useCallback(
    (dimensao: keyof Filtros, valores: string[]) => {
      void setFiltros({ [dimensao]: valores } as Partial<Filtros>);
    },
    [setFiltros],
  );

  const limparFiltros = useCallback(() => {
    void setFiltros({
      tipologia: [],
      situacao: [],
      metragem: [],
      responsavelTipo: [],
      uf: [],
      municipio: [],
      bairro: [],
      ano: [],
    });
  }, [setFiltros]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      todasObras: base,
      obras,
      filtros,
      toggleFiltro,
      setDimensao,
      limparFiltros,
    }),
    [base, obras, filtros, toggleFiltro, setDimensao, limparFiltros],
  );

  if (todasObras === null) {
    return <DashboardSkeleton />;
  }

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
