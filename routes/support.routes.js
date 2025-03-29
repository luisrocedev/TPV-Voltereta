// routes/support.routes.js
const express = require('express');
const router = express.Router();
const { db } = require('../db'); // Conexión a la base de datos
const { verifyToken, checkRole } = require('../middlewares/auth');

/**
 * GET /
 * Devuelve información sobre cómo acceder al soporte técnico.
 */
router.get('/', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Para soporte técnico, envía un ticket a través de POST /api/support/ticket. Consulta la documentación en /docs/SoporteYMantenimiento.md"
  });
});

/**
 * POST /ticket
 * Permite a un usuario autenticado crear un ticket de soporte.
 */
router.post('/ticket', verifyToken, (req, res) => {
  const { subject, description } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ success: false, message: "Se requieren 'subject' y 'description'" });
  }
  
  const sql = `
    INSERT INTO support_tickets (user_id, subject, description)
    VALUES (?, ?, ?)
  `;
  const values = [req.user.id, subject, description];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar ticket:', err);
      return res.status(500).json({ success: false, message: 'Error al crear ticket' });
    }
    // Recuperamos el ticket recién creado
    const ticketId = result.insertId;
    const selectSql = `SELECT * FROM support_tickets WHERE id = ?`;
    db.query(selectSql, [ticketId], (selectErr, rows) => {
      if (selectErr) {
        return res.status(500).json({ success: false, message: 'Error al recuperar el ticket' });
      }
      res.json({ success: true, ticket: rows[0] });
    });
  });
});

/**
 * GET /tickets
 * Permite a administradores o gerentes consultar todos los tickets de soporte.
 */
router.get('/tickets', verifyToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ success: false, message: "No autorizado" });
  }
  
  const sql = `SELECT * FROM support_tickets ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener tickets' });
    }
    res.json({ success: true, tickets: results });
  });
});

/**
 * PUT /ticket/:id
 * Permite actualizar el estado de un ticket (por ejemplo, de "abierto" a "cerrado").
 * Se espera un campo "status" en el body con un valor válido.
 */
// routes/support.routes.js
router.put('/ticket/:id', verifyToken, checkRole('admin', 'gerente'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['abierto', 'en_proceso', 'cerrado'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ') });
  }

  const sql = 'UPDATE support_tickets SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el ticket:', err);
      return res.status(500).json({ success: false, message: 'Error al actualizar ticket' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ticket no encontrado' });
    }
    res.json({ success: true, message: `Ticket actualizado a ${status}` });
  });
});

module.exports = router;
