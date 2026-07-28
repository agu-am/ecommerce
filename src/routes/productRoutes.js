const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
  getCategorias,
  getTallas,
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
    }
  }
});

router.get('/categories', getCategorias);
router.get('/sizes', getTallas);
router.get('/test', (req, res) => {
  res.json({ mensaje: 'Ruta de productos funcionando' });
});

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

router.post(
  '/bulk-upload',
  protect,
  admin,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('❌ Error en multer:', err);
        return res.status(400).json({ mensaje: err.message });
      }
      next();
    });
  },
  bulkUploadProducts
);

module.exports = router;