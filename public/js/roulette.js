const socket = new WebSocket(WS_URL);

const rouletteGameEl = document.querySelector(".container");
const rouletteButtonEl = document.getElementById("spin");
const rouletteResultEl = document.getElementById("selected");

let rotating = false;

const isso_e_um_objeto = { chave: "valor", chave2: "valor", chave3: "valor" };
const isso_e_um_lista = ["valor", "valor", "valor"];

const characters = {
  1: [
    "O que você mais espera de alguém em um relacionamento?",
    "Você prefere sair para comer fora com o parceiro ou pedir e comer em casa? ",
    "Você já chegou a gostar de mim como um parceiro romântico?",
  ],


  2: [
    "Já esteve em uma friend zone?",
    "O que te faz confiar em alguém?",
    "Qual a melhor memória que você possui de algum dos seus avós?",
  ],
  3: [
    "E o que te faz perder a confiança em alguém?",
    "O que você valoriza mais em termos de comunicação em um relacionamento: palavras de afirmação, tempo de qualidade, presentes, atos de serviço ou toque físico?",
    "Como você acha que os seus pais definiriam você quando era criança?",
  ],
  4: [
    "O que você gostaria de fazer junto de um namorado(a)?",
    "você ja ficou em duvida entre duas pessoas?",
    "Como seria a demonstração de amor mais perfeita para você?",
  ],
  5: [
    "Quando você acha que é o melhor momento para duas pessoas começarem a morar juntas?",
    "O que você observa para considerar uma potencial pessoa para se relacionar?",
    "Como você acha que seria um relacionamento entre nós dois?",
  ],
  6: [
    "O quanto você precisa confiar ou estar interessado para sair em um primeiro encontro?",
    "dizem que em nossas vidas encontramos duas pessoas, temos uma pessoa que e nossa cara metade, e outra que e a nossa alma gemea ja se encontrou com uma das duas?",
    "Se você pudesse se transformar em um animal por um dia, qual seria?",
  ],

  7: [
    "O que você considera mais atraente em mim?",
    "Você acredita em segundas chances em relacionamentos, ou acha que é melhor seguir em frente após um término?",
    "Entre nós dois, quem você acha que mais provavelmente tomaria uma atitude primeiro?",
  ],
  8: [
    "O que você mudaria em você se pudesse?",
    "Como você se ver daqui a 10 anos? ",
    "Como você lida com conflitos em um relacionamento? Prefere resolver imediatamente ou dar um tempo para esfriar as emoções?",
  ],
  9: [
    "O que você considera ser um amor verdadeiro?",
    "O que te fez vc perder o amor por uma pessoa? ",
    "se considera pronto para ter um novo relacionamento?",
  ],
  10: [
    "Qual é o seu maior medo em um relacionamento?",
    "Que tipo de relacionamento que vc quer ter?",
    "Existe um casal que você admira? Qual e por quê?",
  ],
  11: [
    "Qual a coisa mais importante que sua mãe ou seu pai te ensinou?",
    "Se hoje fosse o nosso último dia na Terra, o que você gostaria de fazer?",
    "se você podesse voltar no tempo por 1 semana o que vc faria? ",
  ],
  12: [
    "Qual seria a viagem dos seus sonhos a dois?",
    "Você se considera uma pessoa que tem muitos contatinhos?",
    "Se algum dia se casar, onde gostaria que fosse a sua lua de mel?",
  ],

  13: [
    "Se tivesse que escolher entre dinheiro e amor verdadeiro, qual escolheria?",
    "Quais são suas preferências ao se relacionar com alguém?",
    "Você consegue se apaixonar fácil ou se considera uma pessoa difícil de se envolver?",
  ],
  14: [
    "Você já disse “eu te amo” e arrependeu?",
    "Alguma pessoa do seu mesmo gênero já deu em cima de você? Se sim, como foi?",
    "o que vc faria se virasse homem/mulher por um dia ?",
  ],
  15: [
    "Qual é o seu maior sonho de infância que ainda não realizou?",
    "O que você faria se tivesse apenas um dia para viver?",
    "Qual o livro que mais te marcou?",
  ],
  16: [
    "Qual o seu plano de vida a longo prazo?",
    "Você tem algum apelido de infância?",
    "Um objeto preferido que você tem no seu quarto?",
  ],
  17: [
    "Qual é o filme que mais te fez chorar e por quê?",
    "Qual é a sua lembrança mais feliz da infância?",
    "Qual é a sua opinião sobre relacionamentos à distância?",
  ],
  18: [
    "Prefere receber ou dar elogios?",
    "Você se atrai mais por beleza ou por inteligência?",
    "Você prefere cozinhar ou pedir comida?",
  ],

  19: [
    "O que você acredita ser o ingrediente mais importante para construir uma conexão emocional profunda em um relacionamento?",
    "Qual o aplicativo de celular que você mais usa durante a semana?",
    "qual a rede social que você mais usa? e o que você mais faz nela ?",
  ],
  20: [
    "O que você faria se ganhasse na loteria hoje?",
    "Você é uma pessoa que se apaixona facilmente?",
    "O que mais te atrai na personalidade de alguém?",
  ],
  21: [
    "Qual a coisa mais estranha que você faz quando está sozinho?",
    "Já quis aprender a tocar algum instrumento musical?",
    "O que você mais tem orgulho sobre você?",
  ],
  22: [
    "Quem é a pessoa que você mais admira no mundo?",
    "O que você prefere? Um abraço apertado por 10 minutos ou um beijo rápido por alguns segundos?",
    "Qual a característica de personalidade que você mais detesta em alguém?",
  ],
  23: [
    "Se você pudesse reviver um momento especial que marcou a sua vida, qual seria ele?",
    "Você se considera em uma relação uma pessoa mais dominante ou submissa(o)?",
    "Você preferiria ganhar menos dinheiro fazendo o que ama ou muito dinheiro fazendo o que odeia?",
  ],
  24: [
    "Prefere beijos, amasso ou chupões ?",
    "Qual a coisa mais estranha que já te falaram?",
    "Você preferiria que alguém te machucasse, mas fosse honesto com você ou mentisse para proteger os seus sentimentos?",
  ],

  25: [
    "Qual foi o motivo do seu último término?",
    "Você mantém amizade com algum ex?",
    "Qual foi o seu relacionamento mais longo e o que você aprendeu com ele?",
  ],
  26: [
    "Você já assistiu 50 Tons de Cinza ou filmes parecidos? se sim o que você achou do filme ?",
    "de 0 a 10 quanto vc se acha sexy ?",
    "na sua percepição como você ver uma pessoa sadica ?",
  ],
  27: [
    "Você se considera safado(a)?",
    "Você já teve uma amizade colorida?",
    "Você botaria alguma musica na hora dos pegas?",
  ],
  28: [
    "O que você acha de lingerie sexy? qual cor você acha mais bonita?",
    "Qual é a sua fantasia mais ousada que gostaria de realizar um dia?",
    "Prefere ser dominante, submisso ou alternar os papéis na intimidade?",
  ],
  29: [
    "Qual a parte do meu corpo que você acha mais atraente ?",
    "Se você fosse fazer uma massagem em mim, por onde começaria?",
    "Qual a parte mais favorita do seu corpo?",
  ],
  30: [
    "Se tivéssemos um encontro romântico, o que você escolheria para vestir para me impressionar?",
    "Qual parte você consideraria mais sensível do seu corpo, o seu ponto fraco?",
    "Qual é a sua opinião sobre experimentar novas coisas na intimidade, como brinquedos ou jogos eróticos, para apimentar a relação?",
  ],
  // Adicione mais shuffles conforme necessário
};

function sendRouletteAction(action) {
  socket.send(JSON.stringify({ action: "roulette", roulette: { action } }));
}

rouletteButtonEl.onclick = function () {
  if (rotating) return;
  rotating = true;

  sendRouletteAction("start");
};

function resetRoulette() {
  rouletteGameEl.querySelectorAll(".roulette-option").forEach((item) => {
    item.classList.remove("selected");
  });
}

function handleRouletteResult(data) {
  if (data.isNewGame) {
    resetRoulette();
  }

  rouletteGameEl.style.transition = "transform 5s ease-out";
  rouletteGameEl.style.transform = "rotate(" + (data.angle + 3600) + "deg)";

  setTimeout(() => {
    rouletteGameEl.style.transition = "none";
    rouletteResultEl.innerHTML = `Selecionado: ${data.selected}`;

    const resultTextEl = document.createElement("div");
    const character = characters[data.selected][data.shuffle - 1];

    if (character) {
      resultTextEl.textContent = `Pergunta ${data.selected}.${data.shuffle} ${character}`;
    } else {
      resultTextEl.textContent =
        "Personagem não encontrado para o shuffle e índice especificados";
    }

    rouletteResultEl.appendChild(resultTextEl);

    const selectedNumberElement = rouletteGameEl.querySelector(
      `.num-${data.selected}`
    );
    selectedNumberElement.classList.add("selected");

    rotating = false;
  }, 5000);
}

socket.addEventListener("message", (event) => {
  try {
    // Verificar se a mensagem é um objeto JSON
    if (typeof event.data === 'string') {
      const data = JSON.parse(event.data);

      if (data.action === "result") {
        handleRouletteResult(data);
      }
    } else {
      // Se não for JSON, é uma mensagem de áudio, então apenas ignore
    }
  } catch (error) {
    console.error("Error parsing WebSocket message:", error);
  }
});

socket.addEventListener("open", () => {
  console.info("Conexão estabelecida com o servidor WebSocket");
});

socket.addEventListener("error", (error) => {
  console.error(`Erro na conexão WebSocket: ${error}`);
});

socket.addEventListener("close", () => {
  console.info("Conexão fechada");
});

window.addEventListener("beforeunload", () => {
  socket.close();
});