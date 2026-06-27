"use client";

import { Check, PlusCircle } from "lucide-react";

import { useDashboard } from "@/components/dashboard-provider";
import type { Filtros } from "@/lib/filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Opcao {
  value: string;
  label: string;
}

interface FacetedFilterProps {
  dim: keyof Filtros;
  titulo: string;
  opcoes: Opcao[];
}

export function FacetedFilter({ dim, titulo, opcoes }: FacetedFilterProps) {
  const { filtros, toggleFiltro } = useDashboard();
  const selecionados = new Set(filtros[dim]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed text-xs"
        >
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
          {titulo}
          {selecionados.size > 0 && (
            <>
              <span className="mx-2 h-4 w-px bg-border" />
              <Badge
                variant="secondary"
                className="rounded px-1 font-mono tabular-nums"
              >
                {selecionados.size}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={titulo} />
          <CommandList>
            <CommandEmpty>Nada encontrado.</CommandEmpty>
            <CommandGroup>
              {opcoes.map((op) => {
                const ativo = selecionados.has(op.value);
                return (
                  <CommandItem
                    key={op.value}
                    value={op.label}
                    onSelect={() => toggleFiltro(dim, op.value)}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        ativo
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="truncate">{op.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
