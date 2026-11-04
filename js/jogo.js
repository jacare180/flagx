/* Flagx: modos clássico e sobrevivência, filtro de região, modo difícil e bônus da capital. */
(function () {
  "use strict";

  // Dados dos países guardados no próprio jogo (projeto mledoze/countries, licença ODbL).
  // A API REST Countries v3.1 foi desativada, por isso não dependemos mais dela.
  var CDN_BANDEIRAS = "https://flagcdn.com/";

  // O mesmo jogo serve para bandeiras e para escudos de futebol (?tema=futebol na URL).
  var TEMA = /(?:^|[?&])tema=futebol(?:&|$)/.test(location.search) ? "futebol" : "bandeiras";
  var TEMAS = {
    bandeiras: {
      dados: "dados/paises.json",
      prefixo: "flagx",
      titulo: "Que bandeira é essa?",
      pagina: "Flagx: adivinhe a bandeira em seis pedaços",
      item: "bandeira", itens: "bandeiras",
      proxima: "Próxima bandeira",
      placeholder: "Digite um país",
      digiteNome: "Digite o nome de um país.",
      listaTodos: "Todos os países", listaFiltrada: "Países com esse nome",
      alt: "Bandeira de ",
      bonus: "Vale 50% de bônus: qual é a capital?",
      bonusCerto: "Isso, {r}. Mais {p} pontos de bônus.", bonusErrado: "Não. A capital é {r}.",
      explicaDificil: "Sem cor, espelhada, com territórios. Pontos em dobro.",
      regiaoPadrao: "mundo",
      regioes: [
        { valor: "mundo", rotulo: "Mundo", filtro: null },
        { valor: "africa", rotulo: "África", filtro: "Africa" },
        { valor: "americas", rotulo: "Américas", filtro: "Americas" },
        { valor: "asia", rotulo: "Ásia", filtro: "Asia" },
        { valor: "europa", rotulo: "Europa", filtro: "Europe" },
        { valor: "oceania", rotulo: "Oceania", filtro: "Oceania" },
      ],
      creditos: 'Bandeiras de <a href="https://flagcdn.com">FlagCDN</a>. Dados dos países de <a href="https://github.com/mledoze/countries">mledoze/countries</a> (licença ODbL).',
      trocaPara: "futebol", trocaRotulo: "Trocar para escudos de futebol",
    },
    futebol: {
      dados: "dados/clubes.json",
      prefixo: "flagx.futebol",
      titulo: "Que escudo é esse?",
      pagina: "Flagx Futebol: adivinhe o escudo em seis pedaços",
      item: "escudo", itens: "escudos",
      proxima: "Próximo escudo",
      placeholder: "Digite um clube",
      digiteNome: "Digite o nome de um clube.",
      listaTodos: "Todos os clubes", listaFiltrada: "Clubes com esse nome",
      alt: "Escudo do ",
      bonus: "Vale 50% de bônus: de que cidade é o clube?",
      bonusCerto: "Isso, {r}. Mais {p} pontos de bônus.", bonusErrado: "Não. O clube é de {r}.",
      explicaDificil: "Sem cor e espelhado. Pontos em dobro.",
      regiaoPadrao: "todos",
      regioes: [
        { valor: "todos", rotulo: "Todos", filtro: null },
        { valor: "inglaterra", rotulo: "Inglaterra", filtro: "inglaterra" },
        { valor: "espanha", rotulo: "Espanha", filtro: "espanha" },
        { valor: "italia", rotulo: "Itália", filtro: "italia" },
        { valor: "alemanha", rotulo: "Alemanha", filtro: "alemanha" },
        { valor: "franca", rotulo: "França", filtro: "franca" },
        { valor: "argentina", rotulo: "Argentina", filtro: "argentina" },
      ],
      creditos: 'Escudos da coleção <a href="https://github.com/FCLOGO/fclogo.top">FCLOGO</a>, para uso pessoal. Os escudos são marcas dos clubes.',
      trocaPara: "bandeiras", trocaRotulo: "Trocar para bandeiras",
    },
  };
  var T = TEMAS[TEMA];
  var PONTOS_POR_PECA = 20;
  var TOTAL_PECAS = 6;
  var ESPERA_BANDEIRA = 1000; // milissegundos antes de mostrar a bandeira e abrir o primeiro pedaço
  var CHAVE_RECORDE = T.prefixo + ".recorde";
  var CHAVE_AJUSTES = T.prefixo + ".ajustes";
  var MULTIPLICADOR_DIFICIL = 2;
  var BONUS_CAPITAL = 0.5;          // a capital certa vale mais 50% dos pontos da rodada
  var VIDAS_SOBREVIVENCIA = 3;
  // Contra o relógio
  var TEMPO_RELOGIO = 60;           // segundos de partida
  var REVELAR_A_CADA = 2500;        // ms entre um pedaço e outro, revelados sozinhos
  var PAUSA_ENTRE_RODADAS = 900;    // ms mostrando a resposta antes da próxima
  var ESPERA_RELOGIO = 400;         // espera menor antes de mostrar a bandeira
  // Sobrevivência: começa só com os países mais populosos (os mais conhecidos)
  // e a cada acerto abre mais uma fatia da lista.
  var FAMA_INICIAL = 0.25;          // 25% mais populosos no começo
  var FAMA_POR_ACERTO = 0.05;       // mais 5% da lista a cada acerto
  var FAMA_MINIMO = 8;              // nunca menos que 8 opções

  // Territórios que usam a bandeira de outro país (impossíveis de acertar). Ficam fora do sorteio.
  var BANDEIRA_REPETIDA = ["hm", "bl", "gp", "gf", "mf", "yt", "re", "pm", "wf", "sh", "um", "bv", "sj", "mq", "nc"];

  // Regiões do jogo. A Antártida só aparece no mundo todo.
  function filtroDaRegiao(valor) {
    for (var i = 0; i < T.regioes.length; i++) if (T.regioes[i].valor === valor) return T.regioes[i];
    return null;
  }

  // A API traz os nomes em português de Portugal. Aqui ficam os nomes usados no Brasil:
  // o primeiro aparece no jogo, os outros também valem como chute.
  var NOMES_BR = {
    am: ["Armênia"], az: ["Azerbaijão"], by: ["Bielorrússia", "Belarus"], bw: ["Botsuana"],
    cz: ["Tchéquia", "República Tcheca"], dj: ["Djibuti"], ee: ["Estônia"], ir: ["Irã"],
    ke: ["Quênia"], lv: ["Letônia"], mc: ["Mônaco"], mg: ["Madagascar"], mk: ["Macedônia do Norte"],
    mm: ["Mianmar"], mw: ["Malaui"], nl: ["Países Baixos", "Holanda"], pe: ["Peru"], pl: ["Polônia"],
    ro: ["Romênia"], sg: ["Singapura", "Cingapura"], si: ["Eslovênia"], sz: ["Essuatíni", "Suazilândia"],
    tj: ["Tadjiquistão"], tt: ["Trinidad e Tobago"], vc: ["São Vicente e Granadinas"], vn: ["Vietnã"],
    ye: ["Iêmen"], zw: ["Zimbábue"], us: ["Estados Unidos", "EUA"], va: ["Vaticano"],
    ae: ["Emirados Árabes Unidos", "Emirados Árabes"], sc: ["Seicheles", "Seychelles"],
    gl: ["Groenlândia"], ky: ["Ilhas Cayman", "Ilhas Caimã"], cw: ["Curaçao", "Curação"],
    fo: ["Ilhas Feroé", "Ilhas Faroé"], tw: ["Taiwan", "Formosa"], ax: ["Ilhas Åland", "Åland"],
    fk: ["Ilhas Malvinas", "Malvinas", "Falklands"], ps: ["Palestina"],
  };

  // No futebol, as falas de FLAGX_MENSAGENS_FUTEBOL substituem as de mesmo nome.
  var M = {};
  [window.FLAGX_MENSAGENS, TEMA === "futebol" ? window.FLAGX_MENSAGENS_FUTEBOL : null].forEach(function (fonte) {
    if (!fonte) return;
    Object.keys(fonte).forEach(function (k) { M[k] = fonte[k]; });
  });
  var $ = function (id) { return document.getElementById(id); };

  var el = {
    jogo: $("jogo"), img: $("bandeira"), quadro: $("quadro"), pecas: $("pecas"),
    reveladas: $("reveladas"), valor: $("valor"), croc: $("croc"), fala: $("fala"),
    form: $("form-chute"), campo: $("campo-chute"), botao: $("botao-chute"), aviso: $("aviso-chute"),
    sugestoes: $("sugestoes"), sugestoesLista: $("sugestoes-lista"), sugestoesTitulo: $("sugestoes-titulo"), botaoLista: $("botao-lista"), desisto: $("botao-desisto"),
    fim: $("fim"), fimRotulo: $("fim-rotulo"), fimPais: $("fim-pais"), fimPlacar: $("fim-placar"), proxima: $("botao-proxima"),
    falha: $("falha"), tentar: $("botao-tentar"),
    chutes: $("lista-chutes"), chutesVazio: $("chutes-vazio"),
    pontos: $("pontos"), sequencia: $("sequencia"), recorde: $("recorde"),
    ajustes: $("ajustes"), dificil: $("ajuste-dificil"),
    placarVidas: $("placar-vidas"), vidas: $("vidas"), placarTempo: $("placar-tempo"), tempo: $("tempo"), rotuloSequencia: $("rotulo-sequencia"),
    compartilhar: $("botao-compartilhar"), compartilharAviso: $("compartilhar-aviso"),
    formCapital: $("form-capital"), capitalPergunta: $("capital-pergunta"), campoCapital: $("campo-capital"),
    botaoCapital: $("botao-capital"), capitalResultado: $("capital-resultado"),
  };

  var estado = {
    paises: [], pool: [], indice: new Map(), recentes: [],
    alvo: null, ordem: [], abertas: 0, chutes: [], encerrada: true,
    pontos: 0, sequencia: 0, recorde: 0, ultimaFala: {},
    ajustes: lerAjustes(),
    vidas: VIDAS_SOBREVIVENCIA, fimDeJogo: false, primeiraDaCorrida: true,
    ganhoRodada: 0, capitalRespondida: true,
    tempo: TEMPO_RELOGIO, relogioAndando: false, cronometro: null, revelacao: null,
    marcas: [],
  };
  estado.recorde = lerRecorde();

  /* ---------- utilidades ---------- */

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function sortear(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

  function embaralhar(lista, aleatorio) {
    aleatorio = aleatorio || Math.random;
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(aleatorio() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function preencher(modelo, dados) {
    return modelo.replace(/\{(\w+)\}/g, function (_, chave) {
      return dados && dados[chave] != null ? dados[chave] : "";
    });
  }

  function falar(categoria, dados, humor, reserva) {
    if ((!M[categoria] || !M[categoria].length) && reserva) categoria = reserva;
    var lista = M[categoria] && M[categoria].length ? M[categoria] : [""];
    var frase = sortear(lista);
    if (lista.length > 1) {
      while (frase === estado.ultimaFala[categoria]) frase = sortear(lista);
    }
    estado.ultimaFala[categoria] = frase;
    el.fala.textContent = preencher(frase, dados);
    el.croc.setAttribute("data-humor", humor || "neutro");
  }

  function emSobrevivencia() { return estado.ajustes.modo === "sobrevivencia"; }
  function emRelogio() { return estado.ajustes.modo === "relogio"; }
  function emDiario() { return estado.ajustes.modo === "diario"; }

  // Cada modo tem o seu recorde: no clássico é a maior sequência, na sobrevivência
  // é o maior número de acertos numa corrida.
  // No relógio o recorde é a maior pontuação de uma partida.
  function chaveRecorde() {
    if (emSobrevivencia()) return CHAVE_RECORDE + ".sobrevivencia";
    if (emRelogio()) return CHAVE_RECORDE + ".relogio";
    return CHAVE_RECORDE;
  }

  function lerRecorde() {
    try { return parseInt(localStorage.getItem(chaveRecorde()), 10) || 0; } catch (e) { return 0; }
  }

  function salvarRecorde(valor) {
    try { localStorage.setItem(chaveRecorde(), String(valor)); } catch (e) { /* sem armazenamento, segue o jogo */ }
  }

  function lerAjustes() {
    var padrao = { modo: "classico", regiao: T.regiaoPadrao, dificil: false };
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE_AJUSTES) || "{}");
      if (salvo && filtroDaRegiao(salvo.regiao)) padrao.regiao = salvo.regiao;
      if (salvo && salvo.dificil === true) padrao.dificil = true;
      if (salvo && ["sobrevivencia", "relogio", "diario"].indexOf(salvo.modo) !== -1) padrao.modo = salvo.modo;
    } catch (e) { /* sem armazenamento, usa o padrão */ }
    return padrao;
  }

  function salvarAjustes() {
    try { localStorage.setItem(CHAVE_AJUSTES, JSON.stringify(estado.ajustes)); } catch (e) { /* segue sem salvar */ }
  }

  function setEstado(nome) { el.jogo.setAttribute("data-estado", nome); }

  /* ---------- dados ---------- */

  function nomeEmPortugues(p) {
    return (p.translations && p.translations.por && p.translations.por.common) || p.name.common;
  }

  function prepararPaises(brutos) {
    var paises = brutos
      .filter(function (p) { return p && p.cca2 && p.name; })
      .map(function (p) {
        var codigo = p.cca2.toLowerCase();
        var br = NOMES_BR[codigo] || [];
        var nomes = br.concat([nomeEmPortugues(p), p.name.common, p.name.official]);
        if (p.translations && p.translations.por) nomes.push(p.translations.por.official);
        (p.altSpellings || []).forEach(function (n) { if (n && n.length > 3) nomes.push(n); });
        return {
          codigo: codigo,
          nome: br[0] || nomeEmPortugues(p),
          nomes: nomes,
          regiao: p.region,
          latlng: p.latlng,
          independente: p.independent === true,
          capitais: p.capital || [],
          populacao: p.population || 0,
        };
      });

    // Países independentes entram primeiro no índice, para ganhar nomes repetidos.
    paises.sort(function (a, b) { return (b.independente ? 1 : 0) - (a.independente ? 1 : 0); });
    guardarItens(paises);
  }

  // Clubes de futebol viram itens no mesmo formato dos países.
  function prepararClubes(brutos) {
    var clubes = brutos.map(function (c) {
      return {
        codigo: c.id,
        nome: c.nome,
        nomes: c.nomes || [c.nome],
        regiao: c.liga,
        latlng: c.latlng,
        independente: true,
        capitais: c.cidades || [],
        populacao: 1000 - (c.fama || 999),
        proporcao: c.proporcao,
      };
    });
    guardarItens(clubes);
  }

  function guardarItens(itens) {
    var indice = new Map();
    itens.forEach(function (p) {
      p.nomes.forEach(function (n) {
        var chave = normalizar(n);
        if (chave && !indice.has(chave)) indice.set(chave, p);
      });
    });
    estado.paises = itens;
    estado.indice = indice;
    montarPool();
  }

  // Quem pode ser sorteado: países independentes no modo normal; no difícil entram também
  // os territórios com bandeira própria. Depois filtra pela região escolhida.
  function montarPool() {
    var regiao = emDiario() ? null : (filtroDaRegiao(estado.ajustes.regiao) || {}).filtro;
    var dificil = emDiario() ? false : estado.ajustes.dificil;
    estado.pool = estado.paises.filter(function (p) {
      if (TEMA === "bandeiras" && BANDEIRA_REPETIDA.indexOf(p.codigo) !== -1) return false;
      if (!p.independente && !dificil) return false;
      return regiao ? p.regiao === regiao : true;
    });
    estado.recentes = [];
  }

  // Textos, regiões e o ícone de troca de acordo com o tema (bandeiras ou futebol).
  function aplicarTema() {
    document.documentElement.setAttribute("data-tema", TEMA);
    document.title = T.pagina;
    $("titulo-mesa").textContent = T.titulo;
    el.campo.placeholder = T.placeholder;
    el.proxima.textContent = T.proxima;
    $("dificil-explica").textContent = T.explicaDificil;
    $("creditos").innerHTML = T.creditos;
    var troca = $("troca-tema");
    troca.href = T.trocaPara === "futebol" ? "./?tema=futebol" : "./";
    troca.setAttribute("aria-label", T.trocaRotulo);
    troca.title = T.trocaRotulo;

    var grupo = $("seg-regiao");
    var legenda = grupo.querySelector("legend");
    grupo.replaceChildren(legenda);
    T.regioes.forEach(function (r) {
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "regiao";
      input.id = "r-" + r.valor;
      input.value = r.valor;
      var label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = r.rotulo;
      grupo.append(input, label);
    });
  }

  function aplicarAjustes() {
    el.jogo.setAttribute("data-modo-dificil", estado.ajustes.dificil && !emDiario() ? "sim" : "nao");
    // O diário é igual para todo mundo: sem escolha de região nem modo difícil.
    $("seg-regiao").disabled = emDiario();
    el.dificil.disabled = emDiario();
    el.dificil.checked = estado.ajustes.dificil;
    var marcado = el.ajustes.querySelector('input[name="regiao"][value="' + estado.ajustes.regiao + '"]');
    if (marcado) marcado.checked = true;
    var modo = el.ajustes.querySelector('input[name="modo"][value="' + estado.ajustes.modo + '"]');
    if (modo) modo.checked = true;
    el.jogo.setAttribute("data-modo", estado.ajustes.modo);
    el.placarVidas.hidden = !emSobrevivencia();
    el.placarTempo.hidden = !emRelogio();
    el.rotuloSequencia.textContent = emSobrevivencia() || emRelogio() ? "Acertos" : emDiario() ? "Dias seguidos" : "Sequência";
  }

  // Começa uma corrida nova da sobrevivência (ou zera o placar ao trocar de modo).
  function iniciarCorrida() {
    el.compartilhar.hidden = true;
    el.proxima.hidden = false;
    pararRelogio();
    estado.tempo = TEMPO_RELOGIO;
    estado.relogioAndando = false;
    estado.vidas = VIDAS_SOBREVIVENCIA;
    estado.fimDeJogo = false;
    estado.primeiraDaCorrida = true;
    estado.pontos = 0;
    estado.sequencia = 0;
    estado.recorde = lerRecorde();
    if (emDiario()) {
      var d = lerDiario();
      estado.sequencia = sequenciaDiariaValida(d);
      estado.recorde = d.recorde || 0;
    }
    el.proxima.textContent = T.proxima;
    atualizarPlacar();
  }

  function mudarAjustes() {
    var regiao = el.ajustes.querySelector('input[name="regiao"]:checked');
    var modo = el.ajustes.querySelector('input[name="modo"]:checked');
    var modoAntes = estado.ajustes.modo;
    estado.ajustes.regiao = regiao ? regiao.value : "mundo";
    estado.ajustes.dificil = el.dificil.checked;
    estado.ajustes.modo = modo ? modo.value : "classico";
    salvarAjustes();
    aplicarAjustes();
    // Na sobrevivência qualquer mudança começa uma corrida nova; trocar de modo também zera o placar.
    if (estado.ajustes.modo !== "classico" || modoAntes !== estado.ajustes.modo) iniciarCorrida();
    if (!estado.paises.length) return;
    montarPool();
    novaRodada();
  }

  function carregarPaises() {
    setEstado("carregando");
    el.falha.hidden = true;
    el.fim.hidden = true;
    el.form.hidden = false;
    falar("carregando", null, "neutro");
    travarForm(true);

    var controle = "AbortController" in window ? new AbortController() : null;
    var tempo = setTimeout(function () { if (controle) controle.abort(); }, 12000);

    fetch(T.dados, controle ? { signal: controle.signal } : undefined)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (dados) {
        clearTimeout(tempo);
        if (TEMA === "futebol") prepararClubes(dados); else prepararPaises(dados);
        if (!estado.pool.length) throw new Error("lista vazia");
        novaRodada();
      })
      .catch(function () {
        clearTimeout(tempo);
        mostrarFalha();
      });
  }

  function mostrarFalha() {
    setEstado("falha");
    el.form.hidden = true;
    el.fim.hidden = true;
    el.falha.hidden = false;
    falar("falha", null, "desdem");
  }

  /* ---------- rodada ---------- */

  // Na sobrevivência, só os países mais populosos no começo; a lista cresce a cada acerto.
  function poolDaVez() {
    if (!emSobrevivencia()) return estado.pool;
    var ordenados = estado.pool.slice().sort(function (a, b) { return b.populacao - a.populacao; });
    var fatia = Math.min(1, FAMA_INICIAL + FAMA_POR_ACERTO * estado.sequencia);
    var quantos = Math.max(FAMA_MINIMO, Math.ceil(ordenados.length * fatia));
    return ordenados.slice(0, quantos);
  }

  function escolherAlvo() {
    var pool = poolDaVez();
    var candidatos = pool.filter(function (p) { return estado.recentes.indexOf(p.codigo) === -1; });
    if (!candidatos.length) candidatos = pool;
    var alvo = sortear(candidatos);
    estado.recentes.push(alvo.codigo);
    if (estado.recentes.length > Math.min(30, Math.floor(estado.pool.length / 2))) estado.recentes.shift();
    return alvo;
  }

  function novaRodada(tentativa) {
    tentativa = tentativa || 0;
    pararRevelacao();
    if (emDiario()) {
      var jogado = lerDiario().jogos[dataHoje()];
      if (jogado) { mostrarDiarioJogado(jogado); return; }
    }
    var alvo = emDiario() ? alvoDoDia() : escolherAlvo();

    estado.alvo = alvo;
    estado.ordem = emDiario() ? embaralhar([1, 2, 3, 4, 5, 6], geradorDoDia("ordem")) : embaralhar([1, 2, 3, 4, 5, 6]);
    estado.marcas = [];
    estado.abertas = 0;
    estado.chutes = [];
    estado.encerrada = false;

    setEstado("carregando");
    fecharPecas();
    el.img.hidden = true;
    el.img.alt = "";
    el.chutes.replaceChildren();
    el.chutesVazio.hidden = false;
    el.fim.hidden = true;
    el.falha.hidden = true;
    el.form.hidden = false;
    el.campo.value = "";
    limparAviso();
    esconderSugestoes();
    atualizarProgresso();
    travarForm(true);

    // A bandeira só aparece depois que ela carregou E passou o tempo de espera,
    // assim os quadrados já estão no lugar e ninguém vê a resposta antes da hora.
    var carregou = false, esperou = false;
    function comecar() {
      if (!carregou || !esperou || estado.alvo !== alvo) return;
      var w = el.img.naturalWidth || 3, h = el.img.naturalHeight || 2;
      if (alvo.proporcao) { w = alvo.proporcao[0]; h = alvo.proporcao[1]; }
      el.quadro.style.setProperty("--proporcao", w + " / " + h);
      el.img.hidden = false;
      setEstado("jogando");
      abrirProxima();
      travarForm(false);
      var abertura = "inicio";
      if (emSobrevivencia() && estado.primeiraDaCorrida) abertura = "sobrevivencia_inicio";
      else if (emRelogio() && estado.primeiraDaCorrida) abertura = "relogio_inicio";
      else if (emDiario()) abertura = "diario_inicio";
      else if (estado.ajustes.dificil) abertura = "inicio_dificil";
      estado.primeiraDaCorrida = false;
      falar(abertura, { pais: alvo.nome, vidas: estado.vidas }, "neutro", "inicio");
      el.campo.focus({ preventScroll: true });
      if (emRelogio()) {
        ligarRelogio();
        estado.revelacao = setInterval(revelarSozinho, REVELAR_A_CADA);
      }
    }
    setTimeout(function () { esperou = true; comecar(); }, emRelogio() ? ESPERA_RELOGIO : ESPERA_BANDEIRA);
    el.img.onload = function () { carregou = true; comecar(); };
    el.img.onerror = function () {
      if (estado.alvo !== alvo) return;
      if (tentativa < 3) novaRodada(tentativa + 1); else mostrarFalha();
    };
    if (TEMA === "futebol") {
      el.img.removeAttribute("srcset");
      el.img.src = "escudos/" + alvo.codigo + ".svg";
    } else {
      el.img.srcset = CDN_BANDEIRAS + "w1280/" + alvo.codigo + ".png 2x";
      el.img.src = CDN_BANDEIRAS + "w640/" + alvo.codigo + ".png";
    }
  }

  // Fecha os quadrados na hora, sem animação, para não deixar a bandeira aparecer.
  function fecharPecas() {
    el.pecas.classList.add("sem-animacao");
    Array.prototype.forEach.call(el.pecas.children, function (p) { p.classList.remove("is-aberta"); });
    void el.pecas.offsetWidth;
    el.pecas.classList.remove("sem-animacao");
  }

  function abrirProxima() {
    if (estado.abertas >= TOTAL_PECAS) return;
    var numero = estado.ordem[estado.abertas];
    var peca = el.pecas.querySelector('[data-peca="' + numero + '"]');
    if (peca) peca.classList.add("is-aberta");
    estado.abertas++;
    atualizarProgresso();
  }

  function abrirTodas() {
    while (estado.abertas < TOTAL_PECAS) abrirProxima();
  }

  function valorAtual() {
    if (!estado.abertas) return 0;
    var base = (TOTAL_PECAS + 1 - estado.abertas) * PONTOS_POR_PECA;
    return estado.ajustes.dificil && !emDiario() ? base * MULTIPLICADOR_DIFICIL : base;
  }

  function atualizarProgresso() {
    el.reveladas.textContent = estado.abertas;
    el.valor.textContent = estado.encerrada ? 0 : valorAtual();
  }

  function atualizarPlacar() {
    el.pontos.textContent = estado.pontos;
    el.sequencia.textContent = estado.sequencia;
    el.recorde.textContent = estado.recorde;
    el.vidas.textContent = estado.vidas;
    el.tempo.textContent = estado.tempo;
  }

  function travarForm(travar) {
    el.campo.disabled = travar;
    el.botao.disabled = travar;
    el.desisto.disabled = travar;
    el.botaoLista.disabled = travar;
  }

  function limparAviso() {
    el.aviso.textContent = "";
    el.campo.removeAttribute("aria-invalid");
  }

  function registrarChute(pais, certo, dica) {
    var li = document.createElement("li");
    if (certo) li.className = "is-certo";
    var nome = document.createElement("span");
    nome.className = "chute__nome";
    nome.textContent = pais.nome;
    li.appendChild(nome);

    if (certo || !dica) {
      var res = document.createElement("span");
      res.className = "resultado";
      res.textContent = certo ? "acertou" : "errou";
      li.appendChild(res);
    } else {
      var km = document.createElement("span");
      km.className = "chute__km num";
      km.textContent = dica.texto;
      var seta = document.createElement("span");
      seta.className = "chute__seta";
      seta.appendChild(criarSeta(dica.rumo));
      var detalhe = document.createElement("span");
      detalhe.className = "chute__detalhe";
      detalhe.textContent = "Fica " + dica.direcao + " daqui. " + dica.proximidade + "% de proximidade.";
      var barra = document.createElement("span");
      barra.className = "chute__barra";
      barra.setAttribute("aria-hidden", "true");
      barra.style.setProperty("--perto", dica.proximidade / 100);
      li.classList.add("tem-dica");
      li.append(km, seta, detalhe, barra);
    }
    el.chutes.appendChild(li);
    el.chutesVazio.hidden = true;
  }

  /* ---------- sugestões ao apertar Enter ---------- */

  var MAX_SUGESTOES = 6;

  function buscarSugestoes(chave, limite) {
    var achados = [];
    estado.paises.forEach(function (p) {
      var melhor = -1;
      p.nomes.forEach(function (n) {
        var nome = normalizar(n);
        if (!nome) return;
        var pos = nome.indexOf(chave);
        if (pos === -1) return;
        var nota = pos === 0 ? 2 : (nome.indexOf(" " + chave) !== -1 ? 1 : 0);
        if (nota > melhor) melhor = nota;
      });
      if (melhor >= 0) achados.push({ pais: p, nota: melhor });
    });
    achados.sort(function (a, b) {
      return b.nota - a.nota || a.pais.nome.localeCompare(b.pais.nome, "pt");
    });
    return achados.slice(0, limite || MAX_SUGESTOES).map(function (a) { return a.pais; });
  }

  function mostrarSugestoes(paises, titulo) {
    el.sugestoesTitulo.textContent = titulo || "Você quis dizer";
    var frag = document.createDocumentFragment();
    paises.forEach(function (p) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sugestao";
      b.textContent = p.nome;
      b.addEventListener("click", function () {
        esconderSugestoes();
        el.campo.value = "";
        processarChute(p);
      });
      li.appendChild(b);
      frag.appendChild(li);
    });
    el.sugestoesLista.replaceChildren(frag);
    el.sugestoesLista.scrollTop = 0;
    el.sugestoes.hidden = false;
    el.botaoLista.setAttribute("aria-expanded", "true");
  }

  // A seta abre a lista de todos os países (filtrada pelo que já foi digitado).
  function alternarLista() {
    if (!el.sugestoes.hidden && el.botaoLista.getAttribute("aria-expanded") === "true") {
      esconderSugestoes();
      el.campo.focus();
      return;
    }
    var chave = normalizar(el.campo.value);
    var todos = chave ? buscarSugestoes(chave, Infinity) : estado.paises.slice()
      .sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt"); });
    if (!todos.length) {
      falar("nao_existe", { chute: el.campo.value.trim() }, "desdem");
      return;
    }
    mostrarSugestoes(todos, chave ? T.listaFiltrada : T.listaTodos);
    var primeiro = el.sugestoesLista.querySelector(".sugestao");
    if (primeiro) primeiro.focus();
  }

  function esconderSugestoes() {
    el.sugestoes.hidden = true;
    el.sugestoesLista.replaceChildren();
    el.botaoLista.setAttribute("aria-expanded", "false");
  }

  function moverNasSugestoes(evento) {
    if (el.sugestoes.hidden) {
      // Seta para baixo no campo também abre a lista de países.
      if (evento.key === "ArrowDown" && evento.target === el.campo && !el.botaoLista.disabled) {
        evento.preventDefault();
        alternarLista();
      }
      return;
    }
    var botoes = Array.prototype.slice.call(el.sugestoesLista.querySelectorAll(".sugestao"));
    if (!botoes.length) return;
    var atual = botoes.indexOf(document.activeElement);
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      botoes[Math.min(atual + 1, botoes.length - 1)].focus();
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      if (atual <= 0) el.campo.focus(); else botoes[atual - 1].focus();
    } else if (evento.key === "Escape") {
      esconderSugestoes();
      el.campo.focus();
    }
  }

  function chutar(evento) {
    evento.preventDefault();
    if (estado.encerrada) return;

    var texto = el.campo.value.trim();
    if (!texto) {
      el.aviso.textContent = T.digiteNome;
      el.campo.setAttribute("aria-invalid", "true");
      el.campo.focus();
      return;
    }
    limparAviso();

    var chave = normalizar(texto);
    var pais = estado.indice.get(chave);
    if (!pais) {
      var parecidos = chave ? buscarSugestoes(chave) : [];
      if (parecidos.length) {
        mostrarSugestoes(parecidos);
        falar("sugestoes", { chute: texto }, "desdem");
      } else {
        esconderSugestoes();
        falar("nao_existe", { chute: texto }, "desdem");
        el.campo.select();
      }
      return;
    }
    esconderSugestoes();
    el.campo.value = "";
    processarChute(pais);
  }

  function processarChute(pais) {
    if (estado.encerrada) return;
    if (estado.chutes.indexOf(pais.codigo) !== -1) {
      falar("repetido", { chute: pais.nome }, "desdem");
      el.campo.select();
      return;
    }

    estado.chutes.push(pais.codigo);

    if (pais.codigo === estado.alvo.codigo) {
      estado.marcas.push(true);
      registrarChute(pais, true);
      vencer();
      return;
    }

    var dica = calcularPista(pais, estado.alvo);
    registrarChute(pais, false, dica);
    estado.marcas.push(false);
    if (estado.abertas >= TOTAL_PECAS) {
      perder("derrota", "zoando");
      return;
    }
    // No relógio os pedaços abrem sozinhos; chute errado não abre mais um.
    if (!emRelogio()) abrirProxima();
    var dados = { chute: pais.nome, pais: estado.alvo.nome };
    var categoria = "erro";
    if (dica) {
      dados.distancia = dica.texto;
      dados.direcao = dica.direcao;
      dados.proximidade = dica.proximidade + "%";
      categoria = dica.km < DISTANCIA_PERTO ? "erro_perto" : dica.km > DISTANCIA_LONGE ? "erro_longe" : "erro";
      if (!M[categoria] || !M[categoria].length) categoria = "erro";
    }
    falar(categoria, dados, "zoando");
    el.campo.focus();
  }

  /* ---------- dica de direção e distância ---------- */

  var DISTANCIA_PERTO = 1500;   // km: abaixo disso o jacaré fala que está perto
  var DISTANCIA_LONGE = 9000;   // km: acima disso o jacaré fala que está longe
  var MEIA_VOLTA_TERRA = 20015; // km: a maior distância possível entre dois pontos
  var DIRECOES = [
    { nome: "norte", com: "ao norte" }, { nome: "nordeste", com: "a nordeste" },
    { nome: "leste", com: "a leste" }, { nome: "sudeste", com: "a sudeste" },
    { nome: "sul", com: "ao sul" }, { nome: "sudoeste", com: "a sudoeste" },
    { nome: "oeste", com: "a oeste" }, { nome: "noroeste", com: "a noroeste" },
  ];

  function radianos(g) { return g * Math.PI / 180; }

  // Distância e rumo do país chutado até o país certo, usando o centro de cada país.
  function calcularPista(de, para) {
    if (!de.latlng || !para.latlng || de.latlng.length < 2 || para.latlng.length < 2) return null;
    var f1 = radianos(de.latlng[0]), f2 = radianos(para.latlng[0]);
    var dl = radianos(para.latlng[1] - de.latlng[1]);
    var df = f2 - f1;
    var a = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    var km = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
    // Direção como no mapa-múndi tradicional (Américas à esquerda, Ásia à direita),
    // não pela curva do globo nem dando a volta pelo Pacífico, para a seta bater
    // com o mapa que o jogador tem na cabeça. A distância continua sendo a real.
    var dlMapa = dl;
    var dPsi = Math.log(Math.tan(Math.PI / 4 + f2 / 2) / Math.tan(Math.PI / 4 + f1 / 2));
    var rumo = (Math.atan2(dlMapa, dPsi) * 180 / Math.PI + 360) % 360;
    var dir = DIRECOES[Math.round(rumo / 45) % 8];
    var redondo = km < 100 ? Math.round(km) : Math.round(km / 10) * 10;
    return {
      km: km,
      rumo: rumo,
      nomeDirecao: dir.nome,
      direcao: dir.com,
      texto: redondo.toLocaleString("pt-BR") + " km",
      proximidade: Math.max(0, Math.round((1 - km / MEIA_VOLTA_TERRA) * 100)),
    };
  }

  function criarSeta(rumo) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "seta-rumo");
    var g = document.createElementNS(ns, "g");
    g.setAttribute("transform", "rotate(" + rumo.toFixed(0) + " 12 12)");
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", "M12 3 L19 12 H14.5 V21 H9.5 V12 H5 Z");
    g.appendChild(p);
    svg.appendChild(g);
    return svg;
  }

  function vencer() {
    var pedacos = estado.abertas;
    var ganho = valorAtual();
    estado.pontos += ganho;
    if (emDiario()) registrarDiario(true, pedacos);
    else estado.sequencia++;
    if (!emRelogio() && !emDiario() && estado.sequencia > estado.recorde) {
      estado.recorde = estado.sequencia;
      salvarRecorde(estado.recorde);
    }
    var categoria = pedacos === 1 ? "acerto_genio" : pedacos <= 3 ? "acerto_bom" : "acerto_sofrido";
    falar(categoria, { pais: estado.alvo.nome, pedacos: pedacos, pontos: ganho }, "chocado");
    estado.ganhoRodada = ganho;
    if (emRelogio()) { seguirNoRelogio(); return; }
    encerrar(
      "Acertou, é",
      "Com " + pedacos + (pedacos === 1 ? " pedaço" : " pedaços") + " à mostra. Mais " + ganho + " pontos."
    );
    perguntarCapital();
    if (emDiario()) mostrarCompartilhar();
  }

  function perder(categoria, humor) {
    if (emDiario()) {
      registrarDiario(false, estado.abertas);
      falar(categoria, { pais: estado.alvo.nome }, humor);
      encerrar("Hoje era", "Não foi dessa vez. Amanhã tem outra.");
      mostrarCompartilhar();
      return;
    }
    if (emRelogio()) {
      falar("relogio_pulou", { pais: estado.alvo.nome }, humor, categoria);
      seguirNoRelogio();
      return;
    }
    if (emSobrevivencia()) {
      estado.vidas--;
      if (estado.vidas <= 0) {
        estado.fimDeJogo = true;
        falar("fim_de_jogo", { pais: estado.alvo.nome, acertos: estado.sequencia, pontos: estado.pontos }, "zoando", categoria);
        encerrar("Fim de jogo. Era",
          "Você acertou " + estado.sequencia + (estado.sequencia === 1 ? " " + T.item : " " + T.itens) +
          " e fez " + estado.pontos + " pontos.");
        el.proxima.textContent = "Jogar de novo";
        return;
      }
      falar("perdeu_vida", { pais: estado.alvo.nome, vidas: estado.vidas }, humor, categoria);
      encerrar("Era", "Você perdeu uma vida. " + (estado.vidas === 1 ? "Resta 1." : "Restam " + estado.vidas + "."));
      return;
    }
    estado.sequencia = 0;
    falar(categoria, { pais: estado.alvo.nome }, humor);
    encerrar("Era", "Sem pontos nesta rodada. A sequência voltou para zero.");
  }

  /* ---------- contra o relógio ---------- */

  function ligarRelogio() {
    if (estado.relogioAndando || estado.fimDeJogo) return;
    estado.relogioAndando = true;
    var fim = Date.now() + estado.tempo * 1000;
    estado.cronometro = setInterval(function () {
      estado.tempo = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
      el.tempo.textContent = estado.tempo;
      if (estado.tempo <= 0) tempoEsgotado();
    }, 200);
  }

  function pararRelogio() {
    clearInterval(estado.cronometro);
    pararRevelacao();
    estado.relogioAndando = false;
  }

  function pararRevelacao() { clearInterval(estado.revelacao); }

  // A cada intervalo abre mais um pedaço; com os seis abertos, a próxima passada pula a bandeira.
  function revelarSozinho() {
    if (estado.encerrada) return;
    if (estado.abertas < TOTAL_PECAS) { abrirProxima(); return; }
    perder("relogio_pulou", "zoando");
  }

  // Mostra a resposta por um instante e segue para a próxima, sem tela de fim de rodada.
  function seguirNoRelogio() {
    pararRevelacao();
    estado.encerrada = true;
    setEstado("pausa");
    abrirTodas();
    atualizarProgresso();
    atualizarPlacar();
    travarForm(true);
    el.img.alt = T.alt + estado.alvo.nome;
    var rodada = estado.alvo;
    setTimeout(function () {
      if (estado.fimDeJogo || !emRelogio() || estado.alvo !== rodada) return;
      novaRodada();
    }, PAUSA_ENTRE_RODADAS);
  }

  function tempoEsgotado() {
    pararRelogio();
    estado.fimDeJogo = true;
    el.tempo.textContent = 0;
    if (estado.pontos > estado.recorde) {
      estado.recorde = estado.pontos;
      salvarRecorde(estado.recorde);
    }
    falar("relogio_fim", { acertos: estado.sequencia, pontos: estado.pontos, pais: estado.alvo ? estado.alvo.nome : "" }, "zoando", "fim_de_jogo");
    encerrar("Tempo esgotado. A última era",
      "Você acertou " + estado.sequencia + (estado.sequencia === 1 ? " " + T.item : " " + T.itens) +
      " e fez " + estado.pontos + " pontos em " + TEMPO_RELOGIO + " segundos.");
    el.proxima.textContent = "Jogar de novo";
  }

  /* ---------- diário ---------- */

  var CHAVE_DIARIO = T.prefixo + ".diario";

  // Data no horário de Brasília, para o dia virar igual para todo mundo aqui.
  function dataHoje() {
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function diaAnterior(data) {
    var d = new Date(data + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  function dataBonita(data) { var p = data.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }

  // Gerador de números com semente: o mesmo dia dá o mesmo sorteio em qualquer aparelho.
  function geradorDoDia(extra) {
    var texto = "flagx-" + TEMA + "-" + dataHoje() + "-" + (extra || "");
    var h = 2166136261;
    for (var i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
    var semente = h >>> 0;
    return function () {
      semente = (semente + 0x6D2B79F5) | 0;
      var t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function alvoDoDia() {
    var lista = estado.pool.slice().sort(function (a, b) { return a.codigo < b.codigo ? -1 : 1; });
    return lista[Math.floor(geradorDoDia("alvo")() * lista.length)];
  }

  function lerDiario() {
    var vazio = { jogos: {}, sequencia: 0, recorde: 0, ultimaVitoria: null };
    try {
      var d = JSON.parse(localStorage.getItem(CHAVE_DIARIO) || "null");
      if (d && d.jogos) return d;
    } catch (e) { /* sem armazenamento */ }
    return vazio;
  }

  // A sequência só vale se a última vitória foi hoje ou ontem.
  function sequenciaDiariaValida(d) {
    var hoje = dataHoje();
    return d.ultimaVitoria === hoje || d.ultimaVitoria === diaAnterior(hoje) ? d.sequencia || 0 : 0;
  }

  function registrarDiario(acertou, pedacos) {
    var d = lerDiario();
    var hoje = dataHoje();
    if (acertou) {
      d.sequencia = d.ultimaVitoria === diaAnterior(hoje) ? (d.sequencia || 0) + 1 : 1;
      d.ultimaVitoria = hoje;
      d.recorde = Math.max(d.recorde || 0, d.sequencia);
    } else {
      d.sequencia = 0;
    }
    d.jogos[hoje] = { acertou: acertou, pedacos: pedacos, marcas: estado.marcas.slice(), codigo: estado.alvo.codigo, pontos: estado.pontos };
    // guarda só os últimos 30 dias
    Object.keys(d.jogos).sort().slice(0, -30).forEach(function (k) { delete d.jogos[k]; });
    try { localStorage.setItem(CHAVE_DIARIO, JSON.stringify(d)); } catch (e) { /* segue sem salvar */ }
    estado.sequencia = d.sequencia;
    estado.recorde = d.recorde || 0;
    atualizarPlacar();
  }

  function textoDoResultado(jogo) {
    var quadrados = jogo.marcas.map(function (ok) { return ok ? "🟩" : "🟥"; }).join("");
    var linha = jogo.acertou
      ? "Acertei com " + jogo.pedacos + " de 6 pedaços."
      : "Não acertei hoje.";
    var endereco = location.origin + location.pathname + (TEMA === "futebol" ? "?tema=futebol" : "");
    return (TEMA === "futebol" ? "Flagx Futebol" : "Flagx") + " Diário " + dataBonita(dataHoje()) + "\n" +
      (quadrados ? quadrados + "\n" : "") + linha + "\n" + endereco;
  }

  function mostrarCompartilhar() {
    el.proxima.hidden = true;
    el.compartilhar.hidden = false;
    el.compartilharAviso.textContent = "Volte amanhã para " + (TEMA === "futebol" ? "um novo escudo." : "uma nova bandeira.");
  }

  // Já jogou hoje: mostra o resultado salvo em vez de uma rodada nova.
  function mostrarDiarioJogado(jogo) {
    var alvo = estado.paises.filter(function (p) { return p.codigo === jogo.codigo; })[0];
    if (!alvo) return;
    estado.alvo = alvo;
    estado.marcas = jogo.marcas || [];
    estado.pontos = jogo.pontos || 0;
    estado.encerrada = true;
    el.chutes.replaceChildren();
    el.chutesVazio.hidden = false;
    estado.abertas = 0;
    estado.ordem = [1, 2, 3, 4, 5, 6];
    el.img.hidden = true;
    el.img.onload = function () {
      var w = el.img.naturalWidth || 3, h = el.img.naturalHeight || 2;
      if (alvo.proporcao) { w = alvo.proporcao[0]; h = alvo.proporcao[1]; }
      el.quadro.style.setProperty("--proporcao", w + " / " + h);
      el.img.hidden = false;
    };
    el.img.onerror = null;
    if (TEMA === "futebol") { el.img.removeAttribute("srcset"); el.img.src = "escudos/" + alvo.codigo + ".svg"; }
    else { el.img.srcset = CDN_BANDEIRAS + "w1280/" + alvo.codigo + ".png 2x"; el.img.src = CDN_BANDEIRAS + "w640/" + alvo.codigo + ".png"; }
    falar("diario_jogado", { pais: alvo.nome }, "desdem", "inicio");
    encerrar(jogo.acertou ? "Hoje você acertou, era" : "Hoje era",
      jogo.acertou ? "Com " + jogo.pedacos + (jogo.pedacos === 1 ? " pedaço" : " pedaços") + " à mostra." : "Não foi dessa vez.");
    mostrarCompartilhar();
  }

  function copiarResultado() {
    var jogo = lerDiario().jogos[dataHoje()];
    if (!jogo) return;
    var texto = textoDoResultado(jogo);
    function ok() { el.compartilharAviso.textContent = "Resultado copiado. É só colar onde quiser."; }
    function manual() {
      var area = document.createElement("textarea");
      area.value = texto;
      area.setAttribute("readonly", "");
      area.className = "visually-hidden";
      document.body.appendChild(area);
      area.select();
      var deu = false;
      try { deu = document.execCommand("copy"); } catch (e) { deu = false; }
      area.remove();
      if (deu) ok(); else el.compartilharAviso.textContent = texto;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(ok, manual);
    else manual();
  }

  /* ---------- bônus da capital ---------- */

  function perguntarCapital() {
    var capitais = estado.alvo.capitais || [];
    if (!capitais.length) return;
    estado.capitalRespondida = false;
    el.capitalPergunta.textContent = T.bonus;
    el.campoCapital.value = "";
    el.campoCapital.disabled = false;
    el.botaoCapital.disabled = false;
    el.campoCapital.removeAttribute("aria-invalid");
    el.capitalResultado.textContent = "";
    el.capitalResultado.className = "capital__resultado";
    el.formCapital.hidden = false;
    el.campoCapital.focus({ preventScroll: true });
  }

  function responderCapital(evento) {
    evento.preventDefault();
    if (estado.capitalRespondida) return;
    var texto = el.campoCapital.value.trim();
    if (!texto) {
      el.capitalResultado.textContent = "Digite o nome de uma cidade, ou siga para a próxima.";
      el.campoCapital.setAttribute("aria-invalid", "true");
      el.campoCapital.focus();
      return;
    }
    var capitais = estado.alvo.capitais;
    var certa = capitais.some(function (c) { return normalizar(c) === normalizar(texto); });
    estado.capitalRespondida = true;
    el.campoCapital.disabled = true;
    el.botaoCapital.disabled = true;
    el.campoCapital.removeAttribute("aria-invalid");
    var dados = { pais: estado.alvo.nome, capital: capitais[0], chute: texto };
    if (certa) {
      var bonus = Math.round(estado.ganhoRodada * BONUS_CAPITAL);
      dados.pontos = bonus;
      estado.pontos += bonus;
      atualizarPlacar();
      el.capitalResultado.textContent = T.bonusCerto.replace("{r}", capitais[0]).replace("{p}", bonus);
      el.capitalResultado.className = "capital__resultado is-certo";
      falar("capital_certa", dados, "chocado");
    } else {
      el.capitalResultado.textContent = T.bonusErrado.replace("{r}", capitais[0]);
      el.capitalResultado.className = "capital__resultado is-errado";
      falar("capital_errada", dados, "zoando");
    }
    el.proxima.focus();
  }

  function encerrar(rotulo, placar) {
    estado.encerrada = true;
    abrirTodas();
    atualizarProgresso();
    atualizarPlacar();
    travarForm(true);
    el.img.alt = T.alt + estado.alvo.nome;
    el.form.hidden = true;
    el.fimRotulo.textContent = rotulo;
    el.fimPais.textContent = estado.alvo.nome;
    el.fimPlacar.textContent = placar;
    el.formCapital.hidden = true;
    el.fim.hidden = false;
    setEstado("fim");
    el.fimPais.focus({ preventScroll: true });
  }

  /* ---------- eventos ---------- */

  el.form.addEventListener("submit", chutar);
  el.campo.addEventListener("input", function () { limparAviso(); esconderSugestoes(); });
  el.form.addEventListener("keydown", moverNasSugestoes);
  el.botaoLista.addEventListener("click", alternarLista);
  el.desisto.addEventListener("click", function () {
    if (!estado.encerrada) perder("desistiu", "desdem");
  });
  el.proxima.addEventListener("click", function () {
    if (estado.fimDeJogo) iniciarCorrida();
    novaRodada();
  });
  el.formCapital.addEventListener("submit", responderCapital);
  el.compartilhar.addEventListener("click", copiarResultado);
  el.campoCapital.addEventListener("input", function () {
    el.campoCapital.removeAttribute("aria-invalid");
    if (!estado.capitalRespondida) el.capitalResultado.textContent = "";
  });
  el.tentar.addEventListener("click", carregarPaises);

  el.ajustes.addEventListener("change", mudarAjustes);

  aplicarTema();
  aplicarAjustes();
  iniciarCorrida();
  carregarPaises();
})();
