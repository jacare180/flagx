Flagx
=====

Jogo de adivinhar bandeiras. A bandeira começa coberta por seis pedaços e
cada chute errado revela mais um. O jacaré comenta cada jogada, sem nenhuma educação.

Jogar: https://jacare180.github.io/flagx/

Como funciona
-------------

* **Clássico:** uma bandeira por vez, pontos acumulando. Acertar com 1 pedaço vale 120 pontos e cada pedaço a mais tira 20.
* **Sobrevivência:** 3 vidas. Começa pelos países mais populosos (os mais conhecidos) e a cada acerto entram países menos famosos.
* **Região:** mundo todo, África, Américas, Ásia, Europa ou Oceania.
* **Difícil:** bandeira sem cor e espelhada, com 41 territórios a mais. Pontos em dobro.
* **Dica:** cada chute errado mostra a distância, a direção no mapa-múndi e a proximidade.
* **Capital:** depois de acertar o país, acertar a capital dá 50% de bônus.

Arquivos
--------

* Falas do jacaré: `js/mensagens.js` (pode editar à vontade)
* Lógica do jogo: `js/jogo.js`
* Visual: `css/flagx.css`, feito com a skill Hallmark, tema Overprint
* Ideias para depois: `BACKLOG.md`
* Gerar de novo os dados dos países: `ferramentas/gerar-paises.js` (instruções no topo do arquivo)

Fontes
------

* Bandeiras: [FlagCDN](https://flagcdn.com)
* Países, regiões, coordenadas e capitais: [mledoze/countries](https://github.com/mledoze/countries) (licença ODbL)
* População aproximada, usada só para ordenar a Sobrevivência: [@geobase/countries-data](https://www.npmjs.com/package/@geobase/countries-data) (licença MIT)
* Nomes de capitais em português do Brasil: `ferramentas/capitais-br.json`

Para rodar no computador: `python3 -m http.server` nesta pasta e depois http://localhost:8000
