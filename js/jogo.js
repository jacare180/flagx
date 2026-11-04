/* Flagx: modo clássico, mundo todo. */
(function () {
  "use strict";

  var API_PAISES = "https://restcountries.com/v3.1/all?fields=name,translations,cca2,region,latlng,independent,altSpellings";
  var CDN_BANDEIRAS = "https://flagcdn.com/";
  var PONTOS_POR_PECA = 20;
  var TOTAL_PECAS = 6;
  var CHAVE_RECORDE = "flagx.recorde";

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
  };

  var M = window.FLAGX_MENSAGENS || {};
  var $ = function (id) { return document.getElementById(id); };

  var el = {
    jogo: $("jogo"), img: $("bandeira"), quadro: $("quadro"), pecas: $("pecas"),
    reveladas: $("reveladas"), valor: $("valor"), croc: $("croc"), fala: $("fala"),
    form: $("form-chute"), campo: $("campo-chute"), botao: $("botao-chute"), aviso: $("aviso-chute"),
    lista: $("lista-paises"), desisto: $("botao-desisto"),
    fim: $("fim"), fimRotulo: $("fim-rotulo"), fimPais: $("fim-pais"), fimPlacar: $("fim-placar"), proxima: $("botao-proxima"),
    falha: $("falha"), tentar: $("botao-tentar"),
    chutes: $("lista-chutes"), chutesVazio: $("chutes-vazio"),
    pontos: $("pontos"), sequencia: $("sequencia"), recorde: $("recorde"),
  };

  var estado = {
    paises: [], pool: [], indice: new Map(), recentes: [],
    alvo: null, ordem: [], abertas: 0, chutes: [], encerrada: true,
    pontos: 0, sequencia: 0, recorde: lerRecorde(), ultimaFala: {},
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
    estado.pool = paises.filter(function (p) { return p.independente; });

    var nomes = paises.map(function (p) { return p.nome; })
      .sort(function (a, b) { return a.localeCompare(b, "pt"); });
    var frag = document.createDocumentFragment();
    nomes.forEach(function (n) {
      var op = document.createElement("option");
      op.value = n;
      frag.appendChild(op);
    });
    el.lista.replaceChildren(frag);
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
    atualizarProgresso();
    travarForm(true);

    el.img.onload = function () {
      if (estado.alvo !== alvo) return;
      var w = el.img.naturalWidth || 3, h = el.img.naturalHeight || 2;
      el.quadro.style.setProperty("--proporcao", w + " / " + h);
      el.img.hidden = false;
      setEstado("jogando");
      abrirProxima();
      travarForm(false);
      falar("inicio", { pais: alvo.nome }, "neutro");
      el.campo.focus({ preventScroll: true });
    };
    el.img.onerror = function () {
      if (estado.alvo !== alvo) return;
      if (tentativa < 3) novaRodada(tentativa + 1); else mostrarFalha();
    };
    el.img.srcset = CDN_BANDEIRAS + "w1280/" + alvo.codigo + ".png 2x";
    el.img.src = CDN_BANDEIRAS + "w640/" + alvo.codigo + ".png";
  }

  function fecharPecas() {
    Array.prototype.forEach.call(el.pecas.children, function (p) { p.classList.remove("is-aberta"); });
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
    return estado.abertas ? (TOTAL_PECAS + 1 - estado.abertas) * PONTOS_POR_PECA : 0;
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
  }

  function limparAviso() {
    el.aviso.textContent = "";
    el.campo.removeAttribute("aria-invalid");
  }

  function registrarChute(pais, certo) {
    var li = document.createElement("li");
    if (certo) li.className = "is-certo";
    var nome = document.createElement("span");
    nome.textContent = pais.nome;
    var res = document.createElement("span");
    res.className = "resultado";
    res.textContent = certo ? "acertou" : "errou";
    li.append(nome, res);
    el.chutes.appendChild(li);
    el.chutesVazio.hidden = true;
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

    var pais = estado.indice.get(normalizar(texto));
    if (!pais) {
      falar("nao_existe", { chute: texto }, "desdem");
      el.campo.select();
      return;
    }
    if (estado.chutes.indexOf(pais.codigo) !== -1) {
      falar("repetido", { chute: pais.nome }, "desdem");
      el.campo.select();
      return;
    }

    estado.chutes.push(pais.codigo);
    el.campo.value = "";

    if (pais.codigo === estado.alvo.codigo) {
      registrarChute(pais, true);
      vencer();
      return;
    }

    registrarChute(pais, false);
    if (estado.abertas >= TOTAL_PECAS) {
      perder("derrota", "zoando");
      return;
    }
    abrirProxima();
    falar("erro", { chute: pais.nome, pais: estado.alvo.nome }, "zoando");
    el.campo.focus();
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
  el.campo.addEventListener("input", limparAviso);
  el.desisto.addEventListener("click", function () {
    if (!estado.encerrada) perder("desistiu", "desdem");
  });
  el.proxima.addEventListener("click", function () { novaRodada(); });
  el.tentar.addEventListener("click", carregarPaises);

  atualizarPlacar();
  carregarPaises();
})();
