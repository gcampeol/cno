# Plano de Build: Dashboard Radar de Obras (CNO)

Plano de implementação para o Claude Code. Reconstrói um dashboard de inteligência de obras a partir de uma referência existente (print do concorrente), mantendo toda a informação e os filtros, mas com um visual de produto moderno em vez de cara de Power BI.

Cole este arquivo na raiz do projeto como `PLANO.md` e use o prompt inicial do final para arrancar.

---

## 1. Contexto

É um painel de inteligência de mercado da construção civil alimentado por dados do Cadastro Nacional de Obras (CNO). O usuário filtra obras por região, fase, tipologia e metragem, e lê onde está a atividade de construção no Brasil. Público: fornecedor, prestador de serviço e equipe comercial que quer achar obra nova antes do concorrente.

A versão de referência é funcional mas visualmente datada. O objetivo deste build não é só portar, é elevar: transformar um relatório de BI num produto que parece feito em 2026.

## 2. Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (base de componentes)
- **Recharts** via shadcn charts (donut)
- **MapLibre GL** + **react-map-gl** (mapa de calor, basemap dark)
- **@tanstack/react-table** (as três tabelas)
- **nuqs** (estado dos filtros sincronizado na URL, permite compartilhar views)
- **lucide-react** (ícones)
- **Geist** e **Geist Mono** (tipografia)

Tudo client-side com dados mock primeiro. A camada de dados real do CNO entra depois, atrás da mesma interface de tipos.

## 3. Direção visual

A regra de ouro: o dado é o herói, a interface some. O oposto do print de referência, onde a cor azul grita mais alto que os números.

### Tema (dark por padrão, com toggle para claro)

Graphite neutro, não o azul corporativo saturado da referência. Superfícies em camadas sutis, uma única cor de marca para interação, e a cor de verdade reservada para os dados.

```
Fundo base        #0A0A0B   (quase preto neutro)
Superfície 1      #141416   (cards)
Superfície 2      #1C1C1F   (elementos elevados, popovers)
Borda             #27272A   (hairline, baixo contraste)
Texto primário    #FAFAFA
Texto secundário  #A1A1AA
Accent (marca)    #3B6CF6   (cobalto, só para seleção/interação/foco)
```

Decisão deliberada: o accent NÃO é a cor dos dados. Ele só aparece em estado ativo de filtro, foco de teclado e seleção. Isso evita o efeito "tudo azul" da referência.

### Paleta de dados (separada do accent)

Para o donut e categorias, uma paleta categórica dessaturada e harmônica, com as categorias de cauda longa viradas em tons de cinza para não competir com as principais. Nada de arco-íris berrante.

```
Categoria 1   #3B6CF6   (cobalto)
Categoria 2   #22B8CF   (ciano)
Categoria 3   #5C7CFA   (índigo claro)
Categoria 4   #748FFC   (lavanda)
Categoria 5   #9775FA   (violeta suave)
Cauda longa   #52525B / #3F3F46 / #2E2E33  (cinzas)
```

Para o mapa de calor, escala sequencial de uma cor só (transparente, cobalto, ciano quente no pico). Intensidade comunica densidade, não matiz. Mais sofisticado e mais legível que o heatmap multicolor da referência.

### Tipografia

- **Geist Sans**: toda a interface, labels, corpo.
- **Geist Mono**: TODOS os números (KPIs, tabelas, percentuais, eixos). Tabular, alinhado, preciso. Os números são o produto, então merecem fonte própria.
- KPIs grandes: Geist peso 600 a 700, tracking apertado, tamanho generoso.
- Labels de seção e eixos: caps, tracking aberto, tamanho pequeno, cor secundária.

Combina com shadcn nativamente e com a estética monocromática e precisa de referências como Revolut e Mercedes.

### Signature

Dois momentos que tornam o painel memorável:

1. **KPIs como tickers**: os seis números grandes com animação de count-up tabular no load. O número "rola" até o valor. Mono, sem decoração, só o dado contando.
2. **Mapa full-bleed com filtros em vidro**: o mapa de calor é o herói, ocupa a maior área, e os filtros flutuam num header com glass blur por cima, em vez da barra chapada da referência.

Gaste a ousadia nesses dois lugares. Todo o resto fica quieto e disciplinado.

## 4. Layout

Grid bento, responsivo. Wireframe desktop:

```
+--------------------------------------------------------------+
|  LOGO        [ filtros faceted em popovers de vidro ]   ⌘K   |  header sticky glass
+--------------------------------------------------------------+
| OBRAS | METRAGEM | CONSTRUT. | PROFISS. | PF | PJ            |  6 KPIs bento, mono count-up
+--------------------------------------------------------------+
|                                      |                       |
|         MAPA DE CALOR (herói)        |   DONUT por tipologia |
|         MapLibre dark + heat         |                       |
|                                      +-----------------------+
|                                      |   TABELAS (tabs):     |
|                                      |   UF | Cidade | Bairro|
+--------------------------------------+-----------------------+
```

Mobile: filtros viram um `Sheet` lateral acionado por botão, KPIs empilham 2 por linha, mapa e painéis empilham em coluna única.

## 5. Filtros

Onze filtros, todos como faceted filters do shadcn (botão que abre `Popover` com `Command`: busca + checkboxes), nunca dropdowns chapados. Filtro ativo mostra `Badge` com contagem. Estado vive na URL via nuqs.

Linha 1:
1. **Serviço** (seleção múltipla)
2. **Fase da obra**
3. **Faixa de metragem**
4. **Previsão de início**
5. **Previsão de término**
6. **Data de registro** (hierárquico: Ano > Trimestre > Mês, seleção múltipla, com tree expansível dentro do popover)

Linha 2:
7. **Construtora / Escritório de arquitetura / Inco / SPE**
8. **Tipologia**
9. **Estado**
10. **Cidade**
11. **Bairro**

Comportamentos:
- Estado, Cidade e Bairro são encadeados (escolher estado filtra cidades disponíveis).
- Botão "Limpar filtros" aparece quando há qualquer filtro ativo.
- `⌘K` abre command palette para buscar e aplicar qualquer filtro pelo teclado.
- Todo gráfico e tabela reage aos filtros (cross-filter). Clicar numa fatia do donut ou numa UF da tabela aplica aquele filtro.

## 6. KPIs (valores reais da referência para o mock)

Seis cards. Número em Gest Mono com count-up, label em caps abaixo, formatação pt-BR (`toLocaleString('pt-BR')`).

| KPI | Valor mock |
|---|---|
| Obras | 271.393 |
| Metragem (m²) | 931.658.378 |
| Construtoras / Arquitetos | 45.024 |
| Profissionais | 129.780 |
| Pessoa física | 180.586 |
| Pessoa jurídica | 76.873 |

## 7. Visualizações

### Mapa de calor (herói)
- MapLibre GL via react-map-gl, basemap dark (Carto dark-matter ou Positron), sem o satélite poluído da referência.
- Camada `heatmap` ponderada por quantidade de obras (ou por metragem, com toggle).
- Pontos vêm do mock: gerar coordenadas a partir de centroides de municípios brasileiros (IBGE) com jitter, ou agregado por município.
- Controles de zoom discretos, canto inferior. Tooltip ao passar mostra município e contagem.

### Donut: quantidade de obras por tipologia
shadcn chart (Recharts `PieChart` donut). Centro mostra o total. Legenda à direita com valor e percentual. Mock:

| Tipologia | Qtd | % |
|---|---|---|
| Residencial | 173.604 | 62,52% |
| Comercial | 30.042 | 10,82% |
| Residencial vertical | 18.808 | 6,77% |
| (Em branco) | 9.927 | 3,57% |
| Comércio / Lojas | 9.755 | 3,51% |
| Comercial saúde | 5.628 | 2,03% |
| Comercial bancos | 1.262 | 0,45% |
| Comercial vertical | 8 | 0% |

Mais: Comercial educação, Comercial religioso, Comercial vertical, Outras finalidades (cauda longa em cinza).

### Tabelas (TanStack Table, em tabs: UF | Cidade | Bairro)
Header sticky, hover de linha, número mono alinhado à direita, e uma mini-barra inline atrás do valor mostrando a proporção (em vez de só texto). Ordenável.

**Obras por UF:** SP 85.111, MG 31.731, PR 20.033, RJ 16.251, RS 12.715, BA 11.780, GO 9.748, SC 9.539, CE 7.990

**Cidade:** São Paulo 29.011, Rio de Janeiro 9.000, Brasília 5.225, Curitiba 3.615, Belo Horizonte 3.180, Goiânia 2.488, Campinas 2.469, Fortaleza 2.179, Salvador 2.155

**Bairro:** Centro 81.566, Zona Rural 1.610, Barra da Tijuca 1.271, Zona Urbana 1.177, Bela Vista 1.046, Pinheiros 933, Jardim Paulista 723, Vila Mariana 666, Copacabana 661

## 8. Estrutura de dados (mock primeiro, real depois)

Criar `lib/types.ts` com a interface de uma obra, e `lib/mock-data.ts` gerando um dataset coerente com os números acima. A mesma interface depois recebe os dados reais do CNO sem mexer na UI.

```ts
interface Obra {
  cno: string
  tipologia: string
  servico: string[]
  faseObra: string
  metragem: number
  uf: string
  municipio: string
  bairro: string
  lat: number
  lng: number
  responsavelTipo: 'PF' | 'PJ'
  responsavelNome: string
  dataRegistro: string   // ISO
  previsaoInicio: string
  previsaoTermino: string
}
```

KPIs, donut e tabelas são todos derivados desse array via funções de agregação puras (`lib/aggregations.ts`), para que filtrar seja só refazer a agregação sobre o subconjunto filtrado.

## 9. Componentes shadcn a instalar

`card`, `button`, `popover`, `command`, `badge`, `tabs`, `table`, `scroll-area`, `separator`, `tooltip`, `skeleton`, `toggle-group`, `sheet`, `sonner`, `chart`.

## 10. Fases de implementação

1. **Setup**: Next + Tailwind + `shadcn init` + Geist/Geist Mono + tokens de cor no `globals.css` (sobrescrever as variáveis HSL do shadcn com a paleta graphite acima).
2. **Shell + tema**: layout, provider de tema (dark default), toggle claro/escuro.
3. **Camada de dados**: `types.ts`, `mock-data.ts`, `aggregations.ts`.
4. **Header + filtros**: barra glass sticky, os 11 faceted filters, estado na URL com nuqs, ⌘K.
5. **KPI row**: seis cards bento com count-up mono.
6. **Mapa de calor**: MapLibre dark + heatmap layer.
7. **Donut + tabelas**: chart shadcn e TanStack Table em tabs.
8. **Cross-filter**: clicar em fatia/linha aplica filtro, tudo reage ao estado compartilhado.
9. **Polish**: skeletons de loading, animações de entrada (respeitar `prefers-reduced-motion`), empty states com instrução, responsivo até mobile, foco de teclado visível.
10. **Migração para dados reais**: trocar o mock pelo pipeline do CNO (seção 12), sem tocar na UI. Só roda depois do dashboard inteiro estar de pé com mock.

## 11. Barra de qualidade (não negociável)

- Responsivo de verdade até mobile (filtros em Sheet, KPIs e painéis empilham).
- Formatação numérica pt-BR em tudo.
- Números sempre em fonte tabular alinhados à direita.
- Foco de teclado visível, navegável só com teclado.
- `prefers-reduced-motion` respeitado (sem count-up nem transições se o usuário pediu menos movimento).
- Empty states com direção ("Nenhuma obra com esses filtros. Limpe um filtro para ver resultados."), nunca tela em branco.
- Zero cor de marca decorativa: o cobalto só aparece em interação.

---

## 12. Camada de dados real (CNO)

O mock e os dados reais compartilham a mesma interface `Obra`, então a UI não muda. O que muda é a arquitetura num ponto crítico: a base nacional do CNO tem milhões de registros, e agregar isso no navegador é inviável. As agregações migram para o banco, e o front passa a pedir números já prontos.

### Fonte dos dados

- **CNO como dado aberto da Receita Federal**, gratuito, atualização mensal. Disponível no portal de dados abertos da Receita e tratado na Base dos Dados (consultável por SQL via BigQuery). Não é tempo real, é um retrato mensal.
- **Base aberta de CNPJ da Receita** (também mensal), para enriquecer o responsável quando ele é pessoa jurídica.

### Estrutura do registro CNO (o que vem de fábrica)

`cno`, `situacao` (ativa, paralisada, encerrada, nula), `dataInicioObra`, `dataSituacao`, `areas[]` (com `categoria`, `destinacao`, `metragem`, `tipoArea`, `tipoObra`), `logradouro`, `numero`, `bairro`, `cep`, `municipio`, `codigoMunicipio`, `uf`, `niResponsavel`, `tipoResponsabilidade`, `dataInicioResponsabilidade`.

### Mapeamento da UI para o CNO

| Campo da UI | De onde vem | Observação |
|---|---|---|
| `cno` | `cno` | direto |
| `metragem` | soma de `areas[].metragem` (áreas principais) | direto |
| `uf` | `uf` | direto |
| `municipio` | `municipio` + `codigoMunicipio` | padronizar pelo código IBGE |
| `bairro` | `bairro` | sujo, precisa normalizar |
| `lat` / `lng` | NÃO existe | geocodificar (ver abaixo) |
| `responsavelTipo` | derivar de `niResponsavel` | 14 dígitos = PJ, 11 = PF |
| `responsavelNome` | base de CNPJ (só PJ) | PF nunca é exposto (LGPD) |
| `dataRegistro` | `dataInicioResponsabilidade` | aproximação |
| `tipologia` | `areas[].destinacao` + `tipoObra` | mapear para as categorias do donut |
| `faseObra` | derivar de `situacao` + tempo desde `dataInicioObra` | heurística, não é fase real |

### Gaps honestos (o que o CNO não te dá)

O concorrente tem campos que o CNO puro não tem. Na v1, ou se remove esses elementos da UI, ou se marca como "em breve". Não inventar dado.

- **Fase de execução granular** (fundação, alvenaria, acabamento): não existe. O CNO só sabe a `situacao`. A "fase da obra" no máximo é uma heurística por tempo.
- **Previsão de início e término**: não existe.
- **Lista de serviços**: não existe.
- **Contato de decisor**: não existe (é o que o Obras Online vende caro).
- **Papéis de arquiteto, inco, SPE separados**: não existe. Só há o responsável, e nome só quando é PJ.
- **Contagem de profissionais**: não existe. O KPI "Profissionais" do print não tem lastro no CNO.

Consequência prática nos KPIs e filtros: trocar os que não têm lastro por KPIs que o CNO sustenta de verdade. Sugestão: **Obras**, **Metragem total**, **Responsáveis PJ**, **Responsáveis PF**, **Obras ativas**, **Obras novas no período**. Nos filtros, manter Serviço, Previsão de início/término e Fase só se forem derivados de forma honesta, senão tirar da v1.

### Geocodificação (para o mapa)

O CNO tem endereço e município, mas não coordenadas. Geocodificar uma única vez no ETL e salvar, nunca em runtime.

- **v1 (grátis)**: centroide do município pelo IBGE, com leve jitter. Heatmap por município já comunica densidade muito bem e custa zero.
- **v2 (preciso)**: geocodificar o endereço completo. Nominatim/OSM é grátis mas tem rate limit (exige fila e cache); Google e Mapbox são pagos e precisos.

### Pipeline ETL (job mensal)

1. Baixar o dump do CNO (e do CNPJ) do portal de dados abertos.
2. Parse e normalização: limpar bairro, padronizar município por código IBGE, somar metragem das áreas principais.
3. Derivar `responsavelTipo` do tamanho do NI; juntar o nome do CNPJ nos PJ.
4. Geocodificar por centroide de município.
5. Mapear `destinacao` e `tipoObra` para a tipologia da UI.
6. Carregar no Postgres.
7. Materializar tabelas de agregação (por UF, município, bairro, tipologia, situação) para leitura instantânea.

Orquestração: dá para usar o n8n que você já roda, ou GitHub Actions agendado, ou cron do Supabase. Roda uma vez por mês, quando a Receita atualiza.

### Arquitetura

- **Banco**: Supabase (Postgres) com PostGIS para geo. Você já usa Supabase no Taxei.
- **Agregações no banco**, via SQL e views materializadas. O front pede KPIs, donut e tabelas já prontos, mais uma amostra agregada de pontos para o mapa. Nada de baixar milhões de linhas pro navegador.
- **API**: route handlers do Next ou client do Supabase com RLS. Cada filtro vira uma cláusula WHERE parametrizada.
- **Troca do mock**: substituir `lib/mock-data.ts` por um data provider real que implementa a mesma interface de agregação da seção 8. A UI não percebe a diferença.
- **Mapa em escala**: não jogar todos os pontos no MapLibre. Usar o heatmap já agregado por município, ou clustering/tiles vetoriais.

### LGPD (regra técnica, não opcional)

- `responsavelNome` só é preenchido e exibido quando o responsável é PJ.
- Pessoa física nunca tem nome nem documento expostos na v1. PF entra só como contagem agregada (o KPI de pessoa física é um número, sem identificação).
- Qualquer feature futura que exponha PF exige base legal documentada antes de ser construída.

---

## Prompt inicial para o Claude Code

> Leia o PLANO.md na raiz. Vamos construir o dashboard descrito nele em fases. Comece pela Fase 1 (setup) e Fase 2 (shell + tema): inicialize o projeto Next 14 com App Router, Tailwind e shadcn, instale Geist e Geist Mono, e aplique a paleta graphite da seção 3 sobrescrevendo as variáveis de tema do shadcn no globals.css. Quando terminar, me mostre o shell rodando com o toggle de tema antes de seguir para os dados e os filtros. Use dados mock o tempo todo, com a interface de tipos da seção 8, para a camada real do CNO entrar depois sem tocar na UI.
