"""
Gera dados/retro.json e baixa os escudos antigos para escudos/retro/, a partir da Escudoteca.

Uso (na pasta do projeto):
    python3 ferramentas/gerar-retro.py

Fonte: Escudoteca, Gazeta dos Brasões do Futebol (https://escudoteca.com/).
Uso combinado por mensagem com a responsável pelo site, para um jogo de incentivo ao estudo,
mantendo o aviso de que os escudos são propriedade dos clubes.
Precisa do Pillow (pip install pillow) para reduzir as imagens.
"""
import io
import json
import os
import urllib.parse
import urllib.request

from PIL import Image

BASE = "https://escudoteca.com/"
RAIZ = os.path.join(os.path.dirname(__file__), "..")
PASTA = os.path.join(RAIZ, "escudos", "retro")
MAX_POR_CLUBE = 6     # versões antigas por clube, espalhadas ao longo da história
LADO_MAX = 800        # pixels

# [estado, id na Escudoteca, id do clube atual em dados/clubes.json]
# A ordem é a "fama", usada na Sobrevivência.
CLUBES = [
    ("rj", "tab-flamengo", "br-flamengo"), ("sp", "tab-corinthians", "br-corinthians"),
    ("sp", "tab-palmeiras", "br-palmeiras"), ("sp", "tab-sao-paulo", "br-sao-paulo"),
    ("rj", "tab-vasco", "br-vasco"), ("sp", "tab-santos", "br-santos"),
    ("rs", "tab-gremio", "br-gremio"), ("rs", "tab-internacional", "br-internacional"),
    ("mg", "tab-atletico-mg", "br-atletico-mg"), ("mg", "tab-cruzeiro", "br-cruzeiro"),
    ("rj", "tab-botafogo", "br-botafogo"), ("rj", "tab-fluminense", "br-fluminense"),
    ("ba", "tab-bahia", "br-bahia"), ("pr", "tab-athletico-pr", "br-athletico-pr"),
    ("ba", "tab-vitoria-ba", "br-vitoria"), ("pr", "tab-coritiba", "br-coritiba"),
    ("sp", "tab-bragantino", "br-bragantino"), ("sc", "tab-chapecoense", "br-chapecoense"),
    ("sp", "tab-mirassol", "br-mirassol"), ("pa", "tab-clube-do-remo", "br-remo"),
    ("ce", "tab-fortaleza-esporte-clube", "br-fortaleza"), ("ce", "tab-ceara-sporting-club", "br-ceara"),
    ("pe", "tab-tab-sport-recife", "br-sport"), ("rs", "tab-juventude", "br-juventude"),
    ("go", "tab-goias-esporte-clube", "br-goias"), ("mt", "tab-cuiaba-esporte-clube", "br-cuiaba"),
    ("sc", "tab-criciuma", "br-criciuma"), ("sc", "tab-avai", "br-avai"),
    ("sc", "tab-figueirense", "br-figueirense"), ("sp", "tab-ponte-preta", "br-ponte-preta"),
    ("sp", "tab-guarani", "br-guarani"), ("pa", "tab-paysandu-sport-club", "br-paysandu"),
    ("pe", "tab-tab-nautico", "br-nautico"), ("pe", "tab-tab-santa-cruz", "br-santa-cruz"),
    ("sp", "tab-portuguesa", "br-portuguesa"),
]


def baixar(caminho):
    url = BASE + urllib.parse.quote(caminho)
    pedido = urllib.request.Request(url, headers={"User-Agent": "flagx-gerador/1.0 (jogo de fã, https://github.com/jacare180/flagx)"})
    with urllib.request.urlopen(pedido, timeout=60) as r:
        return r.read()


def espalhar(lista, n):
    """Escolhe n itens espalhados, sempre com o primeiro e o último."""
    if len(lista) <= n:
        return lista
    passo = (len(lista) - 1) / (n - 1)
    return [lista[round(i * passo)] for i in range(n)]


def main():
    os.makedirs(PASTA, exist_ok=True)
    atuais = {c["id"]: c for c in json.load(open(os.path.join(RAIZ, "dados", "clubes.json"), encoding="utf8"))}
    fichas = {}
    saida = []
    for fama, (uf, id_esc, id_atual) in enumerate(CLUBES, start=1):
        if uf not in fichas:
            fichas[uf] = {c["id"]: c for c in json.loads(baixar("fichas/America/Brasil/dados_%s.json" % uf))}
        ficha = fichas[uf][id_esc]
        atual = atuais[id_atual]
        todas = ficha["escudos"]
        antigas = [e for e in todas if not e.get("atual")]
        for e in espalhar(antigas, MAX_POR_CLUBE):
            indice = todas.index(e) + 1
            nome_arquivo = "%s-%d.webp" % (id_atual[3:], indice)
            img = Image.open(io.BytesIO(baixar(e["img"])))
            img.thumbnail((LADO_MAX, LADO_MAX))
            img.save(os.path.join(PASTA, nome_arquivo), "WEBP", quality=85)
            saida.append({
                "id": "retro-" + nome_arquivo[:-5],
                "arquivo": "retro/" + nome_arquivo,
                "nome": atual["nome"],
                "nomes": atual["nomes"],
                "liga": "retro",
                "pais": "Brasil",
                "latlng": atual["latlng"],
                "cidades": atual["cidades"],
                "fama": fama,
                "proporcao": list(img.size),
                "versao": "%d de %d" % (indice, len(todas)),
                "fundacao": ficha.get("ficha", {}).get("Fundação"),
            })
        print(atual["nome"], len(antigas), "antigas, usei", min(len(antigas), MAX_POR_CLUBE))
    json.dump(saida, open(os.path.join(RAIZ, "dados", "retro.json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
    print("gerado dados/retro.json com", len(saida), "escudos")


if __name__ == "__main__":
    main()
