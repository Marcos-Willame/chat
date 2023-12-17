// audio.js
const recordingButton = document.getElementById('recordingButton');
let mediaRecorder;
let ws;
let username;

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

const initWebSocket = () => {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket conectado.');
    recordingButton.disabled = false;
  };

  ws.onmessage = (event) => {
    if (event.data instanceof Blob && event.data.size > 0) {
      const receivedBlob = new Blob([event.data], { type: 'audio/wav' });
      const receivedAudioUrl = URL.createObjectURL(receivedBlob);

      const message = createMessageElement('<audio controls src="' + receivedAudioUrl + '"></audio>', username, user.color);
      
      chatMessages.appendChild(message);
    }
  };
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const audioPlayer = new Audio();
        audioPlayer.controls = true;
        audioPlayer.title = username;

        const container = document.createElement('div');
        container.className = 'message'; // Utilizando a mesma classe 'message'
        container.appendChild(audioPlayer);
        chatMessages.appendChild(container);

        const receivedBlob = new Blob([event.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(receivedBlob);
        await audioPlayer.load();
        audioPlayer.src = audioUrl;

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
};

setUsername();
initWebSocket();


