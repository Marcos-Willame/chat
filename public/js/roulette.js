const rouletteGameEl = document.querySelector(".container");
const rouletteButtonEl = document.getElementById("spin");
const rouletteResultEl = document.getElementById("selected");

let rotating = false;

const isso_e_um_objeto = { chave: "valor", chave2: "valor", chave3: "valor" };
const isso_e_um_lista = ["valor", "valor", "valor"];

function sendRouletteAction(action) {
  websocket.send(JSON.stringify({ action: "roulette", roulette: { action } }));
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

websocket.addEventListener("message", (event) => {
  try {
    // Verificar se a mensagem é um objeto JSON
    if (typeof event.data === "string") {
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

// websocket.addEventListener("open", () => {
//   console.info("Conexão estabelecida com o servidor WebSocket");
// });

// websocket.addEventListener("error", (error) => {
//   console.error(`Erro na conexão WebSocket: ${error}`);
// });

// websocket.addEventListener("close", () => {
//   console.info("Conexão fechada");
// });

// window.addEventListener("beforeunload", () => {
//   websocket.close();
// });
