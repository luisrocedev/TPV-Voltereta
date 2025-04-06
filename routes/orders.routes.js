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

/**
 * Crear pedido:
 * Roles permitidos: admin, gerente, mesero.
 * Estado inicial: "pedido_realizado"
 */
router.post(
  '/',
  verifyToken,
  checkRole('admin', 'gerente', 'mesero'),
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

    // Insert principal del pedido
    const sqlOrder = `
      INSERT INTO orders (tableNumber, customer, comments, status)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sqlOrder, [tableNumber, customer, comments, 'pedido_realizado'], (err, orderResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al crear pedido', error: err });
      }
      const newOrderId = orderResult.insertId;

      // Insert items del pedido
      const itemsData = (items || []).map(it => [newOrderId, it.menuItemId, it.quantity]);
      if (!itemsData.length) {
        return res.json({ success: true, orderId: newOrderId });
      }
      const sqlItems = `
        INSERT INTO order_items (orderId, menuItemId, quantity)
        VALUES ?
      `;
      db.query(sqlItems, [itemsData], (itemsErr) => {
        if (itemsErr) {
          return res.status(500).json({ success: false, message: 'Error al crear items del pedido', error: itemsErr });
        }
        res.json({ success: true, orderId: newOrderId });
      });
    });
  }
);

/**
 * Obtener todos los pedidos (cualquier usuario autenticado)
 * Incluye sus items
 */
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT * FROM orders ORDER BY createdAt DESC', (err, orders) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
    }
    if (!orders.length) {
      return res.json({ success: true, data: [] });
    }

    const orderIds = orders.map(o => o.id);
    const sqlItems = `
      SELECT oi.id, oi.orderId, oi.menuItemId, oi.quantity, m.name AS menuName, m.price
      FROM order_items oi
      JOIN menu m ON oi.menuItemId = m.id
      WHERE oi.orderId IN (?)
    `;
    db.query(sqlItems, [orderIds], (itemsErr, items) => {
      if (itemsErr) {
        return res.status(500).json({ success: false, message: 'Error al obtener items de pedidos' });
      }
      // Combinar pedidos con sus items
      const result = orders.map(order => {
        const orderItems = items
          .filter(i => i.orderId === order.id)
          .map(i => ({
            id: i.id,
            menuItemId: i.menuItemId,
            menuName: i.menuName,
            price: i.price,
            quantity: i.quantity
          }));
        return { ...order, items: orderItems };
      });
      res.json({ success: true, data: result });
    });
  });
});

/**
 * Actualizar estado del pedido
 * - Mesero solo puede CANCELAR
 * - Chef: "pedido_realizado" -> "en_proceso", o "en_proceso" -> "finalizado"
 * - Admin/gerente: "pedido_realizado" -> "en_proceso" o "pedido_realizado" -> "cancelado",
 *                  "en_proceso" -> "entregado"
 *   (puedes ajustarlo a tu lógica)
 *
 * Emitimos un evento "orderStatusChanged" a meseroRoom y chefRoom
 */
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
      // Mesero solo -> cancelado
      if (status !== 'cancelado') {
        return res.status(403).json({
          success: false,
          message: 'El mesero solo puede poner el pedido en estado "cancelado"'
        });
      }
    } else if (role === 'chef') {
      // Chef puede "pedido_realizado" -> "en_proceso", o "en_proceso" -> "finalizado"
      const validChef = ['en_proceso', 'finalizado'];
      if (!validChef.includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'El chef solo puede poner el pedido en "en_proceso" o "finalizado"'
        });
      }
    } else if (role === 'admin' || role === 'gerente') {
      // Admin y gerente -> "en_proceso", "cancelado", "entregado"
      const validAdm = ['en_proceso', 'cancelado', 'entregado'];
      if (!validAdm.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido para admin/gerente. Debe ser "en_proceso", "cancelado" o "entregado"'
        });
      }
    }

    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar pedido', error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      }

      // Emitir evento a mesero/chef
      const io = req.app.get('io'); // Recuperar instancia de socket.io
      // Notificar a la sala "chefRoom" y "meseroRoom"
      io.to('chefRoom').emit('orderStatusChanged', {
        orderId: parseInt(id),
        newStatus: status,
        changedBy: role
      });
      io.to('meseroRoom').emit('orderStatusChanged', {
        orderId: parseInt(id),
        newStatus: status,
        changedBy: role
      });

      res.json({ success: true, message: 'Pedido actualizado a ' + status });
    });
  }
);

/**
 * Eliminar pedido (solo admin/gerente)
 */
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
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al eliminar pedido', error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      }
      res.json({ success: true, message: 'Pedido eliminado' });
    });
  }
);

module.exports = router;
