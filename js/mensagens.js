/*
 * Falas do jacaré do Flagx.
 *
 * Cada lista tem várias versões e o jogo sorteia uma por vez.
 * Pode editar, apagar ou acrescentar frases à vontade, é só manter as aspas e a vírgula no fim.
 *
 * Marcadores que o jogo troca sozinho:
 *   {pais}    nome do país da rodada
 *   {chute}   o que o jogador digitou
 *   {pontos}  pontos ganhos na rodada
 *   {pedacos} quantos pedaços estavam à mostra
 *
 * Só nas falas de chute errado (erro, erro_perto, erro_longe):
 *   {distancia}    distância do chute até o país certo, por exemplo "2.400 km"
 *   {direcao}      para que lado fica o país certo, já com "ao" ou "a", por exemplo "a nordeste" ou "ao sul"
 *   {proximidade}  o quanto o chute chegou perto, por exemplo "87%"
 */
window.FLAGX_MENSAGENS = {
  carregando: [
    "Carregando as bandeiras do mundo. Vai treinando a cara de quem sabe.",
  ],

  // Início de cada rodada, com 1 pedaço à mostra.
  inicio: [
    "Um pedaço só. Os bons acertam agora. Você, eu não sei.",
    "Nova bandeira. Tenta não me decepcionar logo de cara.",
    "Olha esse pedaço com carinho. É tudo que você vai ter por enquanto.",
    "Valendo pontos. Ou valendo vergonha, depende de você.",
    "Essa é fácil. Mentira, não faço ideia. Mas você deveria saber.",
  ],

  // Chute errado e PERTO do país certo (menos de 1.500 km).
  erro_perto: [
    "{chute}? Tá quente. O país certo fica {direcao}, a {distancia}. Quase dá para ir a pé.",
    "Errou, mas errou perto. {distancia} {direcao}. Não comemora ainda.",
    "{chute} é vizinho de quem você procura. Vai {direcao}.",
  ],

  // Chute errado e LONGE do país certo (mais de 9.000 km).
  erro_longe: [
    "{chute}? Você errou de continente. O certo está a {distancia} daqui.",
    "{distancia} de distância. Nem avião aguenta o tamanho desse erro.",
    "Frio, gelado, Antártida. Vai {direcao} e vai longe.",
  ],

  // Chute errado, nem perto nem longe. Também é usado se faltar alguma lista acima.
  erro: [
    "{chute}? Errado. Fica {direcao}, a {distancia}.",
    "Nem perto. São {distancia}, segue {direcao}.",
    "{chute}? Corajoso. Errado, mas corajoso.",
    "Não é {chute}. Toma mais um pedaço, já que você insiste.",
    "{chute}. Você jogou um dado ou pensou nisso?",
    "Errou. Eu sou um réptil e teria acertado.",
    "Nem perto. Mais um pedaço por pura caridade.",
    "{chute}, sério? Vou fingir que não vi.",
    "Não. E olha que eu torci por você. Pouco, mas torci.",
  ],

  // O jogador digitou algo que não é um país conhecido. Não gasta chute.
  nao_existe: [
    "\"{chute}\" não é país. Nem no mapa que você desenhou na escola.",
    "Não conheço nenhum país chamado \"{chute}\". E eu conheço muitos.",
    "Inventou um país agora? Escolhe um da lista, por favor.",
  ],

  // O que foi digitado não é exato, mas parece com alguns países. Aparece junto com as sugestões.
  sugestoes: [
    "\"{chute}\"? Deixa eu adivinhar o que você quis dizer. Escolhe aí.",
    "Escreve direito que eu não sou dicionário. Algum desses?",
    "Faltou letra aí. Clica no país que você quis dizer.",
  ],

  // O jogador repetiu um chute desta rodada. Não gasta chute.
  repetido: [
    "Você já chutou {chute}. Continua errado, caso esteja curioso.",
    "{chute} de novo? A bandeira não mudou de ideia.",
  ],

  // Acertou com 1 pedaço.
  acerto_genio: [
    "Com um pedaço só? Tá bom, você é bom. Não se acostuma.",
    "Um pedaço. Estou impressionado e um pouco irritado.",
  ],

  // Acertou com 2 ou 3 pedaços.
  acerto_bom: [
    "{pais}, sim. Precisou de {pedacos} pedaços, mas eu deixo passar.",
    "Acertou. Até que você sabe alguma coisa.",
    "Certo. Vou contar pra todo mundo que você teve sorte.",
  ],

  // Acertou com 4, 5 ou 6 pedaços.
  acerto_sofrido: [
    "{pais}. Com {pedacos} pedaços à mostra até eu acertava de olho fechado.",
    "Acertou no sufoco. Os pontos são poucos, mas a dignidade é zero.",
    "Finalmente. Já estava pensando em tirar um cochilo.",
  ],

  // Errou com os 6 pedaços à mostra.
  derrota: [
    "Era {pais}. A bandeira inteira na sua frente e nada.",
    "{pais}. Eu vou fingir que essa rodada não aconteceu. Você também deveria.",
    "Era {pais}. Tudo bem, ninguém nasce sabendo. Mas você podia ter estudado.",
  ],

  // Clicou em "Desisto".
  desistiu: [
    "Desistiu? Era {pais}. Eu esperava mais luta.",
    "Era {pais}. Desistir é uma escolha. Uma escolha ruim, mas é.",
  ],

  // As bandeiras não carregaram.
  falha: [
    "A internet caiu ou as bandeiras fugiram. Nem eu trabalho assim.",
  ],
};
