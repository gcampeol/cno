// Gerador de dados mock para o dashboard CNO.
//
// Determinístico (PRNG com seed fixa) para que o dataset seja estável entre
// reloads e builds. As distribuições (tipologia, UF/município, situação,
// PF/PJ) e os centroides de município seguem as tabelas do PLANO.md (seções
// 6 e 7), então as agregações produzem rankings coerentes com a referência.
//
// É uma AMOSTRA representativa (não os 271k da referência) — leve para o
// navegador e suficiente para validar a UI. Quando os dados reais do CNO
// entrarem (Fase 10), eles implementam a mesma interface `Obra` e as funções
// de agregação não mudam.

import type { Obra, ResponsavelTipo, Situacao, Tipologia } from "./types";

/** Data de referência do mock (fixa, para determinismo). */
export const DATA_REFERENCIA = "2026-06-01";

/** Janela considerada "obra nova" a partir da DATA_REFERENCIA. */
export const REGISTRO_RECENTE_MESES = 12;

/** Tamanho padrão da amostra gerada. */
export const QTD_OBRAS_MOCK = 8000;

// PRNG determinístico (mulberry32).
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Peso<T> {
  valor: T;
  peso: number;
}

function escolherPonderado<T>(rng: () => number, itens: Peso<T>[]): T {
  const total = itens.reduce((soma, i) => soma + i.peso, 0);
  let r = rng() * total;
  for (const item of itens) {
    r -= item.peso;
    if (r <= 0) return item.valor;
  }
  return itens[itens.length - 1].valor;
}

interface MunicipioBase {
  municipio: string;
  uf: string;
  lat: number;
  lng: number;
  peso: number;
}

// Municípios com centroide aproximado e peso proporcional à atividade de obras.
// Os pesos seguem a ordem das tabelas de cidade/UF do PLANO.md.
const MUNICIPIOS: MunicipioBase[] = [
  { municipio: "São Paulo", uf: "SP", lat: -23.5505, lng: -46.6333, peso: 2900 },
  { municipio: "Rio de Janeiro", uf: "RJ", lat: -22.9068, lng: -43.1729, peso: 900 },
  { municipio: "Brasília", uf: "DF", lat: -15.7801, lng: -47.9292, peso: 523 },
  { municipio: "Curitiba", uf: "PR", lat: -25.4284, lng: -49.2733, peso: 362 },
  { municipio: "Belo Horizonte", uf: "MG", lat: -19.9208, lng: -43.9378, peso: 318 },
  { municipio: "Goiânia", uf: "GO", lat: -16.6869, lng: -49.2643, peso: 249 },
  { municipio: "Campinas", uf: "SP", lat: -22.9056, lng: -47.0608, peso: 247 },
  { municipio: "Fortaleza", uf: "CE", lat: -3.7319, lng: -38.5267, peso: 218 },
  { municipio: "Salvador", uf: "BA", lat: -12.9777, lng: -38.5014, peso: 216 },
  { municipio: "Porto Alegre", uf: "RS", lat: -30.0346, lng: -51.2177, peso: 320 },
  { municipio: "Florianópolis", uf: "SC", lat: -27.5949, lng: -48.5495, peso: 240 },
  { municipio: "Recife", uf: "PE", lat: -8.0539, lng: -34.8811, peso: 200 },
  { municipio: "Manaus", uf: "AM", lat: -3.119, lng: -60.0217, peso: 150 },
  { municipio: "Maringá", uf: "PR", lat: -23.4205, lng: -51.9333, peso: 160 },
  { municipio: "Uberlândia", uf: "MG", lat: -18.9186, lng: -48.2772, peso: 170 },
];

const TIPOLOGIAS_PESOS: Peso<Tipologia>[] = [
  { valor: "Residencial", peso: 62.52 },
  { valor: "Comercial", peso: 10.82 },
  { valor: "Residencial vertical", peso: 6.77 },
  { valor: "(Em branco)", peso: 3.57 },
  { valor: "Comércio / Lojas", peso: 3.51 },
  { valor: "Comercial saúde", peso: 2.03 },
  { valor: "Comercial bancos", peso: 0.45 },
  { valor: "Comercial educação", peso: 3.4 },
  { valor: "Comercial religioso", peso: 2.4 },
  { valor: "Comercial vertical", peso: 0.6 },
  { valor: "Outras finalidades", peso: 3.93 },
];

const SITUACOES_PESOS: Peso<Situacao>[] = [
  { valor: "ativa", peso: 72 },
  { valor: "encerrada", peso: 13 },
  { valor: "paralisada", peso: 12 },
  { valor: "nula", peso: 3 },
];

// PF ~70%, PJ ~30% (PLANO.md seção 6: PF 180.586, PJ 76.873).
const RESPONSAVEL_PESOS: Peso<ResponsavelTipo>[] = [
  { valor: "PF", peso: 70 },
  { valor: "PJ", peso: 30 },
];

const BAIRROS_PESOS: Peso<string>[] = [
  { valor: "Centro", peso: 82 },
  { valor: "Zona Rural", peso: 16 },
  { valor: "Barra da Tijuca", peso: 13 },
  { valor: "Zona Urbana", peso: 12 },
  { valor: "Bela Vista", peso: 10 },
  { valor: "Pinheiros", peso: 9 },
  { valor: "Jardim Paulista", peso: 7 },
  { valor: "Vila Mariana", peso: 7 },
  { valor: "Copacabana", peso: 7 },
  { valor: "Outros", peso: 30 },
];

const NOMES_PJ = [
  "Construtora Horizonte Ltda",
  "Edifica Engenharia S.A.",
  "Alpha Incorporações",
  "Vega Construções",
  "Pilar Empreendimentos",
  "Norte Sul Engenharia",
  "Atrium Incorporadora",
  "Base Forte Construtora",
  "Meridiano Obras",
  "Terra Nova Engenharia",
];

// Faixas de metragem por tipologia (m²): residenciais menores, comerciais maiores.
function faixaMetragem(tipologia: Tipologia, rng: () => number): number {
  const verticalOuComercial =
    tipologia.startsWith("Comercial") ||
    tipologia === "Residencial vertical" ||
    tipologia === "Comércio / Lojas";
  const min = verticalOuComercial ? 400 : 60;
  const max = verticalOuComercial ? 12000 : 500;
  return Math.round(min + rng() * (max - min));
}

function jitter(rng: () => number): number {
  // ~±0.18 grau (~20km) para espalhar os pontos ao redor do centroide.
  return (rng() - 0.5) * 0.36;
}

function dataRegistroAleatoria(rng: () => number): string {
  // Entre ~5 anos atrás e a DATA_REFERENCIA.
  const ref = Date.parse(DATA_REFERENCIA);
  const cincoAnos = 5 * 365 * 24 * 60 * 60 * 1000;
  const ts = ref - Math.floor(rng() * cincoAnos);
  return new Date(ts).toISOString().slice(0, 10);
}

/** Gera `count` obras de forma determinística a partir de `seed`. */
export function generateObras(count = QTD_OBRAS_MOCK, seed = 20260601): Obra[] {
  const rng = mulberry32(seed);
  const municipiosPesos: Peso<MunicipioBase>[] = MUNICIPIOS.map((m) => ({
    valor: m,
    peso: m.peso,
  }));

  const obras: Obra[] = [];
  for (let i = 0; i < count; i++) {
    const mun = escolherPonderado(rng, municipiosPesos);
    const tipologia = escolherPonderado(rng, TIPOLOGIAS_PESOS);
    const responsavelTipo = escolherPonderado(rng, RESPONSAVEL_PESOS);
    const responsavelNome =
      responsavelTipo === "PJ"
        ? NOMES_PJ[Math.floor(rng() * NOMES_PJ.length)]
        : null;

    obras.push({
      cno: String(10000000 + i).padStart(8, "0"),
      tipologia,
      metragem: faixaMetragem(tipologia, rng),
      uf: mun.uf,
      municipio: mun.municipio,
      bairro: escolherPonderado(rng, BAIRROS_PESOS),
      lat: mun.lat + jitter(rng),
      lng: mun.lng + jitter(rng),
      situacao: escolherPonderado(rng, SITUACOES_PESOS),
      responsavelTipo,
      responsavelNome,
      dataRegistro: dataRegistroAleatoria(rng),
    });
  }
  return obras;
}

/** Dataset mock padrão, gerado uma vez no carregamento do módulo. */
export const mockObras: Obra[] = generateObras();
