//server.js

const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const express = require("express");

const { WebSocketServer, WebSocket } = require("ws");

const { handleTextMessage } = require("./chat");
const { handleRoulette } = require("./roulette");
const { handleAudioMessage } = require("./audio");

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.info("Cliente conectado");
  setupWebSocket(ws);
});

let data = null;

function setupWebSocket(ws) {
  ws.on("error", console.error);

  ws.on("message", (message) => {
    try {
      data = JSON.parse(message);
    } catch {
      handleAudioMessage({ ws, message, server: wss });
      return;
    }

    if (data.action === "text") {
      handleTextMessage({ ws, data, server: wss });
    } else if (data.action === "audio") {
      handleAudioMessage({ ws, message, server: wss });
    } else if (data.action === "roulette") {
      handleRoulette({ ws, data, server: wss });
    }
  });

  ws.on("close", () => console.info("Cliente desconectado"));
}

app.use(express.static("public"));

server.listen(PORT, () => {
  console.info(`Servidor Express rodando na porta ${PORT}`);
});
