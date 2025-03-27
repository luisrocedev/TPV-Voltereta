const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken } = require('../middlewares/auth');

// Crear factura
router.post('/', verifyToken, (req, res) => {
  const { orderId, total } = req.body;
  const sql = 'INSERT INTO invoices (orderId, total) VALUES (?, ?)';
  db.query(sql, [orderId, total], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error generar factura' });
    res.json({ success: true, invoiceId: result.insertId });
  });
});

// Obtener facturas
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT * FROM invoices ORDER BY createdAt DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener facturas' });
    res.json({ success: true, data: results });
  });
});

module.exports = router;
