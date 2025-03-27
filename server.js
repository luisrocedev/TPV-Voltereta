/***************************************************************
 * server.js - Proyecto Monolítico
 * Incorpora:
 *   - Campos avanzados de usuario (full_name, email, profile_pic)
 *   - Sección Mi Perfil (cada user puede cambiar SOLO su foto)
 *   - Endpoint /myprofile (usuario no admin)
 *   - Endpoint /update-user/:id (admin/gerente) edita otro user
 *   - Endpoint /update-password
 *   - CRUD (Menú, Empleados, Reservas, Pedidos, Facturas, Caja)
 *   - Roles con JWT + bcrypt
 *   - Chat con Socket.IO
 *
 * NOTA: Mantenemos tu código y estilo. 
 ***************************************************************/
const express = require('express');
const mysql = require('mysql2');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());

// ====================== Config ======================
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || 'root';
const DB_NAME = process.env.DB_NAME || 'voltereta_db';
const JWT_SECRET = process.env.JWT_SECRET || 'S3cr3tJWT';
const PORT = process.env.PORT || 3000;

// Conexión MySQL
const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME
});
db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
    process.exit(1);
  }
  console.log('🟢 Conectado a la base de datos:', DB_NAME);
});

// Servimos carpeta public
app.use(express.static('public'));

// Redirigir '/' a '/login.html'
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ====================== MIDDLEWARE JWT ======================
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ success: false, message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido' });
    req.user = decoded; // { id, username, role, ... }
    next();
  });
}
function checkRole(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Se requiere rol: ${allowed.join(' o ')}` });
    }
    next();
  };
}

// ====================== /register ======================
app.post('/register', async (req, res) => {
  const { username, password, role, fullname, email, profile_pic } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  const hashed = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (username, password, role, fullname, email, profile_pic)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Establecer valores por defecto adecuados (null si no se proporciona)
  const userData = [
    username,
    hashed,
    role,
    fullname || null,
    email || null,
    profile_pic || null
  ];

  db.query(sql, userData, (err, result) => {
    if (err) {
      console.error('Error en inserción BD:', err);
      return res.status(500).json({ success: false, message: 'Error en la base de datos', error: err.sqlMessage });
    }
    return res.json({ success: true, userId: result.insertId });
  });
});


// ====================== /login ======================
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'Faltan datos' });
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en DB' });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'Usuario no existe' });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        fullname: user.full_name,
        email: user.email,
        photo: user.profile_pic
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullname: user.full_name,
        email: user.email,
        photo: user.profile_pic
      }
    });
  });
});

// ====================== /update-password (cambiar PASS) ======================
app.put('/update-password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Faltan contraseñas' });
  }
  try {
    const userId = req.user.id;
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [userId], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Error en DB' });
      if (results.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      const user = results[0];
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) return res.status(401).json({ success: false, message: 'Contraseña anterior incorrecta' });

      const hashed = await bcrypt.hash(newPassword, 10);
      const sqlUpd = 'UPDATE users SET password = ? WHERE id = ?';
      db.query(sqlUpd, [hashed, userId], (err2) => {
        if (err2) return res.status(500).json({ success: false, message: 'Error al actualizar pass' });
        res.json({ success: true, message: 'Contraseña actualizada' });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

// ====================== /myprofile (Usuario sube su propia foto) ======================
app.put('/myprofile', verifyToken, (req, res) => {
  // El usuario NO admin puede cambiar solo su foto de perfil
  if (req.user.role === 'admin' || req.user.role === 'gerente') {
    // admin/gerente pueden usar /update-user en su lugar
    return res.status(403).json({ success: false, message: 'Usa /update-user/:id si eres admin/gerente.' });
  }

  const userId = req.user.id;
  const { profile_pic } = req.body;
  if (!profile_pic) {
    return res.status(400).json({ success: false, message: 'Falta la URL de la foto' });
  }
  const sql = 'UPDATE users SET profile_pic = ? WHERE id = ?';
  db.query(sql, [profile_pic, userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en DB' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, message: 'Foto de perfil actualizada' });
  });
});

// ====================== /update-user/:id (Solo admin/gerente) ======================
app.put('/update-user/:id', verifyToken, checkRole('admin','gerente'), (req, res) => {
  // Permite cambiar full_name, email, profile_pic, etc.
  const { id } = req.params;
  const { full_name, email, profile_pic } = req.body;
  const sql = 'UPDATE users SET full_name = ?, email = ?, profile_pic = ? WHERE id = ?';
  db.query(sql, [full_name || '', email || '', profile_pic || '', id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en DB' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, message: 'Usuario actualizado' });
  });
});


// ====================== MENÚ (CRUD) ======================
app.get('/menu', verifyToken, (req, res) => {
  db.query('SELECT * FROM menu', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener menú' });
    res.json({ success: true, data: results });
  });
});
app.post('/menu', verifyToken, checkRole('admin','gerente'), (req, res) => {
  const { name, price } = req.body;
  const sql = 'INSERT INTO menu (name, price) VALUES (?, ?)';
  db.query(sql, [name, price], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al insertar plato' });
    res.json({ success: true, newId: result.insertId });
  });
});
app.put('/menu/:id', verifyToken, checkRole('admin','gerente'), (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const sql = 'UPDATE menu SET name = ?, price = ? WHERE id = ?';
  db.query(sql, [name, price, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar plato' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Plato no encontrado' });
    res.json({ success: true, message: 'Plato actualizado' });
  });
});
app.delete('/menu/:id', verifyToken, checkRole('admin','gerente'), (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM menu WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar plato' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Plato no encontrado' });
    res.json({ success: true, message: 'Plato eliminado' });
  });
});

// ====================== EMPLEADOS (CRUD) ======================
app.get('/employees', verifyToken, (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener empleados' });
    res.json({ success: true, data: results });
  });
});
app.post('/employees', verifyToken, checkRole('admin','gerente'), (req, res) => {
  const { name, role } = req.body;
  const sql = 'INSERT INTO employees (name, role) VALUES (?, ?)';
  db.query(sql, [name, role], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear empleado' });
    res.json({ success: true, newId: result.insertId });
  });
});
app.put('/employees/:id', verifyToken, checkRole('admin','gerente'), (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  const sql = 'UPDATE employees SET name = ?, role = ? WHERE id = ?';
  db.query(sql, [name, role, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true, message: 'Empleado actualizado' });
  });
});
app.delete('/employees/:id', verifyToken, checkRole('admin','gerente'), (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM employees WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true, message: 'Empleado eliminado' });
  });
});

// ====================== RESERVAS (CRUD) ======================
app.get('/reservations', verifyToken, (req, res) => {
  db.query('SELECT * FROM reservations', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener reservas' });
    res.json({ success: true, data: results });
  });
});
app.post('/reservations', verifyToken, (req, res) => {
  const { customerName, date, time, guests } = req.body;
  const sql = 'INSERT INTO reservations (customerName, date, time, guests) VALUES (?, ?, ?, ?)';
  db.query(sql, [customerName, date, time, guests], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear reserva' });
    res.json({ success: true, newId: result.insertId });
  });
});
app.put('/reservations/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { customerName, date, time, guests } = req.body;
  const sql = 'UPDATE reservations SET customerName = ?, date = ?, time = ?, guests = ? WHERE id = ?';
  db.query(sql, [customerName, date, time, guests, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar reserva' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    res.json({ success: true, message: 'Reserva actualizada' });
  });
});
app.delete('/reservations/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM reservations WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar reserva' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    res.json({ success: true, message: 'Reserva eliminada' });
  });
});

// ====================== PEDIDOS (orders + order_items) ======================
app.post('/orders', verifyToken, (req, res) => {
  const { tableNumber, customer, comments, items } = req.body;
  const sqlOrder = 'INSERT INTO orders (tableNumber, customer, comments) VALUES (?, ?, ?)';
  db.query(sqlOrder, [tableNumber, customer, comments], (err, orderResult) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear pedido' });
    const newOrderId = orderResult.insertId;
    const itemsData = (items || []).map(it => [newOrderId, it.menuItemId, it.quantity]);
    if (!itemsData.length) {
      return res.json({ success: true, orderId: newOrderId });
    }
    const sqlItems = 'INSERT INTO order_items (orderId, menuItemId, quantity) VALUES ?';
    db.query(sqlItems, [itemsData], (itemsErr) => {
      if (itemsErr) return res.status(500).json({ success: false, message: 'Error al crear items del pedido' });
      res.json({ success: true, orderId: newOrderId });
    });
  });
});
app.get('/orders', verifyToken, (req, res) => {
  db.query('SELECT * FROM orders ORDER BY createdAt DESC', (err, orders) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
    if (!orders.length) return res.json({ success: true, data: [] });
    const orderIds = orders.map(o => o.id);
    const sqlItems = `
      SELECT oi.id, oi.orderId, oi.menuItemId, oi.quantity, m.name AS menuName
      FROM order_items oi
      JOIN menu m ON oi.menuItemId = m.id
      WHERE oi.orderId IN (?)
    `;
    db.query(sqlItems, [orderIds], (itemsErr, items) => {
      if (itemsErr) return res.status(500).json({ success: false, message: 'Error al obtener items' });
      const result = orders.map(order => {
        const orderItems = items.filter(i => i.orderId === order.id).map(i=>({
          id:i.id,
          menuItemId:i.menuItemId,
          menuName:i.menuName,
          quantity:i.quantity
        }));
        return {...order, items:orderItems};
      });
      res.json({ success: true, data: result });
    });
  });
});
app.put('/orders/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const role = req.user.role;
  const validChef = ['in_process','done'];
  const validMesero = ['delivered'];
  const validMgrAdm = ['pending','in_process','done','delivered'];
  if (role==='chef' && !validChef.includes(status)) {
    return res.status(403).json({ success: false, message: 'Chef no puede marcar ' + status });
  }
  if (role==='mesero' && !validMesero.includes(status)) {
    return res.status(403).json({ success: false, message: 'Mesero no puede marcar ' + status });
  }
  if ((role==='admin'||role==='gerente') && !validMgrAdm.includes(status)) {
    return res.status(400).json({ success: false, message: 'Estado inválido' });
  }
  const sql='UPDATE orders SET status=? WHERE id=?';
  db.query(sql,[status,id],(err,result)=>{
    if(err)return res.status(500).json({success:false,message:'Error al actualizar pedido'});
    if(result.affectedRows===0)return res.status(404).json({success:false,message:'Pedido no encontrado'});
    res.json({success:true,message:'Pedido actualizado a '+status});
  });
});
app.delete('/orders/:id', verifyToken, checkRole('admin','gerente'), (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM orders WHERE id = ?';
  db.query(sql, [id], (err,result)=>{
    if(err)return res.status(500).json({success:false,message:'Error al eliminar pedido'});
    if(result.affectedRows===0)return res.status(404).json({success:false,message:'Pedido no encontrado'});
    res.json({success:true,message:'Pedido eliminado'});
  });
});

// ====================== FACTURAS (invoices) ======================
app.post('/invoices', verifyToken, (req, res)=>{
  const {orderId,total}=req.body;
  const sql='INSERT INTO invoices (orderId,total) VALUES(?,?)';
  db.query(sql,[orderId,total],(err,result)=>{
    if(err)return res.status(500).json({success:false,message:'Error generar factura'});
    res.json({success:true,invoiceId:result.insertId});
  });
});
app.get('/invoices', verifyToken,(req,res)=>{
  db.query('SELECT * FROM invoices ORDER BY createdAt DESC',(err,results)=>{
    if(err)return res.status(500).json({success:false,message:'Error al obtener facturas'});
    res.json({success:true,data:results});
  });
});

// ====================== REPORTES ======================
app.get('/reports', verifyToken,(req,res)=>{
  const sql1='SELECT COUNT(*) AS totalRes FROM reservations';
  db.query(sql1,(err,r1)=>{
    if(err)return res.status(500).json({success:false,message:'Error en reservations'});
    const totalReservations=r1[0].totalRes;
    const sql2='SELECT IFNULL(SUM(total),0) AS totalFacturado FROM invoices';
    db.query(sql2,(err2,r2)=>{
      if(err2)return res.status(500).json({success:false,message:'Error en invoices'});
      const totalRevenue=r2[0].totalFacturado;
      res.json({success:true,totalReservations, totalRevenue});
    });
  });
});

// ====================== CAJA (cash_flow) ======================
app.get('/cash', verifyToken, checkRole('admin','gerente'),(req,res)=>{
  db.query('SELECT * FROM cash_flow ORDER BY createdAt DESC',(err,results)=>{
    if(err)return res.status(500).json({success:false,message:'Error al obtener caja'});
    res.json({success:true,data:results});
  });
});
app.post('/cash', verifyToken, checkRole('admin','gerente'),(req,res)=>{
  const {type, amount, concept}=req.body; 
  const sql='INSERT INTO cash_flow (type,amount,concept) VALUES (?,?,?)';
  db.query(sql,[type,amount,concept],(err,result)=>{
    if(err)return res.status(500).json({success:false,message:'Error al registrar en caja'});
    res.json({success:true,newId:result.insertId});
  });
});

// ====================== BACKUP (placeholder) ======================
app.post('/backup', verifyToken, checkRole('admin'),(req,res)=>{
  res.json({success:true,message:'Backup placeholder'});
});

// ====================== SOCKET.IO (chat + pedidos) ======================
const serverIO = io.on('connection',(socket)=>{
  console.log(`Socket conectado: ${socket.id}`);
  socket.on('chatMessage',(msg)=>{
    io.emit('chatMessage',msg);
  });
  socket.on('newOrder',(data)=>{
    io.emit('newOrder',data);
  });
  socket.on('disconnect',()=>{
    console.log(`Socket desconectado: ${socket.id}`);
  });
});

// Iniciamos server
server.listen(PORT,()=>{
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
