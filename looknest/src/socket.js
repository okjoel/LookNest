import WebSocketClient from './WebSocketClient';

let socket = null;
let messageListeners = [];

export const initSocket = () => {
  if (!socket) {
    socket = new WebSocketClient('ws://localhost:5000', (data) => {
      messageListeners.forEach(listener => listener(data));
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    messageListeners = [];
  }
};

export const addMessageListener = (listener) => {
  messageListeners.push(listener);
};

export const removeMessageListener = (listener) => {
  messageListeners = messageListeners.filter(l => l !== listener);
};