//server.js

const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const express = require("express");

const { WebSocketServer, WebSocket } = require("ws");

const { handleChat } = require("./chat");
const { handleRoulette } = require("./roulette");

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.info("Cliente conectado");
  setupWebSocket(ws);
});

function setupWebSocket(ws) {
  ws.on("error", console.error);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.action === "chat") {
        handleChat({ ws, data, server: wss });
      } else if (data.action === "roulette") {
        handleRoulette({ ws, data, server: wss });
      }
    } catch (error) {
      console.error("Erro ao fazer parse da mensagem JSON. Tratando como áudio:", error);

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          // Verificamos se o cliente não é o mesmo que enviou a mensagem
          if (Buffer.isBuffer(message)) {
            client.send(message, { binary: true });
          } else {
            client.send(message);
          }
        }
      });
    }
  });

  ws.on("close", () => console.info("Cliente desconectado"));
}

app.use(express.static("public"));

server.listen(PORT, () => {
  console.info(`Servidor Express rodando na porta ${PORT}`);
});



