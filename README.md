Flagx
=====

Jogo de adivinhar bandeiras. A bandeira começa coberta por seis pedaços e
cada chute errado revela mais um. O jacaré comenta cada jogada, sem nenhuma educação.

Jogar: https://jacare180.github.io/flagx/

Escudos de futebol: https://jacare180.github.io/flagx/?tema=futebol (ou o ícone ao lado do nome Flagx, que troca entre as duas páginas)

Como funciona
-------------

O botão "Modo" acima da bandeira abre um painel com o jeito de responder (digitar ou alternativas) e o modo. Regiões, "Bandeira inteira" e "Difícil" ficam direto na tela do jogo e valem na hora (começam uma corrida nova).

* **Jeito de jogar:** a bandeira vem **em pedaços** ou **inteira**, e a resposta é **digitando** ou escolhendo entre **4 alternativas**.
  * Em pedaços e digitando: acertar com 1 pedaço vale 120 pontos e cada pedaço a mais tira 20.
  * Inteira e digitando: 60 pontos.
  * Em pedaços com alternativas: metade do valor dos pedaços. Cada erro abre um pedaço e risca a opção errada.
  * Inteira com alternativas: 30 pontos.
  * As alternativas também podem ser escolhidas pelas teclas 1 a 4. No difícil, as erradas são bandeiras parecidas, como Romênia e Chade.
* **Modo:**
  * **Clássico:** 3 vidas, mostradas como corações acima dos chutes. Cada erro ou desistência tira uma. Começa pelos países mais conhecidos e vai abrindo para os menos famosos.
  * **Contra o relógio:** 60 segundos. Em pedaços, eles abrem sozinhos a cada 2,5 segundos.
  * **Diário:** uma bandeira por dia, igual para todo mundo (o dia vira no horário de Brasília). É sempre em pedaços e digitando, com todas as regiões e sem difícil. Conta os dias seguidos de acerto e tem um botão para copiar o resultado com quadradinhos.
* **Regiões:** África, Américas, Ásia, Europa e Oceania. Marque quantas quiser; sem nenhuma marcada, vale o mundo todo.
* **Difícil:** bandeira sem cor e espelhada, com 41 territórios a mais. Pontos em dobro.

Cada combinação de modo e jeito de jogar tem o seu recorde.

* **Dica:** cada chute errado mostra a distância, a direção no mapa-múndi e a proximidade.
* **Capital:** depois de acertar o país, acertar a capital dá 50% de bônus.
* **Futebol:** o mesmo jogo com 167 escudos de clubes do Brasil (36: a Série A de 2026 e clubes tradicionais), Inglaterra, Espanha, Itália e Alemanha (e 2 de Portugal quando nenhuma liga está marcada). A dica mede a distância entre os estádios e o bônus pergunta a cidade do clube.
* **Retrô:** liga da página de futebol com 195 escudos antigos de 35 clubes brasileiros (até 6 versões de cada, sem a atual). No fim da rodada aparece qual versão era, por exemplo "escudo 8 de 14 da história do clube". Os antigos só entram quando o Retrô está marcado e nunca no Diário.

Arquivos
--------

* Falas do jacaré: `js/mensagens.js` (pode editar à vontade)
* Lógica do jogo: `js/jogo.js`
* Visual: `css/flagx.css`, feito com a skill Hallmark, tema Overprint
* Ideias para depois: `BACKLOG.md`
* Gerar de novo os dados dos países: `ferramentas/gerar-paises.js` (instruções no topo do arquivo)
* Gerar de novo os clubes e copiar os escudos: `ferramentas/gerar-clubes.js` e depois `ferramentas/gerar-clubes-brasil.js` (instruções no topo dos arquivos)

Fontes
------

* Bandeiras: [FlagCDN](https://flagcdn.com)
* Países, regiões, coordenadas e capitais: [mledoze/countries](https://github.com/mledoze/countries) (licença ODbL)
* População aproximada, usada só para ordenar a Sobrevivência: [@geobase/countries-data](https://www.npmjs.com/package/@geobase/countries-data) (licença MIT)
* Nomes de capitais em português do Brasil: `ferramentas/capitais-br.json`
* Escudos e dados dos clubes: [FCLOGO](https://github.com/FCLOGO/fclogo.top) (código em licença MIT; os arquivos dos escudos dizem "para uso pessoal, não comercial"). 
* Escudos dos clubes brasileiros: [escudos-futebol-api](https://github.com/washingtonos/escudos-futebol-api), de Washington Oliveira (o repositório não declara licença).
* Escudos antigos: [Escudoteca, Gazeta dos Brasões do Futebol](https://escudoteca.com/), usados com autorização da responsável pelo site, para um jogo de incentivo ao estudo. Gerados por `ferramentas/gerar-retro.py`.
* Todos os escudos são propriedade de seus respectivos clubes e federações. O Flagx não reivindica nenhuma titularidade sobre eles.
* Os escudos são marcas registradas dos clubes; o Flagx é um projeto de fã, sem fins comerciais.

Para rodar no computador: `python3 -m http.server` nesta pasta e depois http://localhost:8000
