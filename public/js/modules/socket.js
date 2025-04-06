// public/js/socket.js
const socket = io();

// 1) Registramos el rol del usuario tras conectarse
//    Pero necesitamos saber el rol real: lo hacemos en initSocket(...) y le pasamos "loggedUser"
function initClientSocket(loggedUser) {
  if (!loggedUser || !loggedUser.role) return;
  socket.emit('registerRole', loggedUser.role);
}

export { socket, initClientSocket };
