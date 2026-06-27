// Introspecção do CNO no BigQuery (Base dos Dados).
//
// Descobre o(s) dataset(s) com "cno", lista tabelas + colunas e mostra uma
// amostra. Roda no GitHub Action (mode=introspect). A partir da saída, fechamos
// o mapeamento exato para o schema `obras` do Supabase e escrevemos o load.

import { BigQuery } from "@google-cloud/bigquery";

const projectId = process.env.GCP_PROJECT_ID;
const bq = new BigQuery({ projectId });

async function q(sql: string): Promise<any[]> {
  const [rows] = await bq.query({ query: sql, location: "US" });
  return rows as any[];
}

async function main() {
  console.log("Projeto de billing:", projectId);

  const schemata = await q(
    "SELECT schema_name FROM `basedosdados`.`region-us`.INFORMATION_SCHEMA.SCHEMATA WHERE LOWER(schema_name) LIKE '%cno%'",
  );
  console.log("Datasets com 'cno':", JSON.stringify(schemata));

  for (const s of schemata) {
    const ds = s.schema_name as string;
    const cols = await q(
      `SELECT table_name, column_name, data_type
       FROM \`basedosdados\`.${ds}.INFORMATION_SCHEMA.COLUMNS
       ORDER BY table_name, ordinal_position`,
    );
    console.log(`\n===== dataset basedosdados.${ds} — colunas =====`);
    for (const c of cols) {
      console.log(`${c.table_name}\t${c.column_name}\t${c.data_type}`);
    }

    const tabelas = Array.from(new Set(cols.map((c) => c.table_name)));
    for (const t of tabelas) {
      try {
        const amostra = await q(
          `SELECT * FROM \`basedosdados\`.${ds}.${t} LIMIT 3`,
        );
        console.log(`\n----- amostra basedosdados.${ds}.${t} -----`);
        console.log(JSON.stringify(amostra, null, 2));
      } catch (e: any) {
        console.log(`amostra ${ds}.${t} falhou: ${e.message}`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
