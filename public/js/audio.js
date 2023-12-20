// audio.js
const recordingButton = document.getElementById("recordingButton");
let mediaRecorder;
let ws;
let username;
let userColor;  // Declare userColor no script de áudio também, para evitar erros

const createAudioElement = (audioBlob, sender, color) => {
  const receivedBlob = new Blob([audioBlob], { type: "audio/wav" });
  const receivedAudioUrl = URL.createObjectURL(receivedBlob);

  const audioPlayer = new Audio(receivedAudioUrl);
  audioPlayer.controls = true;
  audioPlayer.title = sender;

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message");
  messageContainer.classList.add(sender === username ? "sent" : "received");

  if (color) {
    const nameElement = document.createElement("span");
    nameElement.style.color = color;  // Use a cor passada como argumento
    nameElement.textContent = `${sender}: `;
    messageContainer.appendChild(nameElement);
  }

  messageContainer.appendChild(audioPlayer);

  chatMessages.appendChild(messageContainer);
};

const initWebSocket = () => {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("WebSocket conectado.");
    recordingButton.disabled = false;
  };

  ws.onmessage = (event) => {
    if (event.data instanceof Blob && event.data.size > 0) {
      createAudioElement(event.data, "other", userColor);
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
        createAudioElement(event.data, "self", userColor);
      }
    };

    mediaRecorder.onstop = () => {
      mediaRecorder.stream.getTracks().forEach((track) => {
        track.stop();
      });
    };

    mediaRecorder.start();
  } catch (error) {
    console.error("Erro ao acessar o microfone:", error);
  }
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
};

// Adiciona eventos para pcs
recordingButton.addEventListener("mousedown", startRecording);
recordingButton.addEventListener("mouseup", stopRecording);

// Adiciona eventos para dispositivos móveis
recordingButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  startRecording();
}, { passive: false });

recordingButton.addEventListener("touchend", (event) => {
  event.preventDefault();
  stopRecording();
}, { passive: false });

const setAudioUsername = (name, color) => {
  username = name;
  userColor = color;
};

initWebSocket();








// const setUsername = () => {
//   username = prompt('Digite seu nome de usuário:');
// };

// setUsername();
// initWebSocket();



