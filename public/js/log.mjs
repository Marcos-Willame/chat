// log.js

let username;

const setUsername = () => {
  username = prompt('Digite seu nome de usuário:');
};

const getUsername = () => {
  return username;
};

export { setUsername, getUsername };