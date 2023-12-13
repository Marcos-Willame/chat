// audio.js
const audioContainer = document.getElementById('audioContainer');
const recordingButton = document.getElementById('recordingButton');
let mediaRecorder;
let ws;
let username;
let userColor;
const localAudios = new Map();

const addMessageToChat = (userName, userColor, content, isAudio = false, isSelf = false) => {
  const div = document.createElement("div");

  if (isAudio) {
    div.classList.add(isSelf ? "message--self-audio" : "message--other-audio");

    const audioIcon = document.createElement("i");
    audioIcon.classList.add("fa", "fa-microphone");
    div.appendChild(audioIcon);

    const audioPlayer = new Audio();
    audioPlayer.controls = true;
    audioPlayer.title = userName;

    const container = document.createElement('div');
    container.className = 'audio-container';
    container.appendChild(audioPlayer);
    audioContainer.appendChild(container);

    const receivedBlob = new Blob([content], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(receivedBlob);

    audioPlayer.src = audioUrl;
    audioPlayer.play();
  } else {
    div.classList.add(isSelf ? "message--self" : "message--other");

    const span = document.createElement("span");
    span.classList.add("message--sender");
    span.style.color = userColor;
    span.innerHTML = userName;

    div.appendChild(span);
    div.innerHTML += content;

    chatMessages.appendChild(div);

    if (window.scrollY < CHAT_MESSAGE_SCROLL) {
      chatNewMessage.style.display = "flex";
      playNotificationSound();
    } else {
      chatNewMessage.style.display = "none";
    }
  }
};


const initWebSocket = () => {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket conectado.');
    recordingButton.disabled = false;

    if (!username) {
      setUsername();
    }
  };

  ws.onmessage = (event) => {
    if (event.data instanceof Blob && event.data.size > 0) {
      const receivedBlob = new Blob([event.data], { type: 'audio/wav' });
      const receivedAudioUrl = URL.createObjectURL(receivedBlob);

      const audioPlayer = new Audio(receivedAudioUrl);
      audioPlayer.controls = true;
      audioPlayer.title = username;

      const container = document.createElement('div');
      container.className = 'audio-container';
      container.appendChild(audioPlayer);
      audioContainer.appendChild(container);

      audioPlayer.play();
      addMessageToChat(username, userColor, 'recebeu um áudio', true);
    } else {
      processMessage(event);
    }
  };
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const audioMessageContent = 'enviou um áudio';
        addMessageToChat(username, userColor, audioMessageContent, true);

        ws.send(event.data);
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
  userColor = getRandomColor();
};

initWebSocket();


