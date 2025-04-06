// public/js/main.js
// Tareas globales
import { socket, initClientSocket } from './socket.js';

socket.on('orderStatusChanged', (payload) => {
  showOrderStatusNotification(payload);
});

function showOrderStatusNotification({ orderId, newStatus, changedBy }) {
  const notif = document.createElement('div');
  // ... estilo ...
  notif.textContent = `El pedido #${orderId} se actualizó a "${newStatus}" por ${changedBy}`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}
const token = localStorage.getItem('token');
const userData = localStorage.getItem('loggedUser');
if (!token || !userData) {
  window.location.href = 'login.html';
} else {
  const loggedUser = JSON.parse(userData);

    // 1) Registramos el rol en socket
    initClientSocket(loggedUser);

  // Establecer el nombre del usuario en la top-bar (este elemento se encuentra en dashboard.html)
  const topBarUserName = document.getElementById('topBarUserName');
  if (topBarUserName) {
    topBarUserName.textContent = loggedUser.fullname || loggedUser.username;
  }

  // Inicializar autenticación (global)
  import('./auth.js').then(module => module.initAuth(token, loggedUser));

  // Configurar cualquier otra tarea global (por ejemplo, configuración de socket o menú hamburguesa global)
  // NOTA: La carga de partials se realiza en el script de dashboard.html
}
