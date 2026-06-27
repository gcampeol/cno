// Costura entre a UI e a fonte de dados.
//
// Hoje a UI consome um Obra[] e agrega no cliente (lib/aggregations.ts). Isso
// é uma escolha da fase de mock: funciona porque a amostra é pequena.
//
// Para os dados reais do CNO (milhões de registros) NÃO dá para baixar tudo e
// agregar no navegador. A migração (ver DATA.md) move as agregações para o
// banco (Supabase/Postgres + views materializadas) e o front passa a pedir
// KPIs/donut/tabelas já prontos + uma amostra agregada de pontos para o mapa.
//
// Este módulo é o ponto único de troca: `getAllObras()` serve o mock agora;
// na migração, troca-se `dataProvider` por uma implementação que fala com o
// backend real (provavelmente expondo métodos de agregação, não Obra[] cru).

import { mockObras } from "./mock-data";
import type { Obra } from "./types";

export interface DataProvider {
  /**
   * Retorna o conjunto de obras que a UI agrega no cliente.
   * Válido na fase de mock; na fase real isto vira uma amostra ou é
   * substituído por métodos de agregação server-side (ver DATA.md).
   */
  getAllObras(): Obra[];
}

export const mockDataProvider: DataProvider = {
  getAllObras: () => mockObras,
};

// Troque aqui pela implementação real do CNO quando o pipeline existir.
export const dataProvider: DataProvider = mockDataProvider;
