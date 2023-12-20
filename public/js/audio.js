// audio.js
const recordingButton = document.getElementById("recordingButton");
let mediaRecorder;
let ws;
let username;


const createAudioElement = (audioBlob, sender) => {
  const receivedBlob = new Blob([audioBlob], { type: "audio/wav" });
  const receivedAudioUrl = URL.createObjectURL(receivedBlob);

  const audioPlayer = new Audio(receivedAudioUrl);
  audioPlayer.controls = true;
  audioPlayer.title = sender;

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message");
  messageContainer.classList.add(sender === username ? "sent" : "received");

  // Criar elemento para o nome com a cor
  const nameElement = document.createElement("span");
  nameElement.style.color = userColor; // Use a cor do usuário do chat.js
  nameElement.textContent = `${sender}: `;

  // Adicionar o elemento do nome antes do elemento de áudio
  messageContainer.appendChild(nameElement);
  messageContainer.classList.add(sender === username ? "sent" : "received"); // Adiciona classe 'sent' ou 'received' para estilização
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
      createAudioElement(event.data, "other");
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
        createAudioElement(event.data, "self");
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
recordingButton.addEventListener("touchstart", startRecording, { passive: true });
recordingButton.addEventListener("touchend", stopRecording, { passive: true });

const setAudioUsername = (name, color) => {
  username = name;
  userColor = color; // Atribua a cor do usuário
};








/*// audio.js
const recordingButton = document.getElementById("recordingButton");
let mediaRecorder;
let ws;
let username;

const createAudioElement = (audioBlob, sender) => {
  const receivedBlob = new Blob([audioBlob], { type: "audio/wav" });
  const receivedAudioUrl = URL.createObjectURL(receivedBlob);

  const audioPlayer = new Audio(receivedAudioUrl);
  audioPlayer.controls = true;
  audioPlayer.title = sender;

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message");
  messageContainer.classList.add(sender === username ? "sent" : "received");
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
      createAudioElement(event.data, "other");
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
        createAudioElement(event.data, "self");
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
recordingButton.addEventListener("touchstart", startRecording, { passive: true });
recordingButton.addEventListener("touchend", stopRecording, { passive: true });

const setAudioUsername = (name) => {
  username = name;
};









// const setUsername = () => {
//   username = prompt('Digite seu nome de usuário:');
// };

// setUsername();
// initWebSocket();
*/
