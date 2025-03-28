// public/js/chat.js
import { socket } from './socket.js';

export function initChat() {
  const chatContainer = document.getElementById('chatContainer');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  if (!chatContainer || !chatInput || !chatSend) {
    // Si no existe la sección en esta página, salimos
    return;
  }

  chatSend.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) {
      socket.emit('chatMessage', msg);
      chatInput.value = '';
    }
  });

  socket.on('chatMessage', (message) => {
    const p = document.createElement('p');
    p.textContent = message;
    chatContainer.appendChild(p);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}
