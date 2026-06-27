// Introspecção do CNO no BigQuery (Base dos Dados).
//
// Consulta o dataset público direto pelo nome (não dá pra listar SCHEMATA do
// projeto basedosdados sendo externo). Lista tabelas + colunas e mostra uma
// amostra. A partir da saída, fechamos o mapeamento para o schema `obras`.

import { BigQuery } from "@google-cloud/bigquery";

const projectId = process.env.GCP_PROJECT_ID;
const bq = new BigQuery({ projectId });

async function q(sql: string): Promise<any[]> {
  const [rows] = await bq.query({ query: sql, location: "US" });
  return rows as any[];
}

const CANDIDATOS = process.env.CNO_DATASET
  ? [process.env.CNO_DATASET]
  : ["br_me_cno"];

async function main() {
  console.log("Projeto de billing:", projectId);

  for (const ds of CANDIDATOS) {
    try {
      const cols = await q(
        `SELECT table_name, column_name, data_type
         FROM \`basedosdados.${ds}\`.INFORMATION_SCHEMA.COLUMNS
         ORDER BY table_name, ordinal_position`,
      );
      console.log(`\n===== basedosdados.${ds} — colunas =====`);
      for (const c of cols) {
        console.log(`${c.table_name}\t${c.column_name}\t${c.data_type}`);
      }

      const tabelas = Array.from(new Set(cols.map((c) => c.table_name)));
      for (const t of tabelas) {
        try {
          const amostra = await q(
            `SELECT * FROM \`basedosdados.${ds}.${t}\` LIMIT 3`,
          );
          console.log(`\n----- amostra basedosdados.${ds}.${t} -----`);
          console.log(JSON.stringify(amostra, null, 2));
        } catch (e: any) {
          console.log(`amostra ${ds}.${t} falhou: ${e.message}`);
        }
      }
      return;
    } catch (e: any) {
      console.log(`dataset basedosdados.${ds} falhou: ${e.message}`);
    }
  }
  console.log(
    "Nenhum candidato funcionou. Rode de novo definindo o secret/var CNO_DATASET com o nome certo.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
