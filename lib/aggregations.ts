// Agregações puras sobre um array de Obra.
//
// KPIs, donut e tabelas são todos derivados aqui. Filtrar é só rodar estas
// funções sobre o subconjunto filtrado (cross-filter das fases seguintes).
// Nada de estado: entra Obra[], sai número/array.

import type { CategoriaCount, Kpis, Obra, RegiaoCount, Tipologia } from "./types";
import { DATA_REFERENCIA, REGISTRO_RECENTE_MESES } from "./mock-data";

/** Data de corte (ISO) para considerar uma obra "nova". */
function dataCorteNovas(): string {
  const ref = new Date(DATA_REFERENCIA);
  ref.setMonth(ref.getMonth() - REGISTRO_RECENTE_MESES);
  return ref.toISOString().slice(0, 10);
}

export function computeKpis(obras: Obra[]): Kpis {
  const corte = dataCorteNovas();
  let metragemTotal = 0;
  let responsaveisPJ = 0;
  let responsaveisPF = 0;
  let obrasAtivas = 0;
  let obrasNovas = 0;

  for (const o of obras) {
    metragemTotal += o.metragem;
    if (o.responsavelTipo === "PJ") responsaveisPJ++;
    else responsaveisPF++;
    if (o.situacao === "ativa") obrasAtivas++;
    if (o.dataRegistro >= corte) obrasNovas++;
  }

  return {
    obras: obras.length,
    metragemTotal,
    responsaveisPJ,
    responsaveisPF,
    obrasAtivas,
    obrasNovas,
  };
}

/** Quantidade de obras por tipologia, ordenada desc, com percentual (0..100). */
export function countByTipologia(obras: Obra[]): CategoriaCount[] {
  const total = obras.length;
  const contagem = new Map<Tipologia, number>();
  for (const o of obras) {
    contagem.set(o.tipologia, (contagem.get(o.tipologia) ?? 0) + 1);
  }
  return Array.from(contagem.entries())
    .map(([categoria, quantidade]) => ({
      categoria,
      quantidade,
      percentual: total === 0 ? 0 : (quantidade / total) * 100,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/** Agregação genérica por uma chave de string da Obra (uf, municipio, bairro). */
function countByKey(obras: Obra[], chave: keyof Obra): RegiaoCount[] {
  const contagem = new Map<string, number>();
  for (const o of obras) {
    const nome = String(o[chave]);
    contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
  }
  const linhas = Array.from(contagem.entries())
    .map(([nome, quantidade]) => ({ nome, quantidade, proporcao: 0 }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const maior = linhas.length > 0 ? linhas[0].quantidade : 0;
  for (const linha of linhas) {
    linha.proporcao = maior === 0 ? 0 : linha.quantidade / maior;
  }
  return linhas;
}

export function countByUf(obras: Obra[]): RegiaoCount[] {
  return countByKey(obras, "uf");
}

export function countByMunicipio(obras: Obra[]): RegiaoCount[] {
  return countByKey(obras, "municipio");
}

export function countByBairro(obras: Obra[]): RegiaoCount[] {
  return countByKey(obras, "bairro");
}
