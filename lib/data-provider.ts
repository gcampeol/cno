// Costura entre a UI e a fonte de dados.
//
// Hoje a UI consome um Obra[] e agrega no cliente (lib/aggregations.ts). Isso
// é uma escolha da fase de mock/amostra: funciona porque o conjunto é pequeno.
//
// Seleção automática: se houver credenciais Supabase (NEXT_PUBLIC_SUPABASE_URL
// + _ANON_KEY), usa o banco; senão, cai no mock. Assim o app roda sem config e
// passa a usar o Supabase quando as envs existirem.
//
// Para a base real do CNO (milhões de registros) NÃO dá para baixar tudo e
// agregar no navegador. A migração (ver DATA.md) move as agregações para o
// banco (views materializadas / RPC) e a interface passa a expor métodos de
// agregação, não Obra[] cru. Este módulo é o ponto único de troca.

import { mockObras } from "./mock-data";
import { fetchAllObras } from "./supabase/obras";
import { hasSupabaseEnv } from "./supabase/client";
import type { Obra } from "./types";

export type FonteDados = "mock" | "supabase";

export interface DataProvider {
  readonly fonte: FonteDados;
  getAllObras(): Promise<Obra[]>;
}

export const mockDataProvider: DataProvider = {
  fonte: "mock",
  getAllObras: async () => mockObras,
};

export const supabaseDataProvider: DataProvider = {
  fonte: "supabase",
  getAllObras: () => fetchAllObras(),
};

export function getDataProvider(): DataProvider {
  return hasSupabaseEnv() ? supabaseDataProvider : mockDataProvider;
}
