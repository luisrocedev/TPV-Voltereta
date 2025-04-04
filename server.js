// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { db } = require('./db');
const { verifyToken, checkRole } = require('./middlewares/auth');

// Rutas
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const employeesRoutes = require('./routes/employees.routes');
const invoicesRoutes = require('./routes/invoices.routes');
const ordersRoutes = require('./routes/orders.routes');
const reportsRoutes = require('./routes/reports.routes');
const reservationRoutes = require('./routes/reservation.routes');
const cashRoutes = require('./routes/cash.routes');
const supportRoutes = require('./routes/support.routes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());

// Estáticos en /public
app.use(express.static('public', { maxAge: '1d' }));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Montamos rutas
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/cash', cashRoutes);
app.use('/api/support', supportRoutes);

// Backup placeholder
app.post('/backup', verifyToken, checkRole('admin'), (req, res) => {
  res.json({ success: true, message: 'Backup placeholder' });
});

// Socket.io
const { initSocket } = require('./socket');
initSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
