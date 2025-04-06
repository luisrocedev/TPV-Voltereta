// routes/menu.routes.js
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');

const { db } = require('../db');
const { verifyToken, checkRole } = require('../middlewares/auth');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, errors: errors.array() });
  }
  next();
};

// Obtener menú
router.get('/', verifyToken, (req, res) => {
  const sql = `
    SELECT m.id, m.name, m.price, m.category_id, c.name AS categoryName
    FROM menu m
    LEFT JOIN menu_categories c ON m.category_id = c.id
    ORDER BY m.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener menú' });
    res.json({ success: true, data: results });
  });
});

// Crear plato
router.post(
  '/',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    body('name')
      .notEmpty().withMessage('El nombre es obligatorio')
      .trim()
      .escape(),
    body('price')
      .isNumeric().withMessage('El precio debe ser numérico'),
    body('category_id')
      .optional()
      .isNumeric().withMessage('El ID de la categoría debe ser numérico')
  ],
  validateFields,
  (req, res) => {
    const { name, price, category_id } = req.body;
    const sql = 'INSERT INTO menu (name, price, category_id) VALUES (?, ?, ?)';
    db.query(sql, [name, price, category_id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al insertar plato' });
      res.json({ success: true, newId: result.insertId });
    });
  }
);


// Actualizar plato
router.put(
  '/:id',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    param('id')
      .isNumeric().withMessage('El ID debe ser numérico'),
    body('name')
      .notEmpty().withMessage('El nombre es obligatorio')
      .trim()
      .escape(),
    body('price')
      .isNumeric().withMessage('El precio debe ser numérico'),
    body('category_id')
      .optional()
      .isNumeric().withMessage('El ID de la categoría debe ser numérico')
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const { name, price, category_id } = req.body;
    const sql = 'UPDATE menu SET name = ?, price = ?, category_id = ? WHERE id = ?';
    db.query(sql, [name, price, category_id, id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al actualizar plato' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Plato no encontrado' });
      }
      res.json({ success: true, message: 'Plato actualizado' });
    });
  }
);


// Eliminar plato
router.delete(
  '/:id',
  verifyToken,
  checkRole('admin','gerente'),
  [
    param('id')
      .isNumeric()
      .withMessage('El ID debe ser numérico')
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM menu WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al eliminar plato' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Plato no encontrado' });
      }
      res.json({ success: true, message: 'Plato eliminado' });
    });
  }
);

// ====================== CATEGORÍAS ======================

router.get('/menu-categories', verifyToken, (req, res) => {
  db.query('SELECT * FROM menu_categories ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener categorías' });
    res.json({ success: true, data: results });
  });
});

router.post(
  '/menu-categories',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    body('name')
      .notEmpty().withMessage('El nombre es obligatorio')
      .trim()
      .escape(),
    body('description')
      .optional()
      .trim()
      .escape()
  ],
  validateFields,
  (req, res) => {
    const { name, description } = req.body;
    const sql = 'INSERT INTO menu_categories (name, description) VALUES (?, ?)';
    db.query(sql, [name, description], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al crear categoría' });
      res.json({ success: true, newId: result.insertId });
    });
  }
);


router.put(
  '/menu-categories/:id',
  verifyToken,
  checkRole('admin', 'gerente'),
  [
    param('id')
      .isNumeric().withMessage('El ID debe ser numérico'),
    body('name')
      .notEmpty().withMessage('El nombre es obligatorio')
      .trim()
      .escape(),
    body('description')
      .optional()
      .trim()
      .escape()
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const sql = 'UPDATE menu_categories SET name = ?, description = ? WHERE id = ?';
    db.query(sql, [name, description, id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al actualizar categoría' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }
      res.json({ success: true, message: 'Categoría actualizada' });
    });
  }
);


router.delete(
  '/menu-categories/:id',
  verifyToken,
  checkRole('admin','gerente'),
  [
    param('id')
      .isNumeric()
      .withMessage('El ID debe ser numérico')
  ],
  validateFields,
  (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM menu_categories WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al eliminar categoría' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }
      res.json({ success: true, message: 'Categoría eliminada' });
    });
  }
);

module.exports = router;
