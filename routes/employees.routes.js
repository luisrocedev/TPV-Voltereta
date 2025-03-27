const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Obtener todos los empleados
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener empleados' });
    res.json({ success: true, data: results });
  });
});

// Crear un nuevo empleado
router.post('/', verifyToken, checkRole('admin', 'gerente'), (req, res) => {
  const { name, role } = req.body;
  const sql = 'INSERT INTO employees (name, role) VALUES (?, ?)';
  db.query(sql, [name, role], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear empleado' });
    res.json({ success: true, newId: result.insertId });
  });
});

// Actualizar empleado existente
router.put('/:id', verifyToken, checkRole('admin', 'gerente'), (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  const sql = 'UPDATE employees SET name = ?, role = ? WHERE id = ?';
  db.query(sql, [name, role, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true, message: 'Empleado actualizado' });
  });
});

// Eliminar empleado
router.delete('/:id', verifyToken, checkRole('admin', 'gerente'), (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM employees WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true, message: 'Empleado eliminado' });
  });
});

module.exports = router;
