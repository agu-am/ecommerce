const Product = require('../models/Product');

// @desc   Obtener todos los productos
// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

// @desc   Obtener un producto por ID
// @route  GET /api/products/:id
// @access Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.status(500).json({ mensaje: 'Error al obtener el producto', error: error.message });
  }
};

// @desc   Crear un nuevo producto (solo admin)
// @route  POST /api/products
// @access Private/Admin
const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;

    const product = await Product.create({
      nombre,
      descripcion,
      precio,
      stock,
      imagen,
      categoria,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear producto', error: error.message });
  }
};

// @desc   Actualizar un producto (solo admin)
// @route  PUT /api/products/:id
// @access Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    product.nombre = nombre || product.nombre;
    product.descripcion = descripcion || product.descripcion;
    product.precio = precio || product.precio;
    product.stock = stock !== undefined ? stock : product.stock;
    product.imagen = imagen || product.imagen;
    product.categoria = categoria || product.categoria;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

// @desc   Eliminar un producto (solo admin)
// @route  DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    await product.deleteOne();
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};