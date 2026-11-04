# Backlog do Flagx

Ideias combinadas que ficaram para depois. Quando uma entrar no jogo, ela sai daqui e vai para o README.

## Ideias guardadas

- **Modo hardcore com bandeiras de capitais.** Não existe API pronta. A fonte mais próxima é o repositório [timondev/flags](https://github.com/timondev/flags), com bandeiras de cidades tiradas da Wikimedia Commons (a maioria em domínio público). Antes de decidir, levantar quantas das ~195 capitais têm bandeira lá. Riscos: muitas capitais não têm bandeira oficial e várias são só um brasão em fundo branco.
- **População no modo difícil.** A cada chute errado, dizer se o país certo tem mais ou menos gente que o chutado. O arquivo `dados/paises.json` já tem uma população aproximada (pacote @geobase/countries-data, MIT, dados de mais ou menos 2010), usada hoje só para ordenar a Sobrevivência. Para mostrar ao jogador, trocar por dados atuais do Banco Mundial (o dono do projeto baixa o arquivo), porque os de 2010 erram alguns pares, como China e Índia.
- **Curiosidade de cada bandeira.** O dono do projeto vai montar o banco de curiosidades. Mostrar uma no fim de cada rodada.
- **Desafio de escudos retrô brasileiros.** Ideia: um modo com escudos antigos dos clubes, com a década como bônus. Fonte sugerida: [escudoteca.com](https://escudoteca.com/) ("Gazeta dos Brasões do Futebol"), um acervo montado à mão que avisa não ser dono das imagens. Falta: liberar o site na rede da sessão para ver de onde vêm os arquivos, ou o dono trazer os escudos antigos com o ano de cada um.

## Pequenos ajustes

- Recorde separado por região.
- Mostrar no fim da rodada o país no mapa.
