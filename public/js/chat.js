function createMessageSelfElement(content) {
  const messageSelfEl = document.createElement("div");

  messageSelfEl.classList.add("message-self");
  messageSelfEl.innerHTML = content;

  return messageSelfEl;
}

function createMessageOtherElement(content, otherUser) {
  const messageOtherEl = document.createElement("div");
  const messageOtherNameEl = document.createElement("span");

  messageOtherEl.classList.add("message-other");

  messageOtherNameEl.classList.add("message-self");
  messageOtherNameEl.style.color = otherUser.color;
  messageOtherNameEl.innerHTML = otherUser.name;

  messageOtherEl.appendChild(messageOtherNameEl);
  messageOtherEl.innerHTML += content;

  return messageOtherEl;
}

function playNotificationSound() {
  const notificationSound = document.getElementById("notification-sound");
  notificationSound.play();
}

function processTextMessage(eventData) {
  try {
    const newMessageEl =
      eventData.id == user.id
        ? createMessageSelfElement(eventData.message)
        : createMessageOtherElement(eventData.message, eventData);

    chatMessagesEl.appendChild(newMessageEl);

    scrollToMessage();
  } catch (error) {
    console.error("Erro ao processar mensagem JSON:", error);
  }
}

function sendTextMessage(event) {
  event.preventDefault();
  const message = chatInputEl.value.trim();

  if (message !== "" || chatInputEl.files?.length > 0) {
    const websocketMessage = { ...user, message, action: "text" };
    websocket.send(JSON.stringify(websocketMessage));
    chatInputEl.value = "";
  }
}

chatFormEl.addEventListener("submit", sendTextMessage);
