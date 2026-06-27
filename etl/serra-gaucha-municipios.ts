// Núcleo da Serra Gaúcha (Uva e Vinho + Hortênsias).
// Códigos IBGE (7 dígitos) oficiais + centroide do município (Nominatim/OSM),
// usados para filtrar o CNO no BigQuery e geocodificar as obras (o CNO não
// tem coordenadas — cada obra recebe o centroide do seu município + jitter).

export interface MunicipioSerra {
  codigoIbge: string;
  municipio: string;
  uf: "RS";
  lat: number;
  lng: number;
}

export const SERRA_GAUCHA: MunicipioSerra[] = [
  { codigoIbge: "4305108", municipio: "Caxias do Sul", uf: "RS", lat: -29.1685045, lng: -51.1796385 },
  { codigoIbge: "4302105", municipio: "Bento Gonçalves", uf: "RS", lat: -29.1656734, lng: -51.5201166 },
  { codigoIbge: "4308607", municipio: "Garibaldi", uf: "RS", lat: -29.2562253, lng: -51.5269167 },
  { codigoIbge: "4304804", municipio: "Carlos Barbosa", uf: "RS", lat: -29.2978372, lng: -51.5005613 },
  { codigoIbge: "4307906", municipio: "Farroupilha", uf: "RS", lat: -29.2264700, lng: -51.3468188 },
  { codigoIbge: "4308201", municipio: "Flores da Cunha", uf: "RS", lat: -29.0301290, lng: -51.1833349 },
  { codigoIbge: "4300802", municipio: "Antônio Prado", uf: "RS", lat: -28.8555285, lng: -51.2795932 },
  { codigoIbge: "4322806", municipio: "Veranópolis", uf: "RS", lat: -28.9351239, lng: -51.5519175 },
  { codigoIbge: "4313086", municipio: "Nova Pádua", uf: "RS", lat: -29.0283514, lng: -51.3075981 },
  { codigoIbge: "4319000", municipio: "São Marcos", uf: "RS", lat: -28.9706799, lng: -51.0687665 },
  { codigoIbge: "4313359", municipio: "Nova Roma do Sul", uf: "RS", lat: -28.9884663, lng: -51.4086514 },
  { codigoIbge: "4305959", municipio: "Cotiporã", uf: "RS", lat: -28.9950719, lng: -51.6963590 },
  { codigoIbge: "4307864", municipio: "Fagundes Varela", uf: "RS", lat: -28.8807515, lng: -51.6987798 },
  { codigoIbge: "4309100", municipio: "Gramado", uf: "RS", lat: -29.3792858, lng: -50.8737019 },
  { codigoIbge: "4304408", municipio: "Canela", uf: "RS", lat: -29.3447033, lng: -50.7604149 },
  { codigoIbge: "4313201", municipio: "Nova Petrópolis", uf: "RS", lat: -29.3759836, lng: -51.1123342 },
  { codigoIbge: "4318200", municipio: "São Francisco de Paula", uf: "RS", lat: -29.4484540, lng: -50.5833027 },
  { codigoIbge: "4314423", municipio: "Picada Café", uf: "RS", lat: -29.4464210, lng: -51.1367250 },
];

/** Códigos IBGE para o filtro `id_municipio IN (...)` no BigQuery. */
export const SERRA_GAUCHA_CODIGOS = SERRA_GAUCHA.map((m) => m.codigoIbge);

/** Lookup rápido código IBGE -> centroide/nome. */
export const SERRA_POR_CODIGO = new Map(
  SERRA_GAUCHA.map((m) => [m.codigoIbge, m]),
);
