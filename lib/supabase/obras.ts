import type {
  Obra,
  ResponsavelTipo,
  Situacao,
  Tipologia,
} from "@/lib/types";
import { createClient } from "@/utils/supabase/client";

/** Linha da tabela `obras` (snake_case do Postgres). */
interface ObraRow {
  cno: string;
  tipologia: string;
  metragem: number;
  uf: string;
  municipio: string;
  bairro: string;
  lat: number;
  lng: number;
  situacao: string;
  responsavel_tipo: string;
  responsavel_nome: string | null;
  data_registro: string;
}

function rowToObra(r: ObraRow): Obra {
  return {
    cno: r.cno,
    tipologia: r.tipologia as Tipologia,
    metragem: r.metragem,
    uf: r.uf,
    municipio: r.municipio,
    bairro: r.bairro,
    lat: r.lat,
    lng: r.lng,
    situacao: r.situacao as Situacao,
    responsavelTipo: r.responsavel_tipo as ResponsavelTipo,
    responsavelNome: r.responsavel_nome,
    dataRegistro: r.data_registro,
  };
}

/**
 * Busca todas as obras da tabela, paginando (Supabase limita ~1000 por
 * request). Adequado para a amostra; na base real isto vira agregação
 * server-side (ver DATA.md).
 */
export async function fetchAllObras(): Promise<Obra[]> {
  const supabase = createClient();
  const pageSize = 1000;
  let from = 0;
  const todas: Obra[] = [];

  for (;;) {
    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .order("cno", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    todas.push(...(data as ObraRow[]).map(rowToObra));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return todas;
}
