// chatAudio.js

// login elements
const login = document.querySelector('.login');
const loginForm = login.querySelector('.login__form');
const loginInput = login.querySelector('.login__input');

// chat elements
const chat = document.querySelector('.chat');
const chatForm = chat.querySelector('.chat__form');
const chatInput = chat.querySelector('.chat__input');
const chatMessages = chat.querySelector('.chat__messages');

const chatNewMessage = document.querySelector('#new-message');

const CHAT_MESSAGE_SCROLL = 200;

const colors = ['cadetblue', 'darkgoldenrod', 'cornflowerblue', 'darkkhaki', 'hotpink', 'gold'];

const user = { id: '', name: '', color: '' };

let websocket;
let mediaRecorder;
let localAudios = new Map(); // Mantenha um controle de áudios locais

const createMessageSelfElement = (content) => {
  const div = document.createElement('div');

  div.classList.add('message--self');
  div.innerHTML = content;

  return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
  const div = document.createElement('div');
  const span = document.createElement('span');

  div.classList.add('message--other');

  span.classList.add('message--sender');
  span.style.color = senderColor;

  div.appendChild(span);

  span.innerHTML = sender;
  div.innerHTML += content;

  return div;
};

// Função para reproduzir o som de notificação
function playNotificationSound() {
  const notificationSound = document.getElementById('notificationSound');
  notificationSound.play();
}

const scrollScreen = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });

  chatNewMessage.style.display = 'none';
};

chatNewMessage.onclick = scrollScreen;

const processMessage = ({ data }) => {
  // Se a mensagem não for uma string, ignore-a
  if (typeof data !== 'string') {
    // Se o tipo for Blob (áudio), retorne sem processar
    if (data instanceof Blob) {
      // Tratar dados de áudio recebidos do servidor
      const receivedBlob = new Blob([data], { type: 'audio/wav' });
      const receivedAudioUrl = URL.createObjectURL(receivedBlob);

      // Criar um novo elemento de áudio
      const audioPlayer = new Audio(receivedAudioUrl);
      audioPlayer.controls = true;
      audioPlayer.title = user.name;

      // Adicionar o elemento de áudio ao contêiner
      const container = document.createElement('div');
      container.className = user.id === data.userId ? 'message--self audio-container' : 'message--other audio-container';
      container.style.color = data.userColor;
      container.appendChild(audioPlayer);
      chatMessages.appendChild(container);

      // Reproduzir o áudio
      audioPlayer.play();

      return;
    }

    console.error('Tipo de mensagem não suportado:', data);
    return;
  }

  try {
    const { userId, userName, userColor, content, action } = JSON.parse(data);

    if (action !== 'message') {
      return;
    }

    const message =
      userId == user.id
        ? createMessageSelfElement(content)
        : createMessageOtherElement(content, userName, userColor);

    chatMessages.appendChild(message);

    if (window.scrollY < CHAT_MESSAGE_SCROLL) {
      chatNewMessage.style.display = 'flex';
      playNotificationSound();
    } else {
      chatNewMessage.style.display = 'none';
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

  login.style.display = 'none';
  chat.style.display = 'flex';

  websocket = new WebSocket(WS_URL);
  websocket.onmessage = processMessage;
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
};

const sendMessage = (event) => {
  event.preventDefault();

  const messageContent = chatInput.value.trim();

  if (messageContent !== '' || chatInput.files?.length > 0) {
    const message = {
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      content: messageContent,
      action: 'chat',
    };

    websocket.send(JSON.stringify(message));

    chatInput.value = '';
  }
};

loginForm.addEventListener('submit', handleLogin);
chatForm.addEventListener('submit', sendMessage);

document.addEventListener('scroll', () => {
  if (window.scrollY >= CHAT_MESSAGE_SCROLL) {
    chatNewMessage.style.display = 'none';
  }
});

//audio.js
const audioButton = document.getElementById('recordingButton');

audioButton.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'inactive') {
    startRecording();
  } else {
    stopRecording();
  }
});

const initWebSocket = () => {
  websocket = new WebSocket(WS_URL);

  websocket.onopen = () => {
    console.log('WebSocket conectado.');
    audioButton.disabled = false;
  };

  websocket.onmessage = (event) => {
    if (event.data instanceof Blob && event.data.size > 0) {
      const receivedBlob = new Blob([event.data], { type: 'audio/wav' });
      const receivedAudioUrl = URL.createObjectURL(receivedBlob);

      const audioPlayer = new Audio(receivedAudioUrl);
      audioPlayer.controls = true;
      audioPlayer.title = user.name;

      const container = document.createElement('div');
      container.className = user.id === event.userId ? 'message--self audio-container' : 'message--other audio-container';
      container.style.color = event.userColor;
      container.appendChild(audioPlayer);
      chatMessages.appendChild(container);

      audioPlayer.play();
    }
  };
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const messageContent = 'Audio Message';
        const message = {
          userId: user.id,
          userName: user.name,
          userColor: user.color,
          content: messageContent,
          action: 'chat',
          audioData: event.data,
        };

        websocket.send(JSON.stringify(message));

        const audioPlayer = new Audio();
        audioPlayer.controls = true;
        audioPlayer.title = user.name;

        const container = document.createElement('div');
        container.className = 'message--self audio-container';
        container.appendChild(audioPlayer);
        chatMessages.appendChild(container);

        const receivedBlob = new Blob([event.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(receivedBlob);
        await audioPlayer.load();
        audioPlayer.src = audioUrl;

        localAudios.set(audioPlayer, true);

        audioPlayer.play();
      }
    };

    mediaRecorder.onstop = () => {
      mediaRecorder.stream.getTracks().forEach((track) => {
        track.stop();
      });
    };

    mediaRecorder.start();
  } catch (error) {
    console.error('Erro ao acessar o microfone:', error);
  }
};

const setUsername = () => {
  user.name = loginInput.value;
};

setUsername();
initWebSocket();