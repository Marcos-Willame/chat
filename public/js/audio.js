// audio.js
const recordingButton = document.getElementById('recordingButton');
let mediaRecorder;
let ws;
let username;

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

      const audioPlayer = new Audio(receivedAudioUrl);
      audioPlayer.controls = true;
      audioPlayer.title = username;

      const messageContainer = document.createElement('div');
      messageContainer.classList.add('message');
      messageContainer.appendChild(audioPlayer);

      chatMessages.appendChild(messageContainer);
    }
  };
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
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


