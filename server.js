// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
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
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// 1) Guardar la instancia de Socket.IO para usarla en las rutas
app.set('io', io);

// Configuración de CORS para permitir solicitudes cross-origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',  // En producción, usar dominio específico
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Configuración de archivos estáticos
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, { 
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Ruta específica para uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), {
  maxAge: '1d',
  etag: true
}));

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

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Inicializar socket
const { initSocket } = require('./socket');
initSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
