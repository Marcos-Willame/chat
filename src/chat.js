function handleChat({ server, data }) {
  const handledData = JSON.stringify({ ...data, action: "message" });
  server.clients.forEach((client) => client.send(handledData));
}

module.exports = { handleChat };
