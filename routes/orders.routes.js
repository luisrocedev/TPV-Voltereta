// routes/orders.routes.js
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');

const { db } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Middleware para validación de campos
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Crear pedido (admin, gerente o mesero pueden crearlo)
router.post(
  '/',
  verifyToken,
  checkRole('admin', 'gerente', 'mesero'),  // <--- Cambiado aquí
  [
    body('tableNumber').isNumeric().withMessage('El número de mesa debe ser numérico'),
    body('customer').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('comments').optional().isString(),
    body('items').isArray().withMessage('Los items deben ser un arreglo'),
    body('items.*.menuItemId').isNumeric().withMessage('El ID del plato debe ser numérico'),
    body('items.*.quantity').isNumeric().withMessage('La cantidad debe ser numérica')
  ],
  validateFields,
  (req, res) => {
    const { tableNumber, customer, comments, items } = req.body;
    const sqlOrder = 'INSERT INTO orders (tableNumber, customer, comments, status) VALUES (?, ?, ?, ?)';
    // Al crear, el estado inicial es "pedido_realizado"
    db.query(sqlOrder, [tableNumber, customer, comments, 'pedido_realizado'], (err, orderResult) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al crear pedido' });
      const newOrderId = orderResult.insertId;
      const itemsData = (items || []).map(it => [newOrderId, it.menuItemId, it.quantity]);
      if (!itemsData.length) {
        return res.json({ success: true, orderId: newOrderId });
      }
      const sqlItems = 'INSERT INTO order_items (orderId, menuItemId, quantity) VALUES ?';
      db.query(sqlItems, [itemsData], (itemsErr) => {
        if (itemsErr) return res.status(500).json({ success: false, message: 'Error al crear items del pedido' });
        res.json({ success: true, orderId: newOrderId });
      });
    });
  }
);

// Obtener pedidos (para cualquier usuario autenticado)
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT * FROM orders ORDER BY createdAt DESC', (err, orders) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
    if (!orders.length) return res.json({ success: true, data: [] });
    const orderIds = orders.map(o => o.id);
    const sqlItems = `
      SELECT oi.id, oi.orderId, oi.menuItemId, oi.quantity, m.name AS menuName
      FROM order_items oi
      JOIN menu m ON oi.menuItemId = m.id
      WHERE oi.orderId IN (?)
    `;
    db.query(sqlItems, [orderIds], (itemsErr, items) => {
      if (itemsErr) return res.status(500).json({ success: false, message: 'Error al obtener items' });
      const result = orders.map(order => {
        const orderItems = items.filter(i => i.orderId === order.id).map(i => ({
          id: i.id,
          menuItemId: i.menuItemId,
          menuName: i.menuName,
          quantity: i.quantity
        }));
        return { ...order, items: orderItems };
      });
      res.json({ success: true, data: result });
    });
  });
});

// Actualizar estado del pedido
router.put(
  '/:id',
  verifyToken,
  [
    param('id').isNumeric().withMessage('El ID debe ser numérico'),
    body('status').notEmpty().withMessage('El estado es obligatorio')
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user.role;

    if (role === 'mesero') {
      // El mesero solo puede cancelar el pedido
      if (status !== 'cancelado') {
        return res.status(403).json({ success: false, message: 'El mesero solo puede cancelar el pedido (estado: cancelado)' });
      }
    } else if (role === 'chef') {
      // El chef puede actualizar a "en_proceso" o "finalizado"
      const validChef = ['en_proceso', 'finalizado'];
      if (!validChef.includes(status)) {
        return res.status(403).json({ success: false, message: 'El chef solo puede marcar el pedido como "en_proceso" o "finalizado"' });
      }
    } else if (role === 'admin' || role === 'gerente') {
      // Admin y Gerente pueden actualizar a "en_proceso" o "entregado"
      const validMgrAdm = ['en_proceso', 'entregado'];
      if (!validMgrAdm.includes(status)) {
        return res.status(400).json({ success: false, message: 'Estado inválido. Estados válidos: ' + validMgrAdm.join(', ') });
      }
    }

    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al actualizar pedido' });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      res.json({ success: true, message: 'Pedido actualizado a ' + status });
    });
  }
);

// Eliminar pedido (solo admin y gerente)
router.delete(
  '/:id',
  verifyToken,
  checkRole('admin', 'gerente'),
  [param('id').isNumeric().withMessage('El ID debe ser numérico')],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM orders WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al eliminar pedido' });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      res.json({ success: true, message: 'Pedido eliminado' });
    });
  }
);

module.exports = router;
