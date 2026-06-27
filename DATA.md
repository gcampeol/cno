# Camada de dados — mock agora, CNO real depois

O dashboard roda hoje sobre uma **amostra mock determinística** (`lib/mock-data.ts`,
8k obras). A UI consome um `Obra[]` e agrega no cliente (`lib/aggregations.ts`).
Toda a troca para dados reais acontece num único ponto: **`lib/data-provider.ts`**.

## Onde trocar

`lib/data-provider.ts` exporta `dataProvider: DataProvider`. Hoje é o
`mockDataProvider`. Para os dados reais, implemente a interface falando com o
backend e troque a constante. Nada na UI muda de assinatura.

> Atenção de arquitetura: `getAllObras()` funciona porque a amostra é pequena.
> A base nacional do CNO tem **milhões** de registros — não dá para baixar tudo
> e agregar no navegador. Na migração real, as agregações vão para o banco e o
> front pede números já prontos (KPIs/donut/tabelas) + uma amostra agregada de
> pontos para o mapa. Ou seja, a interface real provavelmente expõe métodos de
> agregação (ex.: `getKpis(filtros)`, `getDonut(filtros)`, `getPontos(filtros)`),
> não `Obra[]` cru. O `DataProvider` atual é o ponto de partida dessa evolução.

## Fonte dos dados

- **CNO** — dado aberto da Receita Federal, gratuito, atualização mensal
  (portal de dados abertos da Receita; também na Base dos Dados via BigQuery).
  Não é tempo real, é um retrato mensal.
- **Base de CNPJ da Receita** (mensal) — para enriquecer o responsável PJ.

## Mapeamento UI → CNO

| Campo da UI | De onde vem | Observação |
|---|---|---|
| `cno` | `cno` | direto |
| `metragem` | soma de `areas[].metragem` (áreas principais) | direto |
| `uf` | `uf` | direto |
| `municipio` | `municipio` + `codigoMunicipio` | padronizar pelo código IBGE |
| `bairro` | `bairro` | sujo, normalizar |
| `lat`/`lng` | NÃO existe | geocodificar no ETL (ver abaixo) |
| `responsavelTipo` | tamanho do `niResponsavel` | 14 díg = PJ, 11 = PF |
| `responsavelNome` | base de CNPJ (só PJ) | PF nunca exposto (LGPD) |
| `dataRegistro` | `dataInicioResponsabilidade` | aproximação |
| `tipologia` | `areas[].destinacao` + `tipoObra` | mapear p/ categorias do donut |
| `situacao` | `situacao` | ativa/paralisada/encerrada/nula |

## Gaps honestos (o que o CNO não dá)

Já refletidos no produto: cortamos KPIs/filtros sem lastro. **Não existem** no
CNO: fase de execução granular (fundação/alvenaria/…), previsão de início/término,
lista de serviços, contato de decisor, papéis separados (arquiteto/inco/SPE),
contagem de profissionais. Por isso os KPIs são **Obras, Metragem, Resp. PJ,
Resp. PF, Obras ativas, Obras novas** — todos sustentados pelo CNO.

## Geocodificação (para o mapa)

O CNO tem endereço/município mas não coordenadas. Geocodificar **uma vez no ETL**
e salvar, nunca em runtime.
- **v1 (grátis):** centroide do município (IBGE) com leve jitter — é o que o mock
  já faz; o heatmap por município comunica densidade bem e custa zero.
- **v2 (preciso):** geocodificar o endereço completo (Nominatim/OSM grátis com
  rate limit e fila; Google/Mapbox pagos e precisos).

## Pipeline ETL (job mensal)

1. Baixar dump do CNO (e do CNPJ) do portal de dados abertos.
2. Normalizar: limpar bairro, padronizar município por código IBGE, somar
   metragem das áreas principais.
3. Derivar `responsavelTipo` do tamanho do NI; juntar nome do CNPJ nos PJ.
4. Geocodificar por centroide de município.
5. Mapear `destinacao`/`tipoObra` → tipologia da UI.
6. Carregar no Postgres.
7. Materializar tabelas de agregação (por UF, município, bairro, tipologia,
   situação) para leitura instantânea.

Orquestração: n8n, GitHub Actions agendado ou cron do Supabase. Roda 1×/mês.

## Arquitetura alvo

- **Banco:** Supabase (Postgres) com PostGIS para geo.
- **Agregações no banco** (SQL + views materializadas). O front pede KPIs/donut/
  tabelas prontos + amostra agregada de pontos. Nada de milhões de linhas no
  navegador.
- **API:** route handlers do Next ou client Supabase com RLS; cada filtro vira
  cláusula WHERE parametrizada.
- **Mapa em escala:** heatmap já agregado por município, ou clustering/tiles.

## LGPD (regra técnica)

- `responsavelNome` só preenchido/exibido quando o responsável é **PJ**.
- **PF nunca** tem nome/documento expostos — entra só como contagem agregada
  (é o que o mock já garante: PF → `responsavelNome: null`).
- Qualquer feature futura que exponha PF exige base legal documentada antes.
