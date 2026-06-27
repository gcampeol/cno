"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  countByBairro,
  countByMunicipio,
  countByUf,
} from "@/lib/aggregations";
import { useDashboard } from "@/components/dashboard-provider";
import type { Filtros } from "@/lib/filters";
import type { RegiaoCount } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function fmtInt(n: number): string {
  return n.toLocaleString("pt-BR");
}

function RegiaoTable({
  data,
  dim,
  labelCol,
}: {
  data: RegiaoCount[];
  dim: keyof Filtros;
  labelCol: string;
}) {
  const { filtros, toggleFiltro } = useDashboard();
  const ativos = filtros[dim];
  const [sorting, setSorting] = useState<SortingState>([
    { id: "quantidade", desc: true },
  ]);

  const columns = useMemo<ColumnDef<RegiaoCount>[]>(
    () => [
      {
        accessorKey: "nome",
        header: labelCol,
        cell: ({ row }) => (
          <span className="truncate">{row.original.nome}</span>
        ),
      },
      {
        accessorKey: "quantidade",
        header: "Obras",
        cell: ({ row }) => {
          const { quantidade, proporcao } = row.original;
          return (
            <div className="relative flex items-center justify-end">
              <div
                className="absolute inset-y-1 right-0 rounded-sm bg-primary/15"
                style={{ width: `${Math.max(proporcao * 100, 2)}%` }}
              />
              <span className="relative z-10 font-mono tabular-nums">
                {fmtInt(quantidade)}
              </span>
            </div>
          );
        },
      },
    ],
    [labelCol],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="max-h-[280px] overflow-auto rounded-md border border-border/60">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.id === "quantidade" && "text-right",
                    )}
                  >
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-foreground",
                        header.column.id === "quantidade" && "flex-row-reverse",
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {sorted === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : sorted === "desc" ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const ativo = ativos.includes(row.original.nome);
            return (
              <TableRow
                key={row.id}
                data-state={ativo ? "selected" : undefined}
                onClick={() => toggleFiltro(dim, row.original.nome)}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id === "quantidade" && "text-right",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function TabelasRegiao() {
  const { obras } = useDashboard();
  const porUf = useMemo(() => countByUf(obras), [obras]);
  const porMunicipio = useMemo(() => countByMunicipio(obras), [obras]);
  const porBairro = useMemo(() => countByBairro(obras), [obras]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Distribuição geográfica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="uf">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="uf">UF</TabsTrigger>
            <TabsTrigger value="cidade">Cidade</TabsTrigger>
            <TabsTrigger value="bairro">Bairro</TabsTrigger>
          </TabsList>
          <TabsContent value="uf">
            <RegiaoTable data={porUf} dim="uf" labelCol="Estado" />
          </TabsContent>
          <TabsContent value="cidade">
            <RegiaoTable data={porMunicipio} dim="municipio" labelCol="Cidade" />
          </TabsContent>
          <TabsContent value="bairro">
            <RegiaoTable data={porBairro} dim="bairro" labelCol="Bairro" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
