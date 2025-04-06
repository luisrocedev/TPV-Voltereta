// socket.js en la raíz
function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    // 1) Recibir el rol del usuario y unirlo a la "room" correspondiente
    socket.on('registerRole', (role) => {
      if (role === 'chef') {
        socket.join('chefRoom');
      } else if (role === 'mesero') {
        socket.join('meseroRoom');
      }
      console.log(`Socket ${socket.id} se unió a la sala de rol ${role}`);
    });

    // Ejemplo: recibir mensajes de chat
    socket.on('chatMessage', (msg) => {
      io.emit('chatMessage', msg);
    });

    socket.on('newOrder', (data) => {
      // Notificamos a los "chef" y "mesero" que hay un nuevo pedido
      io.to('chefRoom').emit('newOrder', data);
      io.to('meseroRoom').emit('newOrder', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });
}

module.exports = { initSocket };
