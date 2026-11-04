/*
 * Acrescenta os clubes brasileiros em dados/clubes.json e copia os escudos para escudos/.
 * Rode depois de ferramentas/gerar-clubes.js, que gera as ligas europeias.
 *
 * Uso (na pasta do projeto):
 *   git clone --depth 1 https://github.com/washingtonos/escudos-futebol-api <pasta>
 *   node ferramentas/gerar-clubes-brasil.js <pasta>/assets/badges
 *
 * Fonte: escudos-futebol-api, de Washington Oliveira (https://github.com/washingtonos/escudos-futebol-api).
 * O repositório não declara licença. Os escudos são marcas dos clubes; o jogo é um projeto de fã, sem fins comerciais.
 */
const fs = require("fs");
const path = require("path");

const raiz = process.argv[2];
if (!raiz) {
  console.error("Uso: node ferramentas/gerar-clubes-brasil.js <escudos-futebol-api>/assets/badges");
  process.exit(1);
}

// Na ordem da "fama", usada para a Sobrevivência: primeiro a Série A de 2026, depois clubes tradicionais.
// [arquivo, nome no jogo, outros nomes que valem como chute, cidade, [latitude, longitude] do estádio]
const CLUBES = [
  ["flamengo", "Flamengo", ["Mengão", "Clube de Regatas do Flamengo", "CR Flamengo"], "Rio de Janeiro", [-22.9122, -43.2302]],
  ["corinthians", "Corinthians", ["Timão", "Sport Club Corinthians Paulista", "SC Corinthians"], "São Paulo", [-23.5453, -46.4742]],
  ["palmeiras", "Palmeiras", ["Verdão", "Sociedade Esportiva Palmeiras", "SE Palmeiras"], "São Paulo", [-23.5275, -46.6785]],
  ["sao-paulo", "São Paulo", ["São Paulo FC", "São Paulo Futebol Clube", "SPFC", "Tricolor Paulista"], "São Paulo", [-23.6000, -46.7203]],
  ["vasco", "Vasco da Gama", ["Vasco", "Vascão", "CR Vasco da Gama", "Club de Regatas Vasco da Gama"], "Rio de Janeiro", [-22.8911, -43.2286]],
  ["santos", "Santos", ["Peixe", "Santos FC", "Santos Futebol Clube"], "Santos", [-23.9512, -46.3389]],
  ["gremio", "Grêmio", ["Grêmio FBPA", "Grêmio Foot-Ball Porto Alegrense", "Tricolor Gaúcho"], "Porto Alegre", [-29.9739, -51.1953]],
  ["internacional", "Internacional", ["Inter", "Colorado", "SC Internacional", "Sport Club Internacional"], "Porto Alegre", [-30.0655, -51.2359]],
  ["atletico-mg", "Atlético Mineiro", ["Atlético-MG", "Galo", "Clube Atlético Mineiro", "CAM"], "Belo Horizonte", [-19.9379, -44.0108]],
  ["cruzeiro", "Cruzeiro", ["Raposa", "Cruzeiro Esporte Clube", "Cruzeiro EC"], "Belo Horizonte", [-19.8659, -43.9711]],
  ["botafogo", "Botafogo", ["Fogão", "Botafogo de Futebol e Regatas", "Botafogo FR"], "Rio de Janeiro", [-22.8932, -43.2922]],
  ["fluminense", "Fluminense", ["Flu", "Fluminense FC", "Fluminense Football Club"], "Rio de Janeiro", [-22.9122, -43.2302]],
  ["bahia", "Bahia", ["Esporte Clube Bahia", "EC Bahia", "Esquadrão"], "Salvador", [-12.9787, -38.5043]],
  ["athletico-pr", "Athletico Paranaense", ["Athletico", "Athletico-PR", "Atlético Paranaense", "Furacão", "CAP"], "Curitiba", [-25.4482, -49.2769]],
  ["vitoria", "Vitória", ["Esporte Clube Vitória", "EC Vitória", "Leão da Barra"], "Salvador", [-12.9299, -38.4310]],
  ["coritiba", "Coritiba", ["Coxa", "Coritiba Foot Ball Club", "Coritiba FBC"], "Curitiba", [-25.4215, -49.2593]],
  ["bragantino", "Red Bull Bragantino", ["Bragantino", "RB Bragantino", "Massa Bruta"], "Bragança Paulista", [-22.9583, -46.5485]],
  ["chapecoense", "Chapecoense", ["Chape", "Associação Chapecoense de Futebol"], "Chapecó", [-27.1046, -52.6100]],
  ["mirassol", "Mirassol", ["Mirassol FC", "Mirassol Futebol Clube"], "Mirassol", [-20.8170, -49.5157]],
  ["remo", "Remo", ["Clube do Remo", "Leão Azul"], "Belém", [-1.4325, -48.4562]],
  ["fortaleza", "Fortaleza", ["Fortaleza EC", "Fortaleza Esporte Clube", "Leão do Pici"], "Fortaleza", [-3.8073, -38.5225]],
  ["ceara", "Ceará", ["Ceará SC", "Ceará Sporting Club", "Vozão"], "Fortaleza", [-3.8073, -38.5225]],
  ["sport", "Sport", ["Sport Recife", "Sport Club do Recife", "Leão da Ilha"], "Recife", [-8.0628, -34.9033]],
  ["juventude", "Juventude", ["Esporte Clube Juventude", "EC Juventude", "Ju"], "Caxias do Sul", [-29.1749, -51.1923]],
  ["goias", "Goiás", ["Goiás EC", "Goiás Esporte Clube", "Verdão do Serrado"], "Goiânia", [-16.7110, -49.2392]],
  ["cuiaba", "Cuiabá", ["Cuiabá EC", "Cuiabá Esporte Clube", "Dourado"], "Cuiabá", [-15.6038, -56.1214]],
  ["atletico-go", "Atlético Goianiense", ["Atlético-GO", "Dragão", "Atlético Clube Goianiense"], "Goiânia", [-16.6799, -49.2475]],
  ["criciuma", "Criciúma", ["Criciúma EC", "Criciúma Esporte Clube", "Tigre"], "Criciúma", [-28.6910, -49.3735]],
  ["avai", "Avaí", ["Avaí FC", "Avaí Futebol Clube", "Leão da Ilha"], "Florianópolis", [-27.6020, -48.5462]],
  ["figueirense", "Figueirense", ["Figueirense FC", "Figueirense Futebol Clube", "Figueira"], "Florianópolis", [-27.5906, -48.5772]],
  ["ponte-preta", "Ponte Preta", ["Macaca", "Associação Atlética Ponte Preta", "AA Ponte Preta"], "Campinas", [-22.9077, -47.0776]],
  ["guarani", "Guarani", ["Guarani FC", "Guarani Futebol Clube", "Bugre"], "Campinas", [-22.8918, -47.0436]],
  ["paysandu", "Paysandu", ["Paysandu SC", "Paysandu Sport Club", "Papão"], "Belém", [-1.4462, -48.4821]],
  ["nautico", "Náutico", ["Clube Náutico Capibaribe", "Timbu"], "Recife", [-8.0356, -34.9046]],
  ["santa-cruz", "Santa Cruz", ["Santa Cruz FC", "Santa Cruz Futebol Clube", "Cobra Coral"], "Recife", [-8.0270, -34.8930]],
  ["portuguesa", "Portuguesa", ["Lusa", "Associação Portuguesa de Desportos"], "São Paulo", [-23.5271, -46.6182]],
];

function proporcaoSvg(texto) {
  const t = texto.slice(0, 3000);
  const vb = t.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (vb) return [Number(vb[1]), Number(vb[2])];
  const w = t.match(/<svg[^>]*\swidth="([\d.]+)/), h = t.match(/<svg[^>]*\sheight="([\d.]+)/);
  return w && h ? [Number(w[1]), Number(h[1])] : [1, 1];
}

const pastaEscudos = path.join(__dirname, "..", "escudos");
const arquivoDados = path.join(__dirname, "..", "dados", "clubes.json");
const clubes = JSON.parse(fs.readFileSync(arquivoDados, "utf8")).filter((c) => c.liga !== "brasil");

CLUBES.forEach(([arquivo, nome, apelidos, cidade, latlng], i) => {
  const origem = path.join(raiz, arquivo + ".svg");
  const svg = fs.readFileSync(origem, "utf8").replace(/<(sodipodi|inkscape):[^>]*\/>\s*/g, "");
  const id = "br-" + arquivo;
  fs.writeFileSync(path.join(pastaEscudos, id + ".svg"), svg);
  clubes.push({
    id,
    nome,
    nomes: [nome].concat(apelidos),
    liga: "brasil",
    pais: "Brasil",
    latlng,
    cidades: [cidade],
    fama: i + 1,
    proporcao: proporcaoSvg(svg),
  });
});

fs.writeFileSync(arquivoDados, JSON.stringify(clubes));
console.log("dados/clubes.json agora tem", clubes.length, "clubes,", CLUBES.length, "do Brasil");
