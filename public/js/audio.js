// audio.js
const recordingButton = document.getElementById('recordingButton');
let mediaRecorder;
let ws;
let username;

const createAudioElement = (audioBlob, sender) => {
  const receivedBlob = new Blob([audioBlob], { type: 'audio/wav' });
  const receivedAudioUrl = URL.createObjectURL(receivedBlob);

  const audioPlayer = new Audio(receivedAudioUrl);
  audioPlayer.controls = true;
  audioPlayer.title = sender;

  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message');
  messageContainer.classList.add(sender === username ? 'sent' : 'received');
  messageContainer.appendChild(audioPlayer);

  chatMessages.appendChild(messageContainer);
};

const initWebSocket = () => {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket conectado.');
    recordingButton.disabled = false;

    setUsername();
  };

  ws.onmessage = (event) => {
    if (event.data instanceof Blob && event.data.size > 0) {
      createAudioElement(event.data, 'other');
    } else {
      processChatMessage(event.data); // Processa mensagens do chat
    }
  };
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const audioBlob = new Blob([event.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const message = {
          action: 'audio',
          audioData: audioUrl,
          sender: username,
        };

        ws.send(JSON.stringify(message));
        createAudioElement(event.data, 'self');
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

// Adiciona função para processar mensagens do chat
const processChatMessage = (data) => {
  try {
    const { userId, userName, userColor, content, action } = JSON.parse(data);

    if (action === 'chat') {
      // Processa mensagem do chat aqui, se necessário
    }
  } catch (error) {
    console.error('Erro ao processar mensagem JSON do chat:', error);
  }
};



