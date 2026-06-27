// Modelo de dados do dashboard CNO.
//
// Os campos refletem o que o Cadastro Nacional de Obras (CNO) sustenta de
// verdade (ver PLANO.md seção 12). Campos sem lastro no CNO — serviço, fase
// granular, previsão de início/término — foram deliberadamente deixados de
// fora. O mock (lib/mock-data.ts) e os dados reais compartilham esta interface,
// então a UI não muda quando a camada real entrar.

export type ResponsavelTipo = "PF" | "PJ";

export type Situacao = "ativa" | "paralisada" | "encerrada" | "nula";

export const TIPOLOGIAS = [
  "Residencial",
  "Comercial",
  "Residencial vertical",
  "(Em branco)",
  "Comércio / Lojas",
  "Comercial saúde",
  "Comercial bancos",
  "Comercial educação",
  "Comercial religioso",
  "Comercial vertical",
  "Outras finalidades",
] as const;

export type Tipologia = (typeof TIPOLOGIAS)[number];

export interface Obra {
  cno: string;
  tipologia: Tipologia;
  metragem: number;
  uf: string;
  municipio: string;
  bairro: string;
  lat: number;
  lng: number;
  situacao: Situacao;
  responsavelTipo: ResponsavelTipo;
  /** Preenchido só quando responsavelTipo === "PJ"; null para PF (LGPD). */
  responsavelNome: string | null;
  /** Aproximação por dataInicioResponsabilidade. ISO date (YYYY-MM-DD). */
  dataRegistro: string;
}

/** KPIs com lastro real no CNO (ver PLANO.md seção 12). */
export interface Kpis {
  obras: number;
  metragemTotal: number;
  responsaveisPJ: number;
  responsaveisPF: number;
  obrasAtivas: number;
  /** Obras registradas na janela recente (ver REGISTRO_RECENTE_MESES). */
  obrasNovas: number;
}

/** Uma fatia do donut de tipologia. */
export interface CategoriaCount {
  categoria: Tipologia;
  quantidade: number;
  percentual: number;
}

/** Uma linha das tabelas (UF / Cidade / Bairro). */
export interface RegiaoCount {
  nome: string;
  quantidade: number;
  /** Proporção 0..1 em relação ao maior valor do conjunto (para a mini-barra). */
  proporcao: number;
}
