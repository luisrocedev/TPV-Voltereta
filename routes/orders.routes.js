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
    body('tableNumber')
      .isNumeric().withMessage('El número de mesa debe ser numérico'),
    body('customer')
      .notEmpty().withMessage('El nombre del cliente es obligatorio')
      .trim()
      .escape(),
    body('comments')
      .optional()
      .trim()
      .escape(),
    body('items')
      .isArray({ min: 1 }).withMessage('Debes agregar al menos un plato'),
    body('items.*.menuItemId')
      .isNumeric().withMessage('El ID del plato debe ser numérico'),
    body('items.*.quantity')
      .isNumeric().withMessage('La cantidad debe ser numérica')
  ],
  validateFields,
  async (req, res) => {
    const { tableNumber, customer, comments, items } = req.body;
    // Validar que todos los menuItemId existen en la tabla menu
    const menuIds = items.map(it => it.menuItemId);
    const placeholders = menuIds.map(() => '?').join(',');
    db.query(`SELECT id FROM menu WHERE id IN (${placeholders})`, menuIds, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al validar platos' });
      if (result.length !== menuIds.length) {
        return res.status(400).json({ success: false, message: 'Uno o más platos seleccionados no existen en el menú actual.' });
      }

      const sqlOrder = `
        INSERT INTO orders (tableNumber, customer, comments, status)
        VALUES (?, ?, ?, ?)
      `;
      db.query(sqlOrder, [tableNumber, customer, comments, 'pedido_realizado'], async (err, orderResult) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al crear pedido', error: err });
        }
        const newOrderId = orderResult.insertId;
        const itemsData = (items || []).map(it => [newOrderId, it.menuItemId, it.quantity]);
        
        if (!itemsData.length) {
          return res.json({ success: true, orderId: newOrderId });
        }

        const sqlItems = `
          INSERT INTO order_items (orderId, menuItemId, quantity)
          VALUES ?
        `;

        try {
          await new Promise((resolve, reject) => {
            db.query(sqlItems, [itemsData], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          // Obtener el pedido completo con sus items
          const sqlGet = `
            SELECT 
              o.*,
              oi.id as item_id,
              oi.menuItemId,
              oi.quantity,
              m.name as menu_name,
              m.price,
              (SELECT SUM(oi2.quantity * m2.price)
               FROM order_items oi2
               JOIN menu m2 ON oi2.menuItemId = m2.id
               WHERE oi2.orderId = o.id) as total
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.orderId
            LEFT JOIN menu m ON oi.menuItemId = m.id
            WHERE o.id = ?
          `;

          db.query(sqlGet, [newOrderId], (err, results) => {
            if (err) {
              return res.status(500).json({ success: false, message: 'Error al obtener el pedido creado' });
            }

            if (!results || !results.length) {
              return res.status(404).json({ success: false, message: 'No se pudo obtener el pedido creado' });
            }

            // Agrupar los items del pedido
            const items = results
              .filter(row => row.item_id) // Filtrar filas sin items
              .map(row => ({
                id: row.item_id,
                menuItemId: row.menuItemId,
                quantity: row.quantity,
                name: row.menu_name || '',
                price: parseFloat(row.price) || 0
              }));

            // Formatear la respuesta
            const orderResponse = {
              id: results[0].id,
              table_number: results[0].tableNumber,
              customer_name: results[0].customer,
              status: results[0].status,
              comments: results[0].comments,
              created_at: results[0].createdAt,
              items: items,
              total: results[0].total || 0
            };

            res.json({ 
              success: true, 
              message: 'Pedido creado exitosamente',
              data: orderResponse 
            });
          });
        } catch (error) {
          console.error('Error:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Error al crear el pedido',
            error: error.message 
          });
        }
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
      // Combinar pedidos con sus items y normalizar nombres de campos
      const result = orders.map(order => {
        const orderItems = items
          .filter(i => i.orderId === order.id)
          .map(i => ({
            id: i.id,
            menuItemId: i.menuItemId,
            name: i.menuName || '',
            price: parseFloat(i.price) || 0,
            quantity: i.quantity
          }));
        return {
          id: order.id,
          table_number: order.tableNumber,
          customer_name: order.customer,
          status: order.status,
          comments: order.comments,
          created_at: order.createdAt,
          items: orderItems
        };
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
    param('id')
      .isNumeric().withMessage('El ID debe ser numérico'),
    body('status')
      .notEmpty().withMessage('El estado es obligatorio')
      .trim()
      .escape()
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user.role;

    // Primero obtener el estado actual del pedido
    db.query('SELECT status FROM orders WHERE id = ?', [id], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al verificar estado del pedido' });
      }
      if (!results.length) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      }

      const currentStatus = results[0].status;

      // Validar transiciones permitidas según el rol
      if (role === 'mesero') {
        // Mesero solo puede cancelar pedidos en estado 'pedido_realizado'
        if (status !== 'cancelado') {
          return res.status(403).json({
            success: false,
            message: 'El mesero solo puede cancelar pedidos'
          });
        }
        if (currentStatus !== 'pedido_realizado') {
          return res.status(403).json({
            success: false,
            message: 'Solo se pueden cancelar pedidos en estado pendiente'
          });
        }
      } else if (role === 'chef') {
        // Chef: pedido_realizado -> en_proceso -> finalizado
        const validChef = ['en_proceso', 'finalizado'];
        if (!validChef.includes(status)) {
          return res.status(403).json({
            success: false,
            message: 'El chef solo puede cambiar a "en_proceso" o "finalizado"'
          });
        }
        if (status === 'en_proceso' && currentStatus !== 'pedido_realizado') {
          return res.status(403).json({
            success: false,
            message: 'Solo se pueden procesar pedidos pendientes'
          });
        }
        if (status === 'finalizado' && currentStatus !== 'en_proceso') {
          return res.status(403).json({
            success: false,
            message: 'Solo se pueden finalizar pedidos en proceso'
          });
        }
      } else if (role === 'admin' || role === 'gerente') {
        // Admin/gerente pueden realizar cualquier cambio excepto a estados inválidos
        const validAdm = ['en_proceso', 'cancelado', 'entregado', 'finalizado'];
        if (!validAdm.includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Estado inválido para admin/gerente'
          });
        }
        // No permitir cancelar o finalizar si ya está en cancelado o finalizado
        if ((currentStatus === 'cancelado' || currentStatus === 'finalizado') && (status === 'cancelado' || status === 'finalizado')) {
          return res.status(400).json({
            success: false,
            message: 'No se puede modificar un pedido ya cancelado o finalizado'
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

        // Obtener el pedido actualizado con sus items
        const sqlGet = `
          SELECT o.*, GROUP_CONCAT(oi.id, ':', oi.menuItemId, ':', oi.quantity, ':', m.name, ':', m.price) as items_data
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.orderId
          LEFT JOIN menu m ON oi.menuItemId = m.id
          WHERE o.id = ?
          GROUP BY o.id
        `;
        
        db.query(sqlGet, [id], (getErr, orders) => {
          if (getErr) {
            return res.status(500).json({ success: false, message: 'Error al obtener pedido actualizado' });
          }

          const order = orders[0];
          let items = [];
          if (order.items_data) {
            items = order.items_data.split(',').map(item => {
              const [id, menuItemId, quantity, name, price] = item.split(':');
              return { id, menuItemId, quantity, name, price: parseFloat(price) };
            });
          }
          delete order.items_data;
          order.items = items;

          // Emitir evento a mesero/chef
          const io = req.app.get('io');
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

          res.json({ 
            success: true, 
            message: 'Pedido actualizado a ' + status,
            data: order
          });
        });
      });
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
