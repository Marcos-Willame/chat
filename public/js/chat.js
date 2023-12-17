// chat.js
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const chatNewMessage = document.querySelector("#new-message");

const CHAT_MESSAGE_SCROLL = 200;

const colors = [
  "cadetblue",
  "darkgoldenrod",
  "cornflowerblue",
  "darkkhaki",
  "hotpink",
  "gold",
];

const user = { id: "", name: "", color: "" };

let websocket;

const createMessageElement = (content, sender, senderColor) => {
  const div = document.createElement("div");

  div.classList.add("message");
  if (sender) {
    const span = document.createElement("span");
    span.classList.add("message--sender");
    span.style.color = senderColor;
    span.innerHTML = sender;
    div.appendChild(span);
  }
  div.innerHTML += content;

  return div;
};

const playNotificationSound = () => {
  const notificationSound = document.getElementById('notificationSound');
  notificationSound.play();
};

const scrollScreen = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });

  chatNewMessage.style.display = "none";
};

chatNewMessage.onclick = scrollScreen;

const processMessage = ({ data }) => {
  if (typeof data !== 'string') {
    if (data instanceof Blob) {
      return; // Tratar dados de áudio em audio.js
    }
    console.error('Tipo de mensagem não suportado:', data);
    return;
  }

  try {
    const { userId, userName, userColor, content, action } = JSON.parse(data);

    if (action !== "message") {
      return;
    }

    const message = createMessageElement(content, userName, userColor);
    chatMessages.appendChild(message);

    if (window.scrollY < CHAT_MESSAGE_SCROLL) {
      chatNewMessage.style.display = "flex";
      playNotificationSound();
    } else {
      chatNewMessage.style.display = "none";
    }
  } catch (error) {
    console.error('Erro ao processar mensagem JSON:', error);
  }
};

const handleLogin = (event) => {
  event.preventDefault();

  user.id = crypto.randomUUID();
  user.name = loginInput.value;
  user.color = colors[Math.floor(Math.random() * colors.length)];

  login.style.display = "none";
  chat.style.display = "flex";

  websocket = new WebSocket(WS_URL);
  websocket.onmessage = processMessage;
};

const sendMessage = (event) => {
  event.preventDefault();

  const messageContent = chatInput.value.trim();

  if (messageContent !== "") {
    const message = {
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      content: messageContent,
      action: "message",
    };

    websocket.send(JSON.stringify(message));

    chatInput.value = "";
  }
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);

document.addEventListener("scroll", () => {
  if (window.scrollY >= CHAT_MESSAGE_SCROLL) {
    chatNewMessage.style.display = "none";
  }
});


