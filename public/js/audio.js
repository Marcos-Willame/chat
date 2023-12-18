// audio.js
const recordingButton = document.getElementById('recordingButton');
let mediaRecorder;
let ws;
let username;

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

      const messageContainer = createMessageElement(audioPlayer, username, '', 'audio-other');
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