let user = null;

function handleAudioMessage({ ws, server, message }) {
  let isFile = false;

  try {
    JSON.parse(message);
  } catch {
    isFile = true;
  }

  server.clients.forEach((client) => {
    if (client === ws) {
      return;
    }

    if (isFile) {
      client.send(JSON.stringify({ ...user, action: "audio" }));
      client.send(message, { binary: true });
    } else {
      user = JSON.parse(message);
    }
  });
}

module.exports = { handleAudioMessage };
