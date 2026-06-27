// Carga real do CNO (Serra Gaúcha) -> Supabase.
//
// Lê basedosdados.br_me_cno.microdados filtrado pelos municípios da Serra
// Gaúcha, mapeia para o schema `obras`, geocodifica pelo centroide do município
// (o CNO não tem coordenadas) e substitui o mock no Supabase.
//
// Gaps honestos do CNO aberto: sem tipologia/destinação (vira "(Em branco)");
// sem coordenadas (centroide + jitter). LGPD: PF nunca tem nome (só PJ via
// nome_empresarial).

import { BigQuery } from "@google-cloud/bigquery";
import { createClient } from "@supabase/supabase-js";

import {
  SERRA_GAUCHA_CODIGOS,
  SERRA_POR_CODIGO,
} from "./serra-gaucha-municipios";

const projectId = process.env.GCP_PROJECT_ID;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const bq = new BigQuery({ projectId });
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function bqQuery(query: string, params?: Record<string, unknown>, types?: Record<string, unknown>) {
  const [rows] = await bq.query({ query, params, types, location: "US" });
  return rows as any[];
}

// Dicionário: código de situacao_obra -> rótulo.
async function mapaSituacao(): Promise<Map<string, string>> {
  const rows = await bqQuery(
    "SELECT chave, valor FROM `basedosdados.br_me_cno.dicionario` WHERE id_tabela='microdados' AND nome_coluna='situacao_obra'",
  );
  const m = new Map<string, string>();
  for (const r of rows) m.set(String(r.chave), String(r.valor));
  return m;
}

function situacaoEnum(rotulo: string | undefined): string {
  const l = (rotulo ?? "").toLowerCase();
  if (l.includes("ativ")) return "ativa";
  if (l.includes("encerr")) return "encerrada";
  if (l.includes("nula")) return "nula";
  return "paralisada"; // paralisada, suspensa, etc.
}

// Offset determinístico (~±4km) por CNO, para espalhar pontos no município.
function jitter(seed: string): [number, number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const r1 = ((h >>> 0) % 1000) / 1000 - 0.5;
  const r2 = (((h * 7) >>> 0) % 1000) / 1000 - 0.5;
  return [r1 * 0.08, r2 * 0.08];
}

function dataValor(d: any): string | null {
  if (!d) return null;
  return typeof d === "object" && "value" in d ? d.value : String(d);
}

async function main() {
  const sit = await mapaSituacao();
  console.log("Dicionário situação:", JSON.stringify(Array.from(sit)));

  const sql = `
    SELECT
      id_cno,
      id_municipio,
      ANY_VALUE(sigla_uf)        AS uf,
      ANY_VALUE(bairro)          AS bairro,
      ANY_VALUE(situacao)        AS situacao,
      ANY_VALUE(nome_empresarial) AS nome_empresarial,
      ANY_VALUE(nome_responsavel) AS nome_responsavel,
      MIN(data_registro)         AS data_registro,
      SUM(area)                  AS area
    FROM \`basedosdados.br_me_cno.microdados\`
    WHERE id_municipio IN UNNEST(@codigos)
    GROUP BY id_cno, id_municipio
  `;
  const rows = await bqQuery(
    sql,
    { codigos: SERRA_GAUCHA_CODIGOS },
    { codigos: ["STRING"] },
  );
  console.log(`Obras na Serra Gaúcha: ${rows.length}`);

  const obras = rows.map((r) => {
    const muni = SERRA_POR_CODIGO.get(String(r.id_municipio));
    const [dlat, dlng] = jitter(String(r.id_cno));
    const pj = Boolean(r.nome_empresarial);
    const bairro =
      r.bairro && String(r.bairro).trim()
        ? String(r.bairro).trim()
        : "Não informado";
    return {
      cno: String(r.id_cno),
      tipologia: "(Em branco)",
      metragem: Math.round(r.area || 0),
      uf: r.uf || muni?.uf || "RS",
      municipio: muni?.municipio ?? "—",
      bairro,
      lat: (muni?.lat ?? -29.16) + dlat,
      lng: (muni?.lng ?? -51.18) + dlng,
      situacao: situacaoEnum(sit.get(String(r.situacao))),
      responsavel_tipo: pj ? "PJ" : "PF",
      // FASE DE TESTE: traz o nome do responsável (PF inclusive) para validar
      // os dados. Antes de lançar, voltar PF para null (LGPD) — ver SUPABASE.md.
      responsavel_nome: pj
        ? String(r.nome_empresarial)
        : r.nome_responsavel
          ? String(r.nome_responsavel)
          : null,
      data_registro: dataValor(r.data_registro) ?? "2018-01-01",
    };
  });

  // Substitui o mock: limpa a tabela antes de carregar o real.
  console.log("Limpando dados antigos (mock)…");
  const { error: delErr } = await supabase
    .from("obras")
    .delete()
    .not("cno", "is", null);
  if (delErr) {
    console.error("Erro ao limpar:", delErr.message);
    process.exit(1);
  }

  const batch = 1000;
  for (let i = 0; i < obras.length; i += batch) {
    const slice = obras.slice(i, i + batch);
    const { error } = await supabase
      .from("obras")
      .upsert(slice, { onConflict: "cno" });
    if (error) {
      console.error(`Erro no batch ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`Carregadas ${Math.min(i + batch, obras.length)}/${obras.length}`);
  }

  console.log("Carga real concluída.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
