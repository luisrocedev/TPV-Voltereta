// routes/reports.routes.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken } = require('../middlewares/auth');

// No se requieren validaciones para este GET ya que no recibe parámetros

// Obtener reportes de reservas e ingresos
router.get('/', verifyToken, (req, res) => {
  const sql1 = 'SELECT COUNT(*) AS totalRes FROM reservations';
  db.query(sql1, (err, r1) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en reservations' });
    const totalReservations = r1[0].totalRes;

    const sql2 = 'SELECT IFNULL(SUM(total), 0) AS totalRevenue FROM invoices';
    db.query(sql2, (err2, r2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Error en invoices' });
      const totalRevenue = r2[0].totalRevenue;
      res.json({ success: true, totalReservations, totalRevenue });
    });
  });
});

module.exports = router;
