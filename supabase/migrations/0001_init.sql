-- Schema inicial do dashboard CNO.
-- Tabela `obras` espelha a interface Obra do front (lib/types.ts).
-- Approach A: o front lê as linhas e agrega no cliente (fase de mock/amostra).
-- Quando escalar para a base real, mover agregações para views/RPC (ver DATA.md).

create table if not exists public.obras (
  cno              text primary key,
  tipologia        text not null,
  metragem         integer not null,
  uf               text not null,
  municipio        text not null,
  bairro           text not null,
  lat              double precision not null,
  lng              double precision not null,
  situacao         text not null
                     check (situacao in ('ativa','paralisada','encerrada','nula')),
  responsavel_tipo text not null check (responsavel_tipo in ('PF','PJ')),
  responsavel_nome text,
  data_registro    date not null,
  -- LGPD: pessoa física nunca tem nome exposto.
  constraint pf_sem_nome
    check (responsavel_tipo <> 'PF' or responsavel_nome is null)
);

-- Índices para os filtros (úteis quando a filtragem virar server-side).
create index if not exists obras_uf_idx on public.obras (uf);
create index if not exists obras_municipio_idx on public.obras (municipio);
create index if not exists obras_bairro_idx on public.obras (bairro);
create index if not exists obras_tipologia_idx on public.obras (tipologia);
create index if not exists obras_situacao_idx on public.obras (situacao);
create index if not exists obras_data_registro_idx on public.obras (data_registro);

-- RLS: leitura pública (chave anon); escrita só via service_role (bypassa RLS).
alter table public.obras enable row level security;

drop policy if exists "leitura publica de obras" on public.obras;
create policy "leitura publica de obras"
  on public.obras
  for select
  to anon, authenticated
  using (true);
