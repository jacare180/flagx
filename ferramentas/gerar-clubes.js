/*
 * Gera dados/clubes.json e copia os escudos para escudos/, a partir da coleção FCLOGO.
 *
 * Uso (na pasta do projeto):
 *   git clone --depth 1 https://github.com/FCLOGO/fclogo.top <pasta>
 *   node ferramentas/gerar-clubes.js <pasta>/src/data/logos
 *
 * Fonte: FCLOGO (https://github.com/FCLOGO/fclogo.top), licença MIT.
 * Os escudos são marcas dos clubes; o jogo é um projeto de fã, sem fins comerciais.
 */
const fs = require("fs");
const path = require("path");

const raiz = process.argv[2];
if (!raiz) {
  console.error("Uso: node ferramentas/gerar-clubes.js <fclogo.top>/src/data/logos");
  process.exit(1);
}

// Federação da FCLOGO -> liga do jogo.
const LIGAS = {
  theFA: { liga: "inglaterra", pais: "Inglaterra" },
  RFEF: { liga: "espanha", pais: "Espanha" },
  FIGC: { liga: "italia", pais: "Itália" },
  DFB: { liga: "alemanha", pais: "Alemanha" },
  FFF: { liga: "franca", pais: "França" },
  AFA: { liga: "argentina", pais: "Argentina" },
  CBF: { liga: "brasil", pais: "Brasil" },
  FPF: { liga: "portugal", pais: "Portugal" },
};

// Clubes que ficam de fora (pouco conhecidos ou fora da liga principal).
const FORA = ["SD Tenisca"];

// Nome que aparece no jogo, quando o da pasta não é o usado no Brasil.
const NOMES = {
  "Man City": "Manchester City", "Man United": "Manchester United", "Hotspur": "Tottenham",
  "Nottingham": "Nottingham Forest", "Wolves": "Wolverhampton", "Newcastle": "Newcastle United",
  "Leicester": "Leicester City", "Ipswich": "Ipswich Town",
  "Atletico Madrid": "Atlético de Madrid", "Vallecano": "Rayo Vallecano", "Celta": "Celta de Vigo",
  "LaCoruna": "Deportivo La Coruña", "Malaga": "Málaga", "Santander": "Racing Santander",
  "Gijón": "Sporting Gijón", "Ferrol": "Racing Ferrol", "Zaragoza": "Real Zaragoza",
  "Intel Milan": "Inter de Milão", "AC Milan": "Milan", "Verona": "Hellas Verona",
  "Bayern Munich": "Bayern de Munique", "Dortmund": "Borussia Dortmund", "Leverkusen": "Bayer Leverkusen",
  "Leipzig": "RB Leipzig", "Frankfurt": "Eintracht Frankfurt", "Bremen": "Werder Bremen",
  "Monchengladbach": "Borussia Mönchengladbach", "Köln": "Colônia", "Düsseldorf": "Fortuna Düsseldorf",
  "Hamburger": "Hamburgo", "Hannover": "Hannover 96", "Greuther": "Greuther Fürth", "Hertha": "Hertha Berlim",
  "Eintracht": "Eintracht Braunschweig", "Union Berlin": "Union Berlim", "SSV Ulm": "Ulm",
  "Darmstadt": "Darmstadt 98", "Karlsruher": "Karlsruher SC", "Münster": "Preußen Münster",
  "Paris": "Paris Saint-Germain", "Brestois": "Brest", "Rennais": "Rennes", "Marseille": "Olympique de Marseille",
  "Lyon": "Olympique Lyonnais", "FC Lorient": "Lorient", "FC Metz": "Metz",
  "Estudiantes": "Estudiantes de La Plata", "Gimnasia LP": "Gimnasia La Plata", "Newell's": "Newell's Old Boys",
  "Racing": "Racing Club", "Vélez": "Vélez Sarsfield", "Unión": "Unión de Santa Fe", "Colón": "Colón de Santa Fe",
};

// Apelidos extras que também valem como chute.
const APELIDOS = {
  "Paris Saint-Germain": ["PSG"], "Inter de Milão": ["Inter", "Internazionale"], "Bayern de Munique": ["Bayern"],
  "Manchester United": ["Man United", "Manchester Utd", "Man Utd"], "Barcelona": ["Barça"], "Juventus": ["Juve"],
  "Real Madrid": ["Real"], "Borussia Mönchengladbach": ["Gladbach"], "Manchester City": ["Man City"], "Tottenham": ["Spurs", "Tottenham Hotspur"],
  "Atlético de Madrid": ["Atlético", "Atleti"], "Olympique de Marseille": ["Marseille", "Olympique Marseille"],
  "Olympique Lyonnais": ["Lyon"], "Borussia Dortmund": ["Dortmund", "BVB"], "Hamburgo": ["Hamburger SV", "HSV"],
  "Colônia": ["Köln", "Koln", "Colonia"], "Wolverhampton": ["Wolves"], "Milan": ["AC Milan"], "Roma": ["AS Roma"],
  "Napoli": ["Nápoles"], "Torino": ["Turim"], "Sevilla": ["Sevilha"], "Benfica": ["SL Benfica"], "Porto": ["FC Porto"],
};

// Cidades com nome diferente no Brasil (para a pergunta bônus "de que cidade é?").
const CIDADES = {
  London: ["Londres"], Munich: ["Munique"], "München": ["Munique"], Milan: ["Milão"], Turin: ["Turim"],
  Rome: ["Roma"], Naples: ["Nápoles"], Florence: ["Florença"], Genoa: ["Gênova"], Venice: ["Veneza"],
  Seville: ["Sevilha"], "Sevilla": ["Sevilha"], Cologne: ["Colônia"], "Köln": ["Colônia"], Hamburg: ["Hamburgo"],
  Berlin: ["Berlim"], Mainz: ["Mogúncia", "Mainz"], Lisbon: ["Lisboa"], Marseille: ["Marselha"], Lyon: ["Lyon", "Lião"],
  Nice: ["Nice"], Strasbourg: ["Estrasburgo"], Bilbao: ["Bilbau", "Bilbao"], "La Coruña": ["La Coruña", "Corunha"],
  Bremen: ["Bremen"], Nuremberg: ["Nuremberg"], "Nürnberg": ["Nuremberg"], Brunswick: ["Braunschweig"],
};

function lerYaml(arquivo) {
  // Leitor mínimo para as fichas da FCLOGO: pega "chave: valor" de cada linha.
  const texto = fs.readFileSync(arquivo, "utf8");
  const blocos = texto.split(/\n(?=- data:)/);
  return blocos.map((b) => {
    const o = {};
    for (const linha of b.split("\n")) {
      const m = linha.match(/^\s*-?\s*([A-Za-z]+):\s*(.*)$/);
      if (m && !(m[1] in o)) o[m[1]] = m[2].replace(/^['"]|['"]$/g, "").trim();
    }
    return o;
  });
}

function limparPasta(pasta) { return pasta.replace(/^\d+_/, "").trim(); }

function apelidosSemSigla(nome) {
  const sem = nome.replace(/\b(F\.?C\.?|C\.?F\.?|A\.?F\.?C\.?|S\.?S\.?C\.?|A\.?C\.?|A\.?S\.?|U\.?S\.?|S\.?C\.?|C\.?D\.?|U\.?D\.?|R\.?C\.?D\.?|S\.?D\.?|C\.?A\.?|S\.?L\.?|VfB|VfL|TSG|SV|BV|FSV|SpVgg|OGC|LOSC|RC|1\.)\b/g, " ")
    .replace(/\s+/g, " ").trim();
  return sem && sem !== nome ? [sem] : [];
}

function proporcaoSvg(arquivo) {
  const t = fs.readFileSync(arquivo, "utf8").slice(0, 2000);
  const vb = t.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (vb) return [Number(vb[1]), Number(vb[2])];
  const w = t.match(/\swidth="([\d.]+)/), h = t.match(/\sheight="([\d.]+)/);
  return w && h ? [Number(w[1]), Number(h[1])] : [1, 1];
}

const pastaEscudos = path.join(__dirname, "..", "escudos");
fs.mkdirSync(pastaEscudos, { recursive: true });
const clubes = [];
const faltando = [];

for (const [federacao, cfg] of Object.entries(LIGAS)) {
  const pastaClubes = path.join(raiz, federacao, "clubs");
  for (const pasta of fs.readdirSync(pastaClubes).sort()) {
    const nomePasta = limparPasta(pasta);
    if (FORA.includes(nomePasta)) continue;
    const dir = path.join(pastaClubes, pasta);
    const info = lerYaml(path.join(dir, "info", "info.yaml"))[0] || {};
    const logos = lerYaml(path.join(dir, "logo.yaml"))
      .filter((l) => l.svgPath && l.style === "color")
      .sort((a, b) => (a.isOutdated === "true") - (b.isOutdated === "true") || (a.isDoubtful === "true") - (b.isDoubtful === "true") || Number(b.version) - Number(a.version));
    const logo = logos[0];
    if (!logo) continue;
    const origem = path.join(dir, logo.svgPath);
    if (!fs.existsSync(origem)) { faltando.push(path.relative(path.dirname(raiz), origem)); continue; }

    const nome = NOMES[nomePasta] || nomePasta;
    const id = (federacao + "-" + nome).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    // Copia o escudo tirando tags de editor sem declaração (quebram o SVG no navegador, como no Elche).
    const svg = fs.readFileSync(origem, "utf8").replace(/<(sodipodi|inkscape):[^>]*\/>\s*/g, "");
    fs.writeFileSync(path.join(pastaEscudos, id + ".svg"), svg);

    const nomes = [nome, nomePasta, info.shortName, info.fullName, info.localName].concat(APELIDOS[nome] || []).filter(Boolean);
    nomes.slice().forEach((n) => apelidosSemSigla(n).forEach((a) => nomes.push(a)));
    const coord = (info.coordinates || "").match(/\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]/);
    const cidade = (info.city || "").split(",")[0].trim();
    const ranking = Number((pasta.match(/^(\d+)_/) || [0, 999])[1]);

    clubes.push({
      id,
      nome,
      nomes: [...new Set(nomes.map((n) => n.trim()))],
      liga: cfg.liga,
      pais: cfg.pais,
      latlng: coord ? [Number(coord[2]), Number(coord[1])] : null,
      cidades: cidade ? [...new Set((CIDADES[cidade] || []).concat([cidade]))] : [],
      fama: ranking,
      proporcao: proporcaoSvg(origem),
    });
  }
}

if (faltando.length) {
  console.error("Escudos que não estão na pasta (faça checkout deles):\n" + faltando.join("\n"));
  process.exit(2);
}
fs.writeFileSync(path.join(__dirname, "..", "dados", "clubes.json"), JSON.stringify(clubes));
console.log("gerado dados/clubes.json com", clubes.length, "clubes");
