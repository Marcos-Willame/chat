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

const CHAT_MESSAGE_SCROLL = 200;

const colors = [
  "cadetblue",
  "darkgoldenrod",
  "cornflowerblue",
  "darkkhaki",
  "hotpink",
  "gold",
];

let mediaRecorder;
let websocket;
let user;

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

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
      handleAudioMessage(data);
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

const handleAudioMessage = (audioData) => {
  const receivedBlob = new Blob([audioData], { type: 'audio/wav' });
  const receivedAudioUrl = URL.createObjectURL(receivedBlob);

  const audioPlayer = new Audio(receivedAudioUrl);
  audioPlayer.controls = true;
  audioPlayer.title = user.name;

  const container = document.createElement('div');
  container.className = 'message--other audio-container';
  container.style.color = user.color;
  container.appendChild(audioPlayer);

  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message');
  messageContainer.appendChild(container);

  chatMessages.appendChild(messageContainer);

  audioPlayer.play();
};

const handleLogin = () => {
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      name: prompt('Digite seu nome de usuário:'),
      color: getRandomColor(),
    };

    websocket = new WebSocket(WS_URL);
    websocket.onmessage = processMessage;

    login.style.display = 'none';
    chat.style.display = 'flex';
  }
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
};

const sendMessage = (event) => {
  event.preventDefault();

  const messageContent = chatInput.value.trim();

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

const audioButton = document.getElementById("recordingButton");

audioButton.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "inactive") {
    startRecording();
  } else {
    stopRecording();
  }
});

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const audioBlob = new Blob([event.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const messageContent = 'Audio Message';
        const message = {
          userId: user.id,
          userName: user.name,
          userColor: user.color,
          content: messageContent,
          action: 'chat',
          audioData: audioUrl,
        };

        websocket.send(JSON.stringify(message));
      }
    };

    mediaRecorder.onstop = () => {
      mediaRecorder.stream.getTracks().forEach((track) => {
        track.stop();
      });
    };

    mediaRecorder.onerror = (event) => {
      console.error('Erro no gravador de mídia:', event.error);
    };

    mediaRecorder.onstart = () => {
      console.log('Gravação iniciada');
    };

    mediaRecorder.onstop = () => {
      console.log('Gravação parada');
      mediaRecorder.stream.getTracks().forEach((track) => {
        track.stop();
      });
    };

    mediaRecorder.start();
    console.log('Gravação iniciada com sucesso');
  } catch (error) {
    console.error('Erro ao acessar o microfone:', error);
  }
};

// Chame a função assim que a página for carregada para solicitar o nome de usuário
handleLogin();