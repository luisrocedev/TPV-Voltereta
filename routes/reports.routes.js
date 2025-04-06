// routes/reports.routes.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Caché simple en memoria
let reportCache = null;
let reportCacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 60 segundos

// Obtener reportes de reservas e ingresos
// Solo los roles admin y gerente podrán acceder a esta ruta.
router.get('/', verifyToken, checkRole('admin', 'gerente'), (req, res) => {
  const now = Date.now();
  if (reportCache && (now - reportCacheTimestamp) < CACHE_DURATION) {
    return res.json(reportCache);
  }

  const sql1 = 'SELECT COUNT(*) AS totalRes FROM reservations';
  db.query(sql1, (err, r1) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en reservations' });
    const totalReservations = r1[0].totalRes;

    const sql2 = 'SELECT IFNULL(SUM(total), 0) AS totalRevenue FROM invoices';
    db.query(sql2, (err2, r2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Error en invoices' });
      const totalRevenue = r2[0].totalRevenue;
      const result = { success: true, totalReservations, totalRevenue };

      // Guardamos en caché
      reportCache = result;
      reportCacheTimestamp = Date.now();
      res.json(result);
    });
  });
});

module.exports = router;
