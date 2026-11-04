/* Flagx: modo clássico, com filtro de região e modo difícil. */
(function () {
  "use strict";

  // Dados dos países guardados no próprio jogo (projeto mledoze/countries, licença ODbL).
  // A API REST Countries v3.1 foi desativada, por isso não dependemos mais dela.
  var API_PAISES = "dados/paises.json";
  var CDN_BANDEIRAS = "https://flagcdn.com/";
  var PONTOS_POR_PECA = 20;
  var TOTAL_PECAS = 6;
  var ESPERA_BANDEIRA = 1000; // milissegundos antes de mostrar a bandeira e abrir o primeiro pedaço
  var CHAVE_RECORDE = "flagx.recorde";
  var CHAVE_AJUSTES = "flagx.ajustes";
  var MULTIPLICADOR_DIFICIL = 2;

  // Territórios que usam a bandeira de outro país (impossíveis de acertar). Ficam fora do sorteio.
  var BANDEIRA_REPETIDA = ["hm", "bl", "gp", "gf", "mf", "yt", "re", "pm", "wf", "sh", "um", "bv", "sj", "mq", "nc"];

  // Regiões do jogo. A Antártida só aparece no mundo todo.
  var REGIOES = { mundo: null, africa: "Africa", americas: "Americas", asia: "Asia", europa: "Europe", oceania: "Oceania" };

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

  var M = window.FLAGX_MENSAGENS || {};
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
  };

  var estado = {
    paises: [], pool: [], indice: new Map(), recentes: [],
    alvo: null, ordem: [], abertas: 0, chutes: [], encerrada: true,
    pontos: 0, sequencia: 0, recorde: lerRecorde(), ultimaFala: {},
    ajustes: lerAjustes(),
  };

  /* ---------- utilidades ---------- */

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function sortear(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

  function embaralhar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function preencher(modelo, dados) {
    return modelo.replace(/\{(\w+)\}/g, function (_, chave) {
      return dados && dados[chave] != null ? dados[chave] : "";
    });
  }

  function falar(categoria, dados, humor) {
    var lista = M[categoria] && M[categoria].length ? M[categoria] : [""];
    var frase = sortear(lista);
    if (lista.length > 1) {
      while (frase === estado.ultimaFala[categoria]) frase = sortear(lista);
    }
    estado.ultimaFala[categoria] = frase;
    el.fala.textContent = preencher(frase, dados);
    el.croc.setAttribute("data-humor", humor || "neutro");
  }

  function lerRecorde() {
    try { return parseInt(localStorage.getItem(CHAVE_RECORDE), 10) || 0; } catch (e) { return 0; }
  }

  function salvarRecorde(valor) {
    try { localStorage.setItem(CHAVE_RECORDE, String(valor)); } catch (e) { /* sem armazenamento, segue o jogo */ }
  }

  function lerAjustes() {
    var padrao = { regiao: "mundo", dificil: false };
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE_AJUSTES) || "{}");
      if (salvo && Object.prototype.hasOwnProperty.call(REGIOES, salvo.regiao)) padrao.regiao = salvo.regiao;
      if (salvo && salvo.dificil === true) padrao.dificil = true;
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
        };
      });

    // Países independentes entram primeiro no índice, para ganhar nomes repetidos.
    paises.sort(function (a, b) { return (b.independente ? 1 : 0) - (a.independente ? 1 : 0); });
    var indice = new Map();
    paises.forEach(function (p) {
      p.nomes.forEach(function (n) {
        var chave = normalizar(n);
        if (chave && !indice.has(chave)) indice.set(chave, p);
      });
    });

    estado.paises = paises;
    estado.indice = indice;
    montarPool();
  }

  // Quem pode ser sorteado: países independentes no modo normal; no difícil entram também
  // os territórios com bandeira própria. Depois filtra pela região escolhida.
  function montarPool() {
    var regiao = REGIOES[estado.ajustes.regiao];
    var dificil = estado.ajustes.dificil;
    estado.pool = estado.paises.filter(function (p) {
      if (BANDEIRA_REPETIDA.indexOf(p.codigo) !== -1) return false;
      if (!p.independente && !dificil) return false;
      return regiao ? p.regiao === regiao : true;
    });
    estado.recentes = [];
  }

  function aplicarAjustes() {
    el.jogo.setAttribute("data-modo-dificil", estado.ajustes.dificil ? "sim" : "nao");
    el.dificil.checked = estado.ajustes.dificil;
    var marcado = el.ajustes.querySelector('input[name="regiao"][value="' + estado.ajustes.regiao + '"]');
    if (marcado) marcado.checked = true;
  }

  function mudarAjustes() {
    var regiao = el.ajustes.querySelector('input[name="regiao"]:checked');
    estado.ajustes.regiao = regiao ? regiao.value : "mundo";
    estado.ajustes.dificil = el.dificil.checked;
    salvarAjustes();
    aplicarAjustes();
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

    fetch(API_PAISES, controle ? { signal: controle.signal } : undefined)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (dados) {
        clearTimeout(tempo);
        prepararPaises(dados);
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

  function escolherAlvo() {
    var candidatos = estado.pool.filter(function (p) { return estado.recentes.indexOf(p.codigo) === -1; });
    if (!candidatos.length) candidatos = estado.pool;
    var alvo = sortear(candidatos);
    estado.recentes.push(alvo.codigo);
    if (estado.recentes.length > Math.min(30, Math.floor(estado.pool.length / 2))) estado.recentes.shift();
    return alvo;
  }

  function novaRodada(tentativa) {
    tentativa = tentativa || 0;
    var alvo = escolherAlvo();

    estado.alvo = alvo;
    estado.ordem = embaralhar([1, 2, 3, 4, 5, 6]);
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
      el.quadro.style.setProperty("--proporcao", w + " / " + h);
      el.img.hidden = false;
      setEstado("jogando");
      abrirProxima();
      travarForm(false);
      falar(estado.ajustes.dificil && M.inicio_dificil && M.inicio_dificil.length ? "inicio_dificil" : "inicio", { pais: alvo.nome }, "neutro");
      el.campo.focus({ preventScroll: true });
    }
    setTimeout(function () { esperou = true; comecar(); }, ESPERA_BANDEIRA);
    el.img.onload = function () { carregou = true; comecar(); };
    el.img.onerror = function () {
      if (estado.alvo !== alvo) return;
      if (tentativa < 3) novaRodada(tentativa + 1); else mostrarFalha();
    };
    el.img.srcset = CDN_BANDEIRAS + "w1280/" + alvo.codigo + ".png 2x";
    el.img.src = CDN_BANDEIRAS + "w640/" + alvo.codigo + ".png";
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
    return estado.ajustes.dificil ? base * MULTIPLICADOR_DIFICIL : base;
  }

  function atualizarProgresso() {
    el.reveladas.textContent = estado.abertas;
    el.valor.textContent = estado.encerrada ? 0 : valorAtual();
  }

  function atualizarPlacar() {
    el.pontos.textContent = estado.pontos;
    el.sequencia.textContent = estado.sequencia;
    el.recorde.textContent = estado.recorde;
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
    mostrarSugestoes(todos, chave ? "Países com esse nome" : "Todos os países");
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
      el.aviso.textContent = "Digite o nome de um país.";
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
      registrarChute(pais, true);
      vencer();
      return;
    }

    var dica = calcularPista(pais, estado.alvo);
    registrarChute(pais, false, dica);
    if (estado.abertas >= TOTAL_PECAS) {
      perder("derrota", "zoando");
      return;
    }
    abrirProxima();
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
    estado.sequencia++;
    if (estado.sequencia > estado.recorde) {
      estado.recorde = estado.sequencia;
      salvarRecorde(estado.recorde);
    }
    var categoria = pedacos === 1 ? "acerto_genio" : pedacos <= 3 ? "acerto_bom" : "acerto_sofrido";
    falar(categoria, { pais: estado.alvo.nome, pedacos: pedacos, pontos: ganho }, "chocado");
    encerrar(
      "Acertou, é",
      "Com " + pedacos + (pedacos === 1 ? " pedaço" : " pedaços") + " à mostra. Mais " + ganho + " pontos."
    );
  }

  function perder(categoria, humor) {
    estado.sequencia = 0;
    falar(categoria, { pais: estado.alvo.nome }, humor);
    encerrar("Era", "Sem pontos nesta rodada. A sequência voltou para zero.");
  }

  function encerrar(rotulo, placar) {
    estado.encerrada = true;
    abrirTodas();
    atualizarProgresso();
    atualizarPlacar();
    travarForm(true);
    el.img.alt = "Bandeira de " + estado.alvo.nome;
    el.form.hidden = true;
    el.fimRotulo.textContent = rotulo;
    el.fimPais.textContent = estado.alvo.nome;
    el.fimPlacar.textContent = placar;
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
  el.proxima.addEventListener("click", function () { novaRodada(); });
  el.tentar.addEventListener("click", carregarPaises);

  el.ajustes.addEventListener("change", mudarAjustes);

  aplicarAjustes();
  atualizarPlacar();
  carregarPaises();
})();
