/***************************************************************
 * server.js - Proyecto Monolítico
 * Incorpora:
 *   - Campos avanzados de usuario
 *   - Menú con Categorías (NUEVO)
 *   - CRUD (Empleados, Reservas, Pedidos, etc.)
 *   - Roles con JWT + bcrypt
 *   - Chat con Socket.IO
 ***************************************************************/
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');


// Importamos nuestra conexión a la BD (db.js)
const { db } = require('./db');
const { verifyToken, checkRole } = require('./middlewares/auth');


// Importamos las rutas de la carpeta /routes
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const employeesRoutes = require('./routes/employees.routes');
const invoicesRoutes = require('./routes/invoices.routes');
const ordersRoutes = require('./routes/orders.routes');
const reportsRoutes = require('./routes/reports.routes');
const reservationRoutes = require('./routes/reservation.routes');
const cashRoutes = require('./routes/cash.routes');

// Creamos la app de Express y el servidor HTTP
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());

// Servimos la carpeta 'public' (HTML, CSS, JS front)
app.use(express.static('public'));

// Redirigir '/' a '/login.html' como página de inicio
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Montamos las rutas: cada ruta se monta con un prefijo, p.e. /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/cash', cashRoutes);

// ====================== BACKUP (placeholder) ======================
app.post('/backup', verifyToken, checkRole('admin'),(req,res)=>{
  res.json({success:true,message:'Backup placeholder'});
});


const { initSocket } = require('./socket');
initSocket(io); // para inicializar la lógica del socket


// Finalmente, arrancamos el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});