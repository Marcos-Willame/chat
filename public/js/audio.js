//audio.js
const audioContainer = document.getElementById('audioContainer');
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
      const receivedAudioUrl = URL.createObjectURL(receivedBlob);

      // Criar um novo elemento de áudio
      const audioPlayer = new Audio(receivedAudioUrl);
      audioPlayer.controls = true;
      audioPlayer.title = username;

      // Adicionar o elemento de áudio ao contêiner
      const container = document.createElement('div');
      container.className = 'audio-container';
      container.appendChild(audioPlayer);
      audioContainer.appendChild(container);

      // Reproduzir o áudio
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

// Adicione a função stopRecording
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

// Adicione esta função para definir o nome de usuário quando solicitado
const setUsername = () => {
  username = prompt('Digite seu nome de usuário:');
};

setUsername(); // Chame a função assim que a página for carregada para solicitar o nome de usuário
initWebSocket();


