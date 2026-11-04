/*
 * Gera dados/paises.json, o arquivo de países que o jogo lê.
 *
 * Uso (na pasta do projeto):
 *   npm pack world-countries @geobase/countries-data
 *   (descompacte os dois .tgz)
 *   node ferramentas/gerar-paises.js <countries.json do world-countries> <countries.json do @geobase/countries-data>
 *
 * Fontes:
 *   world-countries (projeto mledoze/countries, licença ODbL): nomes, região, coordenadas, capital
 *   @geobase/countries-data (licença MIT): população aproximada, usada só para ordenar
 *     do mais conhecido ao menos conhecido no modo Sobrevivência
 *   ferramentas/capitais-br.json: nomes das capitais usados no Brasil
 */
const fs = require("fs");
const path = require("path");

const [arquivoPaises, arquivoPopulacao] = process.argv.slice(2);
if (!arquivoPaises || !arquivoPopulacao) {
  console.error("Uso: node ferramentas/gerar-paises.js <world-countries/countries.json> <geobase/countries/countries.json>");
  process.exit(1);
}

const paises = JSON.parse(fs.readFileSync(arquivoPaises, "utf8"));
const populacaoBruta = Object.values(JSON.parse(fs.readFileSync(arquivoPopulacao, "utf8")));
const populacao = Object.fromEntries(populacaoBruta.map((p) => [p.shortCode, Number(p.population) || 0]));
const capitaisBR = JSON.parse(fs.readFileSync(path.join(__dirname, "capitais-br.json"), "utf8"));

const saida = paises.map((p) => {
  const codigo = p.cca2.toLowerCase();
  const capitaisIngles = p.capital || [];
  const br = capitaisBR[codigo] || [];
  return {
    cca2: p.cca2,
    name: { common: p.name.common, official: p.name.official },
    translations: { por: p.translations.por },
    region: p.region,
    subregion: p.subregion,
    latlng: p.latlng,
    independent: p.independent,
    altSpellings: p.altSpellings,
    capital: capitaisIngles.length ? [...new Set(br.concat(capitaisIngles))] : [],
    population: populacao[p.cca2] || 0,
  };
});

const destino = path.join(__dirname, "..", "dados", "paises.json");
fs.writeFileSync(destino, JSON.stringify(saida));
console.log("gerado", destino, saida.length, "países");
