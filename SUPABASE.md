# Supabase — setup (Approach A: seed do mock + leitura por tabela)

O app funciona com **mock** por padrão. Quando as variáveis do Supabase
existirem, ele passa a ler do banco automaticamente (sem mudar a UI). Esta é a
primeira etapa da costura real; a evolução para agregação server-side em escala
está descrita em [DATA.md](DATA.md).

## 1. Criar o projeto

1. Em [supabase.com](https://supabase.com) → **New project** (dê um nome, ex. `cno`,
   e guarde a senha do banco).
2. Em **Project Settings → API**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secreta) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Criar o schema

No painel do Supabase → **SQL Editor** → New query → cole o conteúdo de
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.

Isso cria a tabela `obras`, os índices, a checagem de LGPD (PF sem nome) e a
política de RLS de leitura pública.

> Se usar a Supabase CLI: `supabase db push` com a migration na pasta padrão.

## 3. Configurar as variáveis

```bash
cp .env.local.example .env.local
# edite .env.local com URL, anon key e service_role key
```

`.env.local` não é commitado. A `service_role` é secreta — só o seed/ETL usa.

## 4. Popular com a amostra (8k obras)

```bash
npm run seed
```

Gera o mock determinístico e faz `upsert` por `cno` (idempotente — pode rodar de
novo). Deve imprimir "Inseridas 8000/8000" e "Seed concluído".

## 5. Rodar usando o Supabase

- **Local:** com as envs no `.env.local`, `npm run dev` já lê do banco.
- **Vercel:** em **Project Settings → Environment Variables**, adicione
  `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a `service_role`
  NÃO precisa ir para a Vercel — ela só serve ao seed local). Redeploy.

Para confirmar a fonte ativa, o provider expõe `getDataProvider().fonte`
(`"mock"` ou `"supabase"`).

## 6. Próximo passo (escala real)

`getAllObras()` baixa todas as linhas — ok para a amostra, inviável para os
milhões do CNO real. A evolução (ver [DATA.md](DATA.md)) é mover agregações para
o banco (views materializadas / RPC com filtros como WHERE) e trocar o
`DataProvider` por métodos de agregação (`getKpis`, `getDonut`, `getTabelas`,
`getPontos`). O ETL mensal dos dumps da Receita carrega a tabela `obras`.
