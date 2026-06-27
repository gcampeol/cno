"use client";

import { Filter, MapPin } from "lucide-react";

import { useDashboard } from "@/components/dashboard-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Obra } from "@/lib/types";

const SITUACAO_LABEL: Record<Obra["situacao"], string> = {
  ativa: "Ativa",
  paralisada: "Paralisada",
  encerrada: "Encerrada",
  nula: "Nula",
};

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function fmtData(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

export function ObraDetalhe({
  obra,
  onClose,
}: {
  obra: Obra | null;
  onClose: () => void;
}) {
  const { toggleFiltro } = useDashboard();

  return (
    <Dialog
      open={obra !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        {obra && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="font-mono">CNO {obra.cno}</span>
                <Badge variant="secondary">
                  {SITUACAO_LABEL[obra.situacao]}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <Campo label="Tipologia">{obra.tipologia}</Campo>
              <Campo label="Metragem">
                <span className="font-mono tabular-nums">
                  {obra.metragem.toLocaleString("pt-BR")} m²
                </span>
              </Campo>
              <Campo label="Localização">
                <span className="flex items-start gap-1">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>
                    {obra.bairro}, {obra.municipio} – {obra.uf}
                  </span>
                </span>
              </Campo>
              <Campo label="Data de registro">
                <span className="font-mono tabular-nums">
                  {fmtData(obra.dataRegistro)}
                </span>
              </Campo>
              <Campo label="Responsável">
                {obra.responsavelNome ?? "Não informado"}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({obra.responsavelTipo})
                </span>
              </Campo>
              <Campo label="Coordenadas">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {obra.lat.toFixed(4)}, {obra.lng.toFixed(4)}
                </span>
              </Campo>
            </div>

            <Button
              onClick={() => {
                toggleFiltro("cno", obra.cno);
                onClose();
              }}
              className="mt-2 w-full gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtrar o dashboard por esta obra
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
