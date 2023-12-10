// chatAudio.js

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
const setaDuplaBaixo = document.querySelector("#setaBaixo");

const audioContainer = document.getElementById('audioContainer');

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
  setaDuplaBaixo.style.display = "none";
  
};

chatNewMessage.onclick = scrollScreen;


const addMessageToChat = (sender, color, content, isSelf) => {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add(isSelf ? 'message--self' : 'message--other');

  if (!isSelf) {
    const senderSpan = document.createElement('span');
    senderSpan.classList.add('message--sender');
    senderSpan.style.color = color;
    senderSpan.textContent = sender + ': ';
    messageContainer.appendChild(senderSpan);
  }

  const messageContent = document.createElement('div');
  messageContent.textContent = content;
  messageContainer.appendChild(messageContent);

  chatMessages.appendChild(messageContainer);
};

const processMessage = ({ data }) => {
  if (typeof data !== 'string') {
    if (data instanceof Blob) {
      // Processar dados de áudio
      const audioPlayer = new Audio();
      audioPlayer.controls = true;
      audioPlayer.title = user.name;

      const container = document.createElement('div');
      container.className = 'audio-container';
      container.appendChild(audioPlayer);
      audioContainer.appendChild(container);

      const receivedBlob = new Blob([data], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(receivedBlob);

      audioPlayer.src = audioUrl;
      audioPlayer.play();

      // Adicione a mensagem de áudio ao chat
      addMessageToChat(user.name, user.color, 'enviou um áudio', true);

      return;
    }

    console.error('Tipo de mensagem não suportado:', data);
    return;
  }

  
  try {
    const { userId, userName, userColor, content, action } = JSON.parse(data);

    if (action === 'message') {
      // Processar mensagens de chat
      const isSelf = userId === user.id;
      addMessageToChat(userName, userColor, content, isSelf);

      if (!isSelf) {
        // Verifique se o usuário não está rolando a tela
        if (window.scrollY < CHAT_MESSAGE_SCROLL) {
          // Exiba o botão "new-message" apenas quando estiver fora do chat
          chatNewMessage.style.display = 'flex';
          setaDuplaBaixo.style.display = 'flex';
          playNotificationSound();
        }
      }
    } else if (action === 'audio') {
      // Processar dados de áudio
      // Adicione a mensagem de áudio ao chat
      addMessageToChat(userName, userColor, 'enviou um áudio', true);
      // Verifique se o usuário não está rolando a tela
      if (window.scrollY < CHAT_MESSAGE_SCROLL) {
        // Exiba o botão "new-message" apenas quando estiver fora do chat
        chatNewMessage.style.display = 'flex';
        setaDuplaBaixo.style.display = 'flex';
      }
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
    setaDuplaBaixo.style.display = 'none'
  }
});

const recordingButton = document.getElementById('recordingButton');
let mediaRecorder;
let ws;
let username;
const localAudios = new Map(); // Use um Map para mapear IDs de áudio para elementos de áudio

const initWebSocket = () => {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket conectado.');
    recordingButton.disabled = false;
  };

  ws.onmessage = (event) => {
    if (event.data instanceof Blob && event.data.size > 0) {
      // Tratar dados de áudio recebidos do servidor
      const receivedBlob = new Blob([event.data], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(receivedBlob);

      // Criar um novo elemento de áudio
      const audioPlayer = new Audio(audioUrl);
      audioPlayer.controls = true;
      audioPlayer.title = username;

      // Adicionar o elemento de áudio ao contêiner
      const container = document.createElement('div');
      container.className = 'audio-container';
      container.appendChild(audioPlayer);
      audioContainer.appendChild(container);

      // Reproduzir o áudio
      audioPlayer.play();

      // Adicione a mensagem de áudio ao chat
      addMessageToChat(username, user.color, 'enviou um áudio', true);
    }
  };
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        // Criar um novo elemento de áudio
        const audioPlayer = new Audio();
        audioPlayer.controls = true;
        audioPlayer.title = username;

        // Adicionar o elemento de áudio ao contêiner
        const container = document.createElement('div');
        container.className = 'audio-container';
        container.appendChild(audioPlayer);
        audioContainer.appendChild(container);

        // Carregar o Blob recebido no elemento de áudio
        const receivedBlob = new Blob([event.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(receivedBlob);
        await audioPlayer.load();
        audioPlayer.src = audioUrl;

        // Adicione o áudio local ao Map para evitar duplicação
        localAudios.set(audioPlayer, true);

        // Enviar dados de áudio para o servidor
        ws.send(event.data);

        // Adicione a mensagem de áudio ao chat
        addMessageToChat(username, user.color, 'enviou um áudio', true);
      }
    };

    mediaRecorder.onstop = () => {
      // Parar a gravação e limpar
      mediaRecorder.stream.getTracks().forEach((track) => {
        track.stop();
      });
    };

    mediaRecorder.start();
  } catch (error) {
    console.error('Erro ao acessar o microfone:', error);
  }
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
};

recordingButton.addEventListener('mousedown', () => {
  startRecording();
});

recordingButton.addEventListener('mouseup', () => {
  stopRecording();
});

const setUsername = () => {
  username = prompt('Digite seu nome de usuário:');
};

setUsername();
initWebSocket();