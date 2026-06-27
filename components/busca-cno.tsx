"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useDashboard } from "@/components/dashboard-provider";
import { ObraDetalhe } from "@/components/obra-detalhe";
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
import type { Obra } from "@/lib/types";

export function BuscaCno() {
  const { todasObras } = useDashboard();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selecionada, setSelecionada] = useState<Obra | null>(null);

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return todasObras.filter((o) => o.cno.includes(q)).slice(0, 8);
  }, [todasObras, query]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-xs text-muted-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Buscar CNO</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="end">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Digite o número do CNO…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {query.trim() && matches.length === 0 && (
                <CommandEmpty>Nenhum CNO encontrado.</CommandEmpty>
              )}
              {!query.trim() && (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Digite para buscar uma obra pelo CNO.
                </div>
              )}
              <CommandGroup>
                {matches.map((o) => (
                  <CommandItem
                    key={o.cno}
                    value={o.cno}
                    onSelect={() => {
                      setSelecionada(o);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="font-mono tabular-nums">{o.cno}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {o.municipio} · {o.tipologia}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <ObraDetalhe obra={selecionada} onClose={() => setSelecionada(null)} />
    </>
  );
}
