"use client";

import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { useDashboard } from "@/components/dashboard-provider";
import { FacetedFilter, type Opcao } from "@/components/filtros/faceted-filter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TIPOLOGIAS } from "@/lib/types";
import {
  METRAGEM_BUCKETS,
  anosDisponiveis,
  countFiltrosAtivos,
  opcoesDistintas,
  temFiltroAtivo,
} from "@/lib/filters";

const SITUACAO_OPCOES: Opcao[] = [
  { value: "ativa", label: "Ativa" },
  { value: "paralisada", label: "Paralisada" },
  { value: "encerrada", label: "Encerrada" },
  { value: "nula", label: "Nula" },
];

const RESPONSAVEL_OPCOES: Opcao[] = [
  { value: "PF", label: "Pessoa física" },
  { value: "PJ", label: "Pessoa jurídica" },
];

const TIPOLOGIA_OPCOES: Opcao[] = TIPOLOGIAS.map((t) => ({
  value: t,
  label: t,
}));

const METRAGEM_OPCOES: Opcao[] = METRAGEM_BUCKETS.map((b) => ({
  value: b.id,
  label: b.label,
}));

function FiltrosLista() {
  const { todasObras, filtros, limparFiltros } = useDashboard();

  const { ufOpcoes, municipioOpcoes, bairroOpcoes, anoOpcoes } = useMemo(() => {
    const baseMun = filtros.uf.length
      ? todasObras.filter((o) => filtros.uf.includes(o.uf))
      : todasObras;
    const baseBairro = filtros.municipio.length
      ? baseMun.filter((o) => filtros.municipio.includes(o.municipio))
      : baseMun;
    const toOpcoes = (vals: string[]): Opcao[] =>
      vals.map((v) => ({ value: v, label: v }));
    return {
      ufOpcoes: toOpcoes(opcoesDistintas(todasObras, "uf")),
      municipioOpcoes: toOpcoes(opcoesDistintas(baseMun, "municipio")),
      bairroOpcoes: toOpcoes(opcoesDistintas(baseBairro, "bairro")),
      anoOpcoes: toOpcoes(anosDisponiveis(todasObras)),
    };
  }, [todasObras, filtros.uf, filtros.municipio]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FacetedFilter dim="tipologia" titulo="Tipologia" opcoes={TIPOLOGIA_OPCOES} />
      <FacetedFilter dim="situacao" titulo="Situação" opcoes={SITUACAO_OPCOES} />
      <FacetedFilter dim="metragem" titulo="Metragem" opcoes={METRAGEM_OPCOES} />
      <FacetedFilter
        dim="responsavelTipo"
        titulo="Responsável"
        opcoes={RESPONSAVEL_OPCOES}
      />
      <FacetedFilter dim="uf" titulo="Estado" opcoes={ufOpcoes} />
      <FacetedFilter dim="municipio" titulo="Cidade" opcoes={municipioOpcoes} />
      <FacetedFilter dim="bairro" titulo="Bairro" opcoes={bairroOpcoes} />
      <FacetedFilter dim="ano" titulo="Ano" opcoes={anoOpcoes} />

      {temFiltroAtivo(filtros) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={limparFiltros}
          className="h-8 px-2 text-xs text-muted-foreground"
        >
          Limpar
          <X className="ml-1 h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function FiltrosBar() {
  const { filtros } = useDashboard();
  const ativos = countFiltrosAtivos(filtros);

  return (
    <div className="sticky top-16 z-40 border-b border-border bg-background/80 px-4 py-2 backdrop-blur sm:px-6">
      {/* Desktop: filtros inline */}
      <div className="hidden sm:block">
        <FiltrosLista />
      </div>

      {/* Mobile: botão que abre Sheet */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filtros
              {ativos > 0 && (
                <span className="ml-1.5 rounded bg-primary px-1.5 font-mono text-[10px] text-primary-foreground">
                  {ativos}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <FiltrosLista />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
