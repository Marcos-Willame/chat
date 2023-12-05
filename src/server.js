const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

const { handleChat } = require("./chat");
const { handleRoulette } = require("./roulette");

dotenv.config();

const PORT = process.env.PORT || 8080;
const server = new WebSocketServer({ port: PORT });

server.on("connection", (ws) => {
  console.info("Cliente conectado");
  setupWebSocket(ws);
});

function setupWebSocket(ws) {
  ws.on("error", console.error);

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.action === "chat") {
      handleChat({ ws, data, server });
    } else if (data.action === "roulette") {
      handleRoulette({ ws, data, server });
    }
  });

  ws.on("close", () => console.info("Cliente desconectado"));
}

console.info(`Servidor WebSocket rodando na porta ${PORT}`);
