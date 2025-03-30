const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');
const { db, JWT_SECRET } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // Middleware de subida de imagen

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ====================== Registro (solo admin) ======================
router.post(
  '/register',
  verifyToken,
  checkRole('admin'),
  [
    body('username').notEmpty().withMessage('El usuario es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    body('role').notEmpty().withMessage('El rol es obligatorio'),
    body('email').optional().isEmail(),
    body('fullname').optional().trim(),
    body('profile_pic').optional().isURL()
  ],
  validateFields,
  async (req, res) => {
    const { username, password, role, fullname, email, profile_pic } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const sql = `INSERT INTO users (username, password, role, fullname, email, profile_pic) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(sql, [username, hashed, role, fullname || null, email || null, profile_pic || null], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en la base de datos', error: err.sqlMessage });
        res.json({ success: true, userId: result.insertId });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno', error });
    }
  }
);

// ====================== Login ======================
router.post(
  '/login',
  [
    body('username').notEmpty(),
    body('password').notEmpty()
  ],
  validateFields,
  (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Error en DB' });
      if (!results.length) return res.status(401).json({ success: false, message: 'Usuario no existe' });
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

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
  }
);

// ====================== Cambiar contraseña ======================
router.put(
  '/update-password',
  verifyToken,
  [
    body('oldPassword').notEmpty(),
    body('newPassword').notEmpty()
  ],
  validateFields,
  async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
      const userId = req.user.id;
      db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en DB' });
        if (!results.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        const match = await bcrypt.compare(oldPassword, results[0].password);
        if (!match) return res.status(401).json({ success: false, message: 'Contraseña anterior incorrecta' });

        const hashed = await bcrypt.hash(newPassword, 10);
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId], (err2) => {
          if (err2) return res.status(500).json({ success: false, message: 'Error al actualizar pass' });
          res.json({ success: true, message: 'Contraseña actualizada' });
        });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno' });
    }
  }
);

// ====================== Subida de foto de perfil (archivo local) ======================
router.post('/upload-photo', verifyToken, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No se subió ninguna imagen' });

  const photoUrl = `/uploads/profile_pics/${req.file.filename}`;
  db.query('UPDATE users SET profile_pic = ? WHERE id = ?', [photoUrl, req.user.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al guardar URL' });
    res.json({ success: true, photoUrl });
  });
});

module.exports = router;
