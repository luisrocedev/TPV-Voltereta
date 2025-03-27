// ====================== Config ======================
const mysql = require('mysql2');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || 'root';
const DB_NAME = process.env.DB_NAME || 'voltereta_db';
const JWT_SECRET = process.env.JWT_SECRET || 'S3cr3tJWT';
const PORT = process.env.PORT || 3000;

// Conexión MySQL
const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME
});
db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
    process.exit(1);
  }
  console.log('🟢 Conectado a la base de datos:', DB_NAME);
});
module.exports = { db,JWT_SECRET,PORT};