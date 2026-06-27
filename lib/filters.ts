// Estado de filtros e filtragem pura sobre Obra[].
//
// Conjunto de filtros com lastro real no CNO (ver PLANO.md seção 12). Os
// filtros sem lastro (serviço, previsão de início/término) foram cortados;
// "fase da obra" virou "situação" (o campo que o CNO realmente tem).
//
// Multi-seleção: dentro de uma dimensão é OR (qualquer valor casa); entre
// dimensões é AND. filterObras é pura — entra Obra[] + Filtros, sai Obra[].

import type { Obra } from "./types";

export interface Filtros {
  tipologia: string[];
  situacao: string[];
  metragem: string[];
  responsavelTipo: string[];
  uf: string[];
  municipio: string[];
  bairro: string[];
  ano: string[];
  /** Busca por CNO específico (cross-filter para uma única obra). */
  cno: string[];
}

export const EMPTY_FILTROS: Filtros = {
  tipologia: [],
  situacao: [],
  metragem: [],
  responsavelTipo: [],
  uf: [],
  municipio: [],
  bairro: [],
  ano: [],
  cno: [],
};

export interface MetragemBucket {
  id: string;
  label: string;
  min: number;
  max: number; // Infinity para o último
}

export const METRAGEM_BUCKETS: MetragemBucket[] = [
  { id: "0-100", label: "Até 100 m²", min: 0, max: 100 },
  { id: "100-500", label: "100 – 500 m²", min: 100, max: 500 },
  { id: "500-2000", label: "500 – 2.000 m²", min: 500, max: 2000 },
  { id: "2000+", label: "Acima de 2.000 m²", min: 2000, max: Infinity },
];

function metragemCasaBucket(metragem: number, bucketIds: string[]): boolean {
  return bucketIds.some((id) => {
    const b = METRAGEM_BUCKETS.find((bucket) => bucket.id === id);
    if (!b) return false;
    return metragem >= b.min && metragem < b.max;
  });
}

function anoDe(dataRegistro: string): string {
  return dataRegistro.slice(0, 4);
}

/** Quantos filtros estão ativos (com ao menos um valor selecionado). */
export function countFiltrosAtivos(filtros: Filtros): number {
  return Object.values(filtros).filter((v) => v.length > 0).length;
}

export function temFiltroAtivo(filtros: Filtros): boolean {
  return countFiltrosAtivos(filtros) > 0;
}

export function filterObras(obras: Obra[], filtros: Filtros): Obra[] {
  return obras.filter((o) => {
    if (filtros.cno.length && !filtros.cno.includes(o.cno)) return false;
    if (filtros.tipologia.length && !filtros.tipologia.includes(o.tipologia))
      return false;
    if (filtros.situacao.length && !filtros.situacao.includes(o.situacao))
      return false;
    if (filtros.responsavelTipo.length &&
      !filtros.responsavelTipo.includes(o.responsavelTipo))
      return false;
    if (filtros.uf.length && !filtros.uf.includes(o.uf)) return false;
    if (filtros.municipio.length && !filtros.municipio.includes(o.municipio))
      return false;
    if (filtros.bairro.length && !filtros.bairro.includes(o.bairro))
      return false;
    if (filtros.ano.length && !filtros.ano.includes(anoDe(o.dataRegistro)))
      return false;
    if (filtros.metragem.length && !metragemCasaBucket(o.metragem, filtros.metragem))
      return false;
    return true;
  });
}

/** Valores distintos de uma chave de string, ordenados, para popular facetas. */
export function opcoesDistintas(obras: Obra[], chave: keyof Obra): string[] {
  const set = new Set<string>();
  for (const o of obras) set.add(String(o[chave]));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Anos de registro distintos, ordenados do mais recente para o mais antigo. */
export function anosDisponiveis(obras: Obra[]): string[] {
  const set = new Set<string>();
  for (const o of obras) set.add(anoDe(o.dataRegistro));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}
