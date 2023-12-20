function handleTextMessage({ server, data }) {
  const handledData = JSON.stringify({ ...data, action: "text" });
  server.clients.forEach((client) => client.send(handledData));
}

module.exports = { handleTextMessage };
