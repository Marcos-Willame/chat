const MAX_NUMBER = 30; // Define quantidade de opções na roleta
const MIN_TURNS = 2; // Define a quantidade mínima de voltas completas (2 giros)

let history = {};
let roundHistory = {};

let isNewGame = true;

function handleRoulette({ server, data }) {
  if (data.roulette.action === "start") {
    generateResult(server, data);
  }
}

function generateResult(server, data) {
  if (Object.keys(roundHistory).length >= MAX_NUMBER) {
    roundHistory = {};
    isNewGame = true;

    if (history[1]?.length >= 3) {
      history = {};
    }
  }

  const selected = Math.floor(Math.random() * MAX_NUMBER) + 1; // Número aleatório de 1 ate 30;
  const shuffle = Math.floor(Math.random() * 3) + 1; // Define um numero aleatório referente a variação do numero randômico.

  if (roundHistory[selected] || history[selected]?.includes(shuffle)) {
    return generateResult(server, data);
  } else {
    roundHistory[selected] = true;

    if (!history[selected]) {
      history[selected] = [];
    }

    history[selected].push(shuffle);
  }

  const partialAngle = 360 - (selected - 1) * (360 / MAX_NUMBER); // Calcule o ângulo correspondente ao número selecionado.
  const extraTurns = Math.floor(Math.random() * 10) + MIN_TURNS; // Gere um número aleatório para a quantidade de voltas extras.
  const angle = 360 * (MIN_TURNS + extraTurns) + partialAngle; // Calcule o ângulo total a ser girado.

  console.table({ selected, shuffle });
  console.table({ history, roundHistory });
  console.info("\n------------------------------\n\n");

  server.clients.forEach((client) => {
    const response = { action: "result", selected, shuffle, angle, isNewGame };
    client.send(JSON.stringify(response));
  });

  isNewGame = false;
}

module.exports = { handleRoulette };
