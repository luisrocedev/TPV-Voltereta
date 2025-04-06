// middleware/errorHandler.js
const winston = require('winston');

// Configuración de Winston para logging
const logger = winston.createLogger({
  level: 'info', // Nivel mínimo de log
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log a la consola
    new winston.transports.Console(),
    // Guardar logs de errores en un archivo
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Guardar todos los logs en otro archivo
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware central para manejo de errores
function errorHandler(err, req, res, next) {
  // Registra el error usando Winston
  logger.error(err.stack);

  // Envía una respuesta uniforme al cliente
  res.status(500).json({
    success: false,
    message: 'Ocurrió un error interno. Por favor, inténtalo de nuevo más tarde.'
  });
}

module.exports = { logger, errorHandler };
