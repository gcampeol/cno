// Seed do Supabase com a amostra mock (8k obras).
//
// Rodar com: npm run seed   (carrega .env.local e usa a service role key).
// Requer no .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (NUNCA commitar / expor no client)
//
// Idempotente: usa upsert por `cno`, então pode rodar de novo sem duplicar.

import { createClient } from "@supabase/supabase-js";

import { generateObras } from "../lib/mock-data";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !serviceKey) {
  console.error(
    "Faltam credenciais. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  const obras = generateObras();
  const rows = obras.map((o) => ({
    cno: o.cno,
    tipologia: o.tipologia,
    metragem: o.metragem,
    uf: o.uf,
    municipio: o.municipio,
    bairro: o.bairro,
    lat: o.lat,
    lng: o.lng,
    situacao: o.situacao,
    responsavel_tipo: o.responsavelTipo,
    responsavel_nome: o.responsavelNome,
    data_registro: o.dataRegistro,
  }));

  const batchSize = 1000;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from("obras")
      .upsert(batch, { onConflict: "cno" });
    if (error) {
      console.error(`Erro no batch a partir de ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`Inseridas ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }

  console.log("Seed concluído com sucesso.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
