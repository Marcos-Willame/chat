//chat.js

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

const createMessageElement = (content, sender, senderColor, messageType) => {
  const div = document.createElement('div');

  div.classList.add('message');
  
  if (messageType === 'self') {
    div.classList.add('message--self');
  } else if (messageType === 'other') {
    const span = document.createElement('span');
    span.classList.add('message--sender');
    span.style.color = senderColor;
    span.innerHTML = sender;
    div.appendChild(span);
    div.classList.add('message--other');
  } else if (messageType === 'audio-self') {
    div.classList.add('message--audio-self');
  } else if (messageType === 'audio-other') {
    const span = document.createElement('span');
    span.classList.add('message--sender');
    span.style.color = senderColor;
    span.innerHTML = sender;
    div.appendChild(span);
    div.classList.add('message--audio-other');
  }

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
  if (typeof data !== 'string') {
    if (data instanceof Blob) {
      // Tratar dados de áudio
      const message = createMessageElement('<audio controls src="' + URL.createObjectURL(data) + '"></audio>', userName, user.color, 'audio-other');
      chatMessages.appendChild(message);
      return;
    }

    console.error('Tipo de mensagem não suportado:', data);
    return;
  }

  try {
    const { userId, userName, userColor, content, action } = JSON.parse(data);

    if (action === 'chat') {
      // Lógica para exibir mensagens de chat
      const messageType = userId === user.id ? 'self' : 'other';
      const message = createMessageElement(content, userName, userColor, messageType);
      chatMessages.appendChild(message);

      if (window.scrollY < CHAT_MESSAGE_SCROLL) {
        chatNewMessage.style.display = 'flex';
        playNotificationSound();
      } else {
        chatNewMessage.style.display = 'none';
      }
    }

    // ... (outros tipos de mensagens, se houver)
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

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);

document.addEventListener("scroll", () => {
  if (window.scrollY >= CHAT_MESSAGE_SCROLL) {
    chatNewMessage.style.display = "none";
  }
});



