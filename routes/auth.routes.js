// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { db, JWT_SECRET } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

// ====================== /register (solo admin) ======================
router.post('/register', verifyToken, checkRole('admin'), async (req, res) => {
  const { username, password, role, fullname, email, profile_pic } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, password, role, fullname, email, profile_pic)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
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
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno', error });
  }
});
  
  
  // ====================== /login ======================
  router.post('/login', (req, res) => {
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
  router.put('/update-password', verifyToken, async (req, res) => {
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
  router.put('/myprofile', verifyToken, (req, res) => {
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
  router.put('/update-user/:id', verifyToken, checkRole('admin','gerente'), (req, res) => {
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

module.exports = router;