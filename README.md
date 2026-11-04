Flagx
=====

Jogo de adivinhar bandeiras. A bandeira começa coberta por seis pedaços e
cada chute errado revela mais um. O jacaré comenta cada jogada, sem nenhuma educação.

Jogar: https://jacare180.github.io/flagx/

Escudos de futebol: https://jacare180.github.io/flagx/?tema=futebol (ou o ícone ao lado do nome Flagx, que troca entre as duas páginas)

Como funciona
-------------

* **Clássico:** uma bandeira por vez, pontos acumulando. Acertar com 1 pedaço vale 120 pontos e cada pedaço a mais tira 20.
* **Contra o relógio:** 60 segundos. Os pedaços abrem sozinhos a cada 2,5 segundos e a próxima bandeira entra assim que você acerta. O recorde é a maior pontuação.
* **Sobrevivência:** 3 vidas. Começa pelos países mais populosos (os mais conhecidos) e a cada acerto entram países menos famosos.
* **Região:** mundo todo, África, Américas, Ásia, Europa ou Oceania.
* **Difícil:** bandeira sem cor e espelhada, com 41 territórios a mais. Pontos em dobro.
* **Dica:** cada chute errado mostra a distância, a direção no mapa-múndi e a proximidade.
* **Capital:** depois de acertar o país, acertar a capital dá 50% de bônus.
* **Futebol:** o mesmo jogo com 187 escudos de clubes da Inglaterra, Espanha, Itália, Alemanha, França e Argentina (e alguns do Brasil e de Portugal no "Todos"). A dica mede a distância entre os estádios e o bônus pergunta a cidade do clube.

Arquivos
--------

* Falas do jacaré: `js/mensagens.js` (pode editar à vontade)
* Lógica do jogo: `js/jogo.js`
* Visual: `css/flagx.css`, feito com a skill Hallmark, tema Overprint
* Ideias para depois: `BACKLOG.md`
* Gerar de novo os dados dos países: `ferramentas/gerar-paises.js` (instruções no topo do arquivo)
* Gerar de novo os clubes e copiar os escudos: `ferramentas/gerar-clubes.js` (instruções no topo do arquivo)

Fontes
------

* Bandeiras: [FlagCDN](https://flagcdn.com)
* Países, regiões, coordenadas e capitais: [mledoze/countries](https://github.com/mledoze/countries) (licença ODbL)
* População aproximada, usada só para ordenar a Sobrevivência: [@geobase/countries-data](https://www.npmjs.com/package/@geobase/countries-data) (licença MIT)
* Nomes de capitais em português do Brasil: `ferramentas/capitais-br.json`
* Escudos e dados dos clubes: [FCLOGO](https://github.com/FCLOGO/fclogo.top) (código em licença MIT; os arquivos dos escudos dizem "para uso pessoal, não comercial"). Os escudos são marcas registradas dos clubes; o Flagx é um projeto de fã, sem fins comerciais.

Para rodar no computador: `python3 -m http.server` nesta pasta e depois http://localhost:8000
