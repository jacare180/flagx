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
 *
 * Outros marcadores:
 *   {capital}  a capital do país (falas da capital)
 *   {vidas}    vidas que sobraram (sobrevivência)
 *   {acertos}  bandeiras acertadas na corrida (fim de jogo da sobrevivência)
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

  // Início de rodada no modo difícil (bandeira em preto e branco e espelhada, pontos em dobro).
  inicio_dificil: [
    "Modo difícil. Sem cor e de trás pra frente. Boa sorte, vai precisar.",
    "Preto, branco e espelhada. Quero ver agora, sabichão.",
    "Pontos em dobro, vergonha em dobro também.",
  ],

  // Primeira rodada de uma corrida no modo Sobrevivência.
  sobrevivencia_inicio: [
    "Sobrevivência. Três vidas, nenhuma piedade. Começa pelas fáceis, depois eu fico malvado.",
    "Três vidas. Aposto que você não passa de dez bandeiras.",
  ],

  // Sobrevivência: perdeu uma vida, mas ainda tem outras.
  perdeu_vida: [
    "Era {pais}. Lá se vai uma vida. Sobraram {vidas}.",
    "{pais}, campeão. Menos uma vida. Eu tô contando.",
    "Era {pais}. Ainda tem {vidas} vida(s), mas no seu ritmo não dura muito.",
  ],

  // Sobrevivência: chute errado, perdeu uma vida e a rodada continua.
  erro_vida: [
    "{chute}? Errado. Lá se vai uma vida, sobraram {vidas}.",
    "{chute} não. Um coração a menos. Eu tô contando.",
    "Errou de novo, campeão. Só {vidas} coração(ões) separando você do vexame.",
  ],

  // Sobrevivência: acabaram as vidas.
  fim_de_jogo: [
    "Era {pais}. Fim de jogo. {acertos} bandeiras, nada mal para quem chuta tanto.",
    "Acabou. {acertos} acertos e {pontos} pontos. O jacaré já viu piores. Poucos, mas viu.",
    "Era {pais}. Game over. Vai estudar e volta mais tarde.",
  ],

  // Acertou a capital (bônus de 50%).
  capital_certa: [
    "{capital}, isso mesmo. Mais {pontos} pontos. Tá se achando, né?",
    "Acertou a capital. Agora sim eu fiquei com inveja.",
  ],

  // Errou a capital.
  capital_errada: [
    "{chute}? A capital é {capital}. Anota aí.",
    "Errou. É {capital}. Faltou a aula de geografia, né?",
    "Não é {chute}, é {capital}. Pelo menos o país você acertou.",
  ],

  // Contra o relógio: começo da partida (60 segundos, pedaços abrem sozinhos).
  relogio_inicio: [
    "Sessenta segundos. Os pedaços abrem sozinhos, então chuta logo.",
    "Valendo! O relógio não espera e eu também não.",
  ],

  // Contra o relógio: a rodada passou sem acerto (desistiu ou abriu tudo e nada).
  relogio_pulou: [
    "Era {pais}. Próxima, rápido!",
    "{pais}. Tic tac, sem tempo pra lamentar.",
    "Passou. Era {pais}. Corre que ainda dá.",
  ],

  // Contra o relógio: acabou o tempo.
  relogio_fim: [
    "Tempo! {acertos} acertos e {pontos} pontos. Já vi tartaruga mais rápida.",
    "Acabou o tempo. {pontos} pontos. Dá pra melhorar, e muito.",
  ],

  // Diário: começo da bandeira do dia (igual para todo mundo).
  diario_inicio: [
    "Bandeira do dia. Todo mundo está vendo a mesma. Não passa vergonha.",
    "Diário valendo. Uma chance só, amanhã tem outra.",
  ],

  // Diário: a pessoa já jogou hoje.
  diario_jogado: [
    "Você já jogou hoje. Ansiedade é isso aí. Volta amanhã.",
    "Uma por dia, campeão. A de hoje era {pais}.",
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
    "{chute}? Ai não né campeão.",
    "Longe de ser {chute}. Pega mais uma dica que você está precisando.",
    "{chute}. Você jogou um dado ou pensou nisso?",
    "Errou. Eu sou um réptil e teria acertado.",
    "Nem perto. Mais uma dica por pura caridade.",
    "{chute}, sério? Vou fingir que não vi.",
    "Não. E olha que eu torci por você. Pouco, mas torci.",
  ],

  // O jogador digitou algo que não é um país conhecido. Não gasta chute.
  nao_existe: [
    "\"{chute}\" não é nem país no mapa que você desenhou na escola.",
    "Eu conheço muitos paises, mas não conheço nenhum \"{chute}\".",
    "Virou poliglota? Ta falando varias bobeiras pô",
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
    "{chute} de novo? A bandeira não mudou no ultimos 5 segundos.",
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

/*
 * Falas do jacaré na página de futebol (?tema=futebol).
 * Só precisa listar o que muda: o que não estiver aqui usa as falas de cima.
 */
window.FLAGX_MENSAGENS_FUTEBOL = {
  carregando: [
    "Carregando os escudos. Vai aquecendo enquanto isso.",
  ],

  inicio: [
    "Um pedaço do escudo. Torcedor de verdade acerta agora.",
    "Novo escudo. Se for do seu time e você errar, eu vou contar pra torcida.",
    "Olha esse pedaço. Tem cara de clube grande ou de time da segunda divisão?",
    "Valendo pontos. Ou valendo zoeira, depende de você.",
  ],

  inicio_dificil: [
    "Sem cor e espelhado. Agora quero ver quem é torcedor de verdade.",
    "Modo difícil. Nem o roupeiro do clube reconhece assim.",
  ],

  sobrevivencia_inicio: [
    "Sobrevivência. Três vidas e começa pelos gigantes. Depois vem a segunda divisão.",
    "Três vidas. Aposto que você cai antes da metade do campeonato.",
  ],

  nao_existe: [
    "\"{chute}\" não é clube. Nem no seu time de várzea.",
    "Nunca ouvi falar de \"{chute}\". E eu vejo todos os jogos.",
    "Inventou um time agora? Escolhe um da lista, por favor.",
  ],

  sugestoes: [
    "\"{chute}\"? Fala o nome direito, não é apelido de torcida. Algum desses?",
    "Faltou letra aí. Clica no clube que você quis dizer.",
  ],

  erro_perto: [
    "{chute}? Tá quente. O estádio certo fica {direcao}, a {distancia}.",
    "Errou, mas é clássico regional. {distancia} {direcao}.",
  ],

  erro_longe: [
    "{chute}? Errou de continente. O certo está a {distancia} daqui.",
    "{distancia} de distância. Nem excursão de torcida organizada vai tão longe.",
  ],

  derrota: [
    "Era {pais}. O escudo inteiro na sua frente e nada.",
    "{pais}. Vou fingir que essa rodada não aconteceu.",
  ],

  desistiu: [
    "Desistiu? Era {pais}. Abandonou o jogo antes do apito final.",
    "Era {pais}. Pediu pra sair aos 30 do primeiro tempo.",
  ],

  perdeu_vida: [
    "Era {pais}. Lá se vai uma vida. Sobraram {vidas}.",
    "{pais}, campeão. Cartão vermelho para uma vida.",
  ],

  erro_vida: [
    "{chute}? Errado. Cartão vermelho para uma vida, sobraram {vidas}.",
    "{chute} não. Um coração a menos, e o VAR confirmou.",
  ],

  fim_de_jogo: [
    "Era {pais}. Fim de jogo. {acertos} escudos, nada mal para quem chuta tanto.",
    "Apito final. {acertos} acertos e {pontos} pontos. Rebaixado.",
  ],

  capital_certa: [
    "{capital}, isso mesmo. Mais {pontos} pontos. Conhece até o endereço do estádio.",
    "Acertou a cidade. Tá parecendo comentarista.",
  ],

  capital_errada: [
    "{chute}? O clube é de {capital}. Anota aí.",
    "Errou. É {capital}. Pelo menos o time você acertou.",
  ],

  falha: [
    "Os escudos não carregaram. Jogo adiado por falta de luz no estádio.",
  ],
};
