// routes/cash.routes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const { db } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Middleware para validación
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, errors: errors.array() });
  }
  next();
};

// Obtener movimientos de caja
router.get('/', verifyToken, checkRole('admin', 'gerente'), (req, res) => {
  db.query('SELECT * FROM cash_flow ORDER BY createdAt DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener caja' });
    res.json({ success: true, data: results });
  });
});

// Registrar movimiento en caja
router.post(
  '/',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    body('type')
      .notEmpty()
      .withMessage('El tipo es obligatorio'),
    body('amount')
      .isNumeric()
      .withMessage('El monto debe ser numérico'),
    body('concept')
      .optional()
      .isString()
  ],
  validateFields,
  (req, res) => {
    const { type, amount, concept } = req.body;
    const sql = 'INSERT INTO cash_flow (type, amount, concept) VALUES (?, ?, ?)';
    db.query(sql, [type, amount, concept], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al registrar en caja' });
      res.json({ success: true, newId: result.insertId });
    });
  }
);

module.exports = router;
