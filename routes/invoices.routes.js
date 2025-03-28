// routes/invoices.routes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const { db } = require('../db');
const { verifyToken } = require('../middlewares/auth');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, errors: errors.array() });
  }
  next();
};

// Crear factura
router.post(
  '/',
  verifyToken,
  [
    body('orderId')
      .isNumeric()
      .withMessage('El ID del pedido debe ser numérico'),
    body('total')
      .isNumeric()
      .withMessage('El total debe ser numérico')
  ],
  validateFields,
  (req, res) => {
    const { orderId, total } = req.body;
    const sql = 'INSERT INTO invoices (orderId, total) VALUES (?, ?)';
    db.query(sql, [orderId, total], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error generar factura' });
      res.json({ success: true, invoiceId: result.insertId });
    });
  }
);

// Obtener facturas
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT * FROM invoices ORDER BY createdAt DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener facturas' });
    res.json({ success: true, data: results });
  });
});

module.exports = router;
