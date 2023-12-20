let mediaRecorder;

function createAudioElement(eventData) {
  const receivedBlob = new Blob([eventData.audio], { type: "audio/wav" });
  const receivedAudioUrl = URL.createObjectURL(receivedBlob);

  const audioPlayer = new Audio(receivedAudioUrl);
  audioPlayer.controls = true;
  audioPlayer.title = eventData;

  const messageContainer = document.createElement("div");

  messageContainer.classList.add("message");
  messageContainer.classList.add(eventData === "self" ? "sent" : "received");

  const nameElement = document.createElement("span");
  nameElement.style.color = eventData.color;
  nameElement.textContent = `${eventData.name}`;

  messageContainer.appendChild(nameElement);
  messageContainer.appendChild(audioPlayer);

  chatMessagesEl.appendChild(messageContainer);
}

async function sendAudioMessage(event) {
  if (event.data.size > 0) {
    const websocketMessage = { ...user, audio: event.data, action: "audio" };
    websocket.send(JSON.stringify(websocketMessage));
    websocket.send(websocketMessage.audio);

    createAudioElement(websocketMessage);
  }
}

function stopAudioMessage() {
  mediaRecorder.stream.getTracks().forEach((track) => {
    track.stop();
  });
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = sendAudioMessage;
    mediaRecorder.onstop = stopAudioMessage;

    mediaRecorder.start();
  } catch (error) {
    console.error("Erro ao acessar o microfone:", error);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

recordingButtonEl.addEventListener("mousedown", startRecording);
recordingButtonEl.addEventListener("mouseup", stopRecording);

recordingButtonEl.addEventListener("touchstart", startRecording, {
  passive: true,
});
recordingButtonEl.addEventListener("touchend", stopRecording, {
  passive: true,
});
