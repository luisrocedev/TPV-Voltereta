// routes/employees.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, param, validationResult } = require('express-validator');
const { db } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Obtener todos los empleados (usuarios)
// Solo los roles admin y gerente podrán acceder a esta ruta.
router.get('/', verifyToken, checkRole('admin', 'gerente'), (req, res) => {
  const sql = 'SELECT id, username, role, fullname, email, profile_pic FROM users';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener empleados' });
    res.json({ success: true, data: results });
  });
});

// Crear un nuevo empleado (usuario)
router.post(
  '/',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    body('username').notEmpty().withMessage('El usuario es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    body('role').notEmpty().withMessage('El rol es obligatorio')
  ],
  validateFields,
  async (req, res) => {
    const { username, password, role, fullname, email, profile_pic } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO users (username, password, role, fullname, email, profile_pic) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(sql, [username, hashed, role, fullname || null, email || null, profile_pic || null], (err, result) => {
        if (err)
          return res.status(500).json({ success: false, message: 'Error al crear empleado', error: err.sqlMessage });
        res.json({ success: true, newId: result.insertId });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno', error });
    }
  }
);

// Actualizar empleado (usuario)
router.put(
  '/:id',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    param('id').isNumeric().withMessage('El ID debe ser numérico'),
    body('username').notEmpty().withMessage('El usuario es obligatorio'),
    body('role').notEmpty().withMessage('El rol es obligatorio')
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const { username, role, fullname, email, profile_pic } = req.body;
    const sql = 'UPDATE users SET username = ?, role = ?, fullname = ?, email = ?, profile_pic = ? WHERE id = ?';
    db.query(sql, [username, role, fullname || null, email || null, profile_pic || null, id], (err, result) => {
      if (err)
        return res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
      if (result.affectedRows === 0)
        return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      res.json({ success: true, message: 'Empleado actualizado' });
    });
  }
);

// Eliminar empleado (usuario)
router.delete(
  '/:id',
  verifyToken,
  checkRole('admin', 'gerente'),
  [param('id').isNumeric().withMessage('El ID debe ser numérico')],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err)
        return res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
      if (result.affectedRows === 0)
        return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      res.json({ success: true, message: 'Empleado eliminado' });
    });
  }
);

module.exports = router;
