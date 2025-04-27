// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpeta si no existe
const uploadDir = path.join(__dirname, '../public/uploads/profile_pics');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Solo se permiten imágenes JPG o PNG'));
    }
    const name = `user_${req.user.id}_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten imágenes JPG o PNG'), false);
  }
  cb(null, true);
};

// Exportamos la configuración de multer directamente
module.exports = multer({
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter
});
