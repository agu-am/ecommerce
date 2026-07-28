const Product = require('../models/Product');

// @desc   Obtener productos con filtros avanzados
// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
  try {
    // Extraer todos los query params
    const { 
      search, 
      categoria, 
      marca, 
      talla, 
      color, 
      minPrice, 
      maxPrice,
      sort,
      limit = 20,
      page = 1
    } = req.query;

    // Construir objeto de filtro
    const filter = {};

    // Búsqueda por nombre (case insensitive)
    if (search) {
      filter.nombre = { $regex: search, $options: 'i' };
    }

    // Filtro por categoría
    if (categoria && categoria !== 'todos') {
      filter.categoria = categoria;
    }

    // Filtro por marca
    if (marca) {
      filter.marca = marca;
    }

    // Filtro por talla (buscar en el array tallas)
    if (talla) {
      filter.tallas = { $in: [talla] };
    }

    // Filtro por color (buscar en el array colores)
    if (color) {
      filter.colores = { $in: [color] };
    }

    // Filtro por rango de precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.precio = {};
      if (minPrice !== undefined) filter.precio.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.precio.$lte = Number(maxPrice);
    }

    // Ordenamiento
    let sortOption = {};
    switch (sort) {
      case 'price-asc': sortOption = { precio: 1 }; break;
      case 'price-desc': sortOption = { precio: -1 }; break;
      case 'name-asc': sortOption = { nombre: 1 }; break;
      case 'name-desc': sortOption = { nombre: -1 }; break;
      case 'newest': 
      default: sortOption = { createdAt: -1 }; break;
    }

    // Paginación
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    // Ejecutar consulta
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Contar total de resultados (para la paginación)
    const total = await Product.countDocuments(filter);

    // Obtener valores únicos para los filtros (para el frontend)
    const marcas = await Product.distinct('marca');
    const tallas = await Product.distinct('tallas');
    const colores = await Product.distinct('colores');

    res.json({
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      filters: {
        marcas,
        tallas: tallas.flat(),
        colores: colores.flat(),
      },
    });
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