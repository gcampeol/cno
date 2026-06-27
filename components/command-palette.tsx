"use client";

import { useEffect, useMemo, useState } from "react";

import { useDashboard } from "@/components/dashboard-provider";
import type { Opcao } from "@/components/filtros/faceted-filter";
import type { Filtros } from "@/lib/filters";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { TIPOLOGIAS } from "@/lib/types";
import {
  METRAGEM_BUCKETS,
  anosDisponiveis,
  opcoesDistintas,
} from "@/lib/filters";

interface Grupo {
  dim: keyof Filtros;
  titulo: string;
  opcoes: Opcao[];
}

export function CommandPalette() {
  const { todasObras, toggleFiltro } = useDashboard();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const grupos = useMemo<Grupo[]>(() => {
    const opc = (vals: string[]): Opcao[] =>
      vals.map((v) => ({ value: v, label: v }));
    return [
      { dim: "tipologia", titulo: "Tipologia", opcoes: opc([...TIPOLOGIAS]) },
      {
        dim: "situacao",
        titulo: "Situação",
        opcoes: opc(["ativa", "paralisada", "encerrada", "nula"]),
      },
      {
        dim: "metragem",
        titulo: "Metragem",
        opcoes: METRAGEM_BUCKETS.map((b) => ({ value: b.id, label: b.label })),
      },
      {
        dim: "responsavelTipo",
        titulo: "Responsável",
        opcoes: [
          { value: "PF", label: "Pessoa física" },
          { value: "PJ", label: "Pessoa jurídica" },
        ],
      },
      { dim: "uf", titulo: "Estado", opcoes: opc(opcoesDistintas(todasObras, "uf")) },
      {
        dim: "municipio",
        titulo: "Cidade",
        opcoes: opc(opcoesDistintas(todasObras, "municipio")),
      },
      {
        dim: "bairro",
        titulo: "Bairro",
        opcoes: opc(opcoesDistintas(todasObras, "bairro")),
      },
      { dim: "ano", titulo: "Ano", opcoes: opc(anosDisponiveis(todasObras)) },
    ];
  }, [todasObras]);

  const aplicar = (dim: keyof Filtros, valor: string) => {
    toggleFiltro(dim, valor);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 gap-2 text-xs text-muted-foreground"
      >
        Buscar filtro
        <kbd className="pointer-events-none hidden rounded border bg-muted px-1 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar e aplicar filtro…" />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          {grupos.map((g) => (
            <CommandGroup key={g.dim} heading={g.titulo}>
              {g.opcoes.map((op) => (
                <CommandItem
                  key={`${g.dim}-${op.value}`}
                  value={`${g.titulo} ${op.label}`}
                  onSelect={() => aplicar(g.dim, op.value)}
                >
                  {op.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
