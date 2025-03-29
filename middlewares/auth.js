// middlewares/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../db');

/**
 * Middleware para verificar el token JWT en las solicitudes.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

/**
 * Middleware para verificar el rol del usuario.
 * @param {...string} allowed - Roles permitidos para acceder a la ruta.
 */
function checkRole(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Se requiere rol: ${allowed.join(' o ')}` });
    }
    next();
  };
}

module.exports = { verifyToken, checkRole };
