// chat.js

// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
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

const createMessageSelfElement = (content) => {
  const div = document.createElement("div");

  div.classList.add("message--self");
  div.innerHTML = content;

  return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
  const div = document.createElement("div");
  const span = document.createElement("span");

  div.classList.add("message--other");

  span.classList.add("message--sender");
  span.style.color = senderColor;

  div.appendChild(span);

  span.innerHTML = sender;
  div.innerHTML += content;

  return div;
};

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

// Função para reproduzir o som de notificação
function playNotificationSound() {
  const notificationSound = document.getElementById('notificationSound');
  notificationSound.play();
}

const scrollScreen = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });

  chatNewMessage.style.display = "none";
};

chatNewMessage.onclick = scrollScreen;

const processMessage = ({ data }) => {
  // Se a mensagem não for uma string, ignore-a
  if (typeof data !== 'string') {
    // Se o tipo for Blob (áudio), retorne sem processar
    if (data instanceof Blob) {
      return;
    }

    console.error('Tipo de mensagem não suportado:', data);
    return;
  }

  try {
    const { userId, userName, userColor, content, action } = JSON.parse(data);

    if (action !== "message") {
      return;
    }

    const message =
      userId == user.id
        ? createMessageSelfElement(content)
        : createMessageOtherElement(content, userName, userColor);

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    messageContainer.appendChild(message);
    chatMessages.appendChild(messageContainer);

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
  user.color = getRandomColor();

  login.style.display = "none";
  chat.style.display = "flex";

  // Salvar o nome de usuário no Local Storage para ser recuperado em futuros acessos
  localStorage.setItem('username', user.name);

  websocket = new WebSocket(WS_URL);
  websocket.onmessage = processMessage;
};

const sendMessage = (event) => {
  event.preventDefault();

  const messageContent = chatInput.value.trim();

  // Remova a verificação para mensagens vazias
  // Mantenha a verificação para outros tipos de conteúdo (por exemplo, texto)
  if (messageContent !== "" || chatInput.files?.length > 0) {
    const message = {
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      content: messageContent,
      action: "chat",
    };

    websocket.send(JSON.stringify(message));

    chatInput.value = "";
  }
};

// Recuperar o nome de usuário do Local Storage se disponível
const storedUsername = localStorage.getItem('username');
if (storedUsername) {
  user.name = storedUsername;
  handleLogin(); // Se o nome de usuário já estiver armazenado, realizar login automaticamente
} else {
  loginForm.addEventListener("submit", handleLogin);
}

chatForm.addEventListener("submit", sendMessage);

document.addEventListener("scroll", () => {
  if (window.scrollY >= CHAT_MESSAGE_SCROLL) {
    chatNewMessage.style.display = "none";
  }
});



