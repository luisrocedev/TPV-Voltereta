// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');

const { db, JWT_SECRET } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

/**
 * Middleware para manejar los errores de validación
 */
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, errors: errors.array() });
  }
  next();
};

// ====================== /register (solo admin) ======================
router.post(
  '/register',
  verifyToken,
  checkRole('admin'),
  [
    body('username')
      .notEmpty()
      .withMessage('El usuario es obligatorio'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es obligatoria'),
    body('role')
      .notEmpty()
      .withMessage('El rol es obligatorio'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('El correo debe ser válido'),
    body('fullname')
      .optional()
      .trim(),
    body('profile_pic')
      .optional()
      .isURL()
      .withMessage('La URL de la foto debe ser válida')
  ],
  validateFields,
  async (req, res) => {
    const { username, password, role, fullname, email, profile_pic } = req.body;

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
  }
);

// ====================== /login ======================
router.post(
  '/login',
  [
    body('username')
      .notEmpty()
      .withMessage('El usuario es obligatorio'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es obligatoria')
  ],
  validateFields,
  (req, res) => {
    const { username, password } = req.body;
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
  }
);

// ====================== /update-password (cambiar PASS) ======================
router.put(
  '/update-password',
  verifyToken,
  [
    body('oldPassword')
      .notEmpty()
      .withMessage('La contraseña antigua es obligatoria'),
    body('newPassword')
      .notEmpty()
      .withMessage('La nueva contraseña es obligatoria')
  ],
  validateFields,
  async (req, res) => {
    const { oldPassword, newPassword } = req.body;
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
  }
);

// ====================== /myprofile (Usuario sube su propia foto) ======================
router.put(
  '/myprofile',
  verifyToken,
  [
    body('profile_pic')
      .notEmpty()
      .withMessage('Falta la URL de la foto')
      .isURL()
      .withMessage('La URL de la foto debe ser válida')
  ],
  validateFields,
  (req, res) => {
    // El usuario NO admin puede cambiar solo su foto de perfil
    if (req.user.role === 'admin' || req.user.role === 'gerente') {
      return res.status(403).json({ success: false, message: 'Usa /update-user/:id si eres admin/gerente.' });
    }
  
    const userId = req.user.id;
    const { profile_pic } = req.body;
    const sql = 'UPDATE users SET profile_pic = ? WHERE id = ?';
    db.query(sql, [profile_pic, userId], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error en DB' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      res.json({ success: true, message: 'Foto de perfil actualizada' });
    });
  }
);

// ====================== /update-user/:id (Solo admin/gerente) ======================
router.put(
  '/update-user/:id',
  verifyToken,
  checkRole('admin','gerente'),
  [
    param('id')
      .isNumeric()
      .withMessage('El ID debe ser numérico'),
    body('full_name')
      .optional()
      .trim(),
    body('email')
      .optional()
      .isEmail()
      .withMessage('El correo debe ser válido'),
    body('profile_pic')
      .optional()
      .isURL()
      .withMessage('La URL de la foto debe ser válida')
  ],
  validateFields,
  (req, res) => {
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
  }
);

module.exports = router;
