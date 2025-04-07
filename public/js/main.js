// public/js/main.js
// Tareas globales

import { socket, initClientSocket } from './modules/socket.js';

socket.on('orderStatusChanged', (payload) => {
  showOrderStatusNotification(payload);
});

function showOrderStatusNotification({ orderId, newStatus, changedBy }) {
  const notif = document.createElement('div');
  // Aquí podrías aplicar estilos personalizados
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

  // Registrar el rol en Socket.IO
  initClientSocket(loggedUser);

  // Establecer el nombre del usuario en la top-bar (si existe en dashboard.html)
  const topBarUserName = document.getElementById('topBarUserName');
  if (topBarUserName) {
    topBarUserName.textContent = loggedUser.fullname || loggedUser.username;
  }

  // Inicializar autenticación (global) con la nueva ruta del módulo
  import('./modules/auth.js').then(module => module.initAuth(token, loggedUser));

  // Aquí podrías inicializar otros módulos si es necesario, por ejemplo:
  // import('./modules/menu.js').then(module => module.initMenu(token));
  // import('./modules/orders.js').then(module => module.initOrders(token, loggedUser));
  
  // Nota: La carga de partials se sigue realizando en el script de dashboard.html
}
