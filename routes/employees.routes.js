// routes/employees.routes.js
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');

const { db } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, errors: errors.array() });
  }
  next();
};

// Obtener todos los empleados
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener empleados' });
    res.json({ success: true, data: results });
  });
});

// Crear un nuevo empleado
router.post(
  '/',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    body('name')
      .notEmpty()
      .withMessage('El nombre es obligatorio'),
    body('role')
      .notEmpty()
      .withMessage('El rol es obligatorio')
  ],
  validateFields,
  (req, res) => {
    const { name, role } = req.body;
    const sql = 'INSERT INTO employees (name, role) VALUES (?, ?)';
    db.query(sql, [name, role], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al crear empleado' });
      res.json({ success: true, newId: result.insertId });
    });
  }
);

// Actualizar empleado existente
router.put(
  '/:id',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    param('id')
      .isNumeric()
      .withMessage('El ID debe ser numérico'),
    body('name')
      .notEmpty()
      .withMessage('El nombre es obligatorio'),
    body('role')
      .notEmpty()
      .withMessage('El rol es obligatorio')
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const { name, role } = req.body;
    const sql = 'UPDATE employees SET name = ?, role = ? WHERE id = ?';
    db.query(sql, [name, role, id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      res.json({ success: true, message: 'Empleado actualizado' });
    });
  }
);

// Eliminar empleado
router.delete(
  '/:id',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    param('id')
      .isNumeric()
      .withMessage('El ID debe ser numérico')
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM employees WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      res.json({ success: true, message: 'Empleado eliminado' });
    });
  }
);

module.exports = router;
