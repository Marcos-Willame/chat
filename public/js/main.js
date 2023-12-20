const WS_URL = "ws://localhost:8080";
// const WS_URL = "wss://roulette-chat-f12492d53689.herokuapp.com";

const loginEl = document.querySelector(".login");
const loginFormEl = loginEl.querySelector(".login-form");
const loginInputEl = loginEl.querySelector(".login-form-input");

const chatEl = document.querySelector(".chat");
const chatFormEl = chatEl.querySelector(".chat-form");
const chatInputEl = chatEl.querySelector(".chat-form-input");
const chatMessagesEl = chatEl.querySelector(".chat-form-message");

const recordingButtonEl = document.getElementById("recording-button");
const scrollToBottomEl = document.getElementById("scroll-to-bottom");

const websocket = new WebSocket(WS_URL);
const user = { id: "", name: "", color: "" };
let otherUser = null;

function onWebsocketMessage(event) {
  let eventData = null;

  try {
    eventData = JSON.parse(event.data);
  } catch {
    createAudioElement({ ...otherUser, audio: event.data });
    return;
  }

  if (eventData.action === "text") {
    processTextMessage(eventData);
  } else if (eventData.action === "roulette") {
  } else if (eventData.action === "audio") {
    otherUser = eventData;
  }
}

function handleLogin(event) {
  event.preventDefault();

  user.id = crypto.randomUUID();
  user.name = loginInputEl.value;
  user.color = getRandomColor();

  websocket.onmessage = onWebsocketMessage;

  loginEl.style.display = "none";
  chatEl.style.display = "flex";
}

websocket.onopen = () => (recordingButtonEl.disabled = false);
loginFormEl.addEventListener("submit", handleLogin);
