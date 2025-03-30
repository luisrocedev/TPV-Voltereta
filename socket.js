// socket.js en la raíz
function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.on('chatMessage', (msg) => {
      io.emit('chatMessage', msg);
    });

    socket.on('newOrder', (data) => {
      io.emit('newOrder', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });
}

module.exports = { initSocket };
