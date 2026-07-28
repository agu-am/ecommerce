const Product = require('../models/Product');
const XLSX = require('xlsx');

// ============================================================
// FUNCIÓN AUXILIAR: Verificar duplicados
// ============================================================
const verificarDuplicado = async (nombre, marca) => {
  const marcaNormalizada = marca || 'Sin marca';
  const productoExistente = await Product.findOne({
    nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
    marca: { $regex: new RegExp(`^${marcaNormalizada}$`, 'i') }
  });
  return productoExistente;
};

// ============================================================
// 1. OBTENER PRODUCTOS (con filtros)
// ============================================================
const getProducts = async (req, res) => {
  try {
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

    const filter = {};

    if (search) {
      filter.nombre = { $regex: search, $options: 'i' };
    }
    if (categoria && categoria !== 'todos') {
      filter.categoria = categoria;
    }
    if (marca) {
      filter.marca = marca;
    }
    if (talla) {
      filter.tallas = { $in: [talla] };
    }
    if (color) {
      filter.colores = { $in: [color] };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.precio = {};
      if (minPrice !== undefined) filter.precio.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.precio.$lte = Number(maxPrice);
    }

    let sortOption = {};
    switch (sort) {
      case 'price-asc': sortOption = { precio: 1 }; break;
      case 'price-desc': sortOption = { precio: -1 }; break;
      case 'name-asc': sortOption = { nombre: 1 }; break;
      case 'name-desc': sortOption = { nombre: -1 }; break;
      case 'newest':
      default: sortOption = { createdAt: -1 }; break;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    const categorias = await Product.distinct('categoria');
    const marcas = await Product.distinct('marca');
    const tallas = await Product.distinct('tallas');
    const colores = await Product.distinct('colores');

    res.json({
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      filters: {
        categorias: categorias.filter(c => c && c.trim() !== ''),
        marcas: marcas.filter(m => m && m.trim() !== ''),
        tallas: tallas.flat().filter(t => t && t.trim() !== ''),
        colores: colores.flat().filter(c => c && c.trim() !== ''),
      },
    });
  } catch (error) {
    console.error('❌ Error en getProducts:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

// ============================================================
// 2. OBTENER PRODUCTO POR ID
// ============================================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('❌ Error en getProductById:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.status(500).json({ mensaje: 'Error al obtener el producto', error: error.message });
  }
};

// ============================================================
// 3. CREAR PRODUCTO (admin) - CON VERIFICACIÓN DE DUPLICADOS
// ============================================================
const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen, categoria, marca, tallas, colores } = req.body;

    const existe = await verificarDuplicado(nombre, marca);
    if (existe) {
      return res.status(400).json({
        mensaje: `Ya existe un producto con el nombre "${nombre}" y marca "${marca || 'Sin marca'}"`,
        duplicado: existe,
      });
    }

    const product = await Product.create({
      nombre,
      descripcion,
      precio,
      stock,
      imagen: imagen || 'https://via.placeholder.com/150',
      categoria: categoria || 'otros',
      marca: marca || 'Sin marca',
      tallas: tallas || [],
      colores: colores || [],
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error en createProduct:', error);
    res.status(500).json({ mensaje: 'Error al crear producto', error: error.message });
  }
};

// ============================================================
// 4. ACTUALIZAR PRODUCTO (admin)
// ============================================================
const updateProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen, categoria, marca, tallas, colores } = req.body;

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
    product.marca = marca || product.marca;
    product.tallas = tallas || product.tallas;
    product.colores = colores || product.colores;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Error en updateProduct:', error);
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
};

// ============================================================
// 5. ELIMINAR PRODUCTO (admin)
// ============================================================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    await product.deleteOne();
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error en deleteProduct:', error);
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
};

// ============================================================
// 6. CARGA MASIVA DESDE EXCEL - CON VERIFICACIÓN DE DUPLICADOS
// ============================================================
const bulkUploadProducts = async (req, res) => {
  try {
    console.log('🚀 bulkUploadProducts ejecutándose');
    console.log('📤 Solicitud de carga masiva recibida');

    if (!req.file) {
      console.log('❌ No se recibió archivo');
      return res.status(400).json({ mensaje: 'No se ha subido ningún archivo' });
    }

    console.log(`📁 Archivo: ${req.file.originalname}, tamaño: ${req.file.size} bytes`);
    console.log('📄 Intentando leer el archivo con XLSX...');

    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    } catch (readError) {
      console.error('❌ Error al leer el archivo:', readError);
      return res.status(400).json({ mensaje: 'El archivo no es un Excel válido', error: readError.message });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ mensaje: 'El archivo Excel no tiene hojas' });
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Datos leídos: ${data.length} filas`);

    if (!data || data.length === 0) {
      return res.status(400).json({ mensaje: 'El archivo está vacío o no tiene datos válidos' });
    }

    const products = [];
    const errors = [];
    const seen = new Set();

    data.forEach((row, index) => {
      const rowNum = index + 2;

      if (!row.nombre || !row.precio || row.stock === undefined) {
        errors.push(`Fila ${rowNum}: Faltan campos obligatorios (nombre, precio, stock)`);
        return;
      }

      const nombre = row.nombre?.toString().trim();
      const descripcion = row.descripcion?.toString().trim() || '';
      const precio = parseFloat(row.precio);
      const stock = parseInt(row.stock);
      const categoria = row.categoria?.toString().trim() || 'otros';
      const imagen = row.imagen?.toString().trim() || 'https://via.placeholder.com/150';
      const marca = row.marca?.toString().trim() || 'Sin marca';

      let tallas = [];
      if (row.tallas) {
        if (typeof row.tallas === 'string') {
          tallas = row.tallas.split(',').map(t => t.trim()).filter(t => t);
        } else if (Array.isArray(row.tallas)) {
          tallas = row.tallas;
        }
      }

      let colores = [];
      if (row.colores) {
        if (typeof row.colores === 'string') {
          colores = row.colores.split(',').map(c => c.trim()).filter(c => c);
        } else if (Array.isArray(row.colores)) {
          colores = row.colores;
        }
      }

      if (isNaN(precio) || precio < 0) {
        errors.push(`Fila ${rowNum}: Precio inválido (${row.precio})`);
        return;
      }
      if (isNaN(stock) || stock < 0) {
        errors.push(`Fila ${rowNum}: Stock inválido (${row.stock})`);
        return;
      }

      const key = `${nombre.toLowerCase()}|${marca.toLowerCase()}`;
      if (seen.has(key)) {
        errors.push(`Fila ${rowNum}: Producto duplicado en el archivo (${nombre} - ${marca})`);
        return;
      }
      seen.add(key);

      products.push({
        nombre,
        descripcion,
        precio,
        stock,
        categoria,
        imagen,
        marca,
        tallas,
        colores,
      });
    });

    if (errors.length > 0) {
      console.log(`⚠️ Errores: ${errors.length}`);
      return res.status(400).json({
        mensaje: 'Se encontraron errores en el archivo',
        errores: errors,
        totalProcesados: data.length,
        exitosos: 0,
        fallidos: errors.length,
      });
    }

    const duplicadosEnDB = [];
    const productosNuevos = [];

    for (const product of products) {
      const existe = await verificarDuplicado(product.nombre, product.marca);
      if (existe) {
        duplicadosEnDB.push({
          nombre: product.nombre,
          marca: product.marca,
          existente: existe,
        });
      } else {
        productosNuevos.push(product);
      }
    }

    if (duplicadosEnDB.length > 0) {
      const mensajeDuplicados = duplicadosEnDB.map(d => 
        `"${d.nombre}" (${d.marca}) - ya existe en la base de datos`
      ).join('\n');
      
      return res.status(400).json({
        mensaje: `Se encontraron ${duplicadosEnDB.length} productos duplicados en la base de datos`,
        duplicados: duplicadosEnDB,
        totalProcesados: data.length,
        exitosos: 0,
        fallidos: duplicadosEnDB.length,
        detalles: mensajeDuplicados,
      });
    }

    console.log(`✅ Insertando ${productosNuevos.length} productos nuevos...`);
    const result = await Product.insertMany(productosNuevos);
    console.log(`✅ ${result.length} productos insertados`);

    res.status(201).json({
      mensaje: `${result.length} productos cargados exitosamente`,
      totalProcesados: data.length,
      exitosos: result.length,
      fallidos: 0,
      productos: result,
    });

  } catch (error) {
    console.error('❌ Error en bulkUploadProducts:', error);
    res.status(500).json({
      mensaje: 'Error interno al procesar el archivo',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// ============================================================
// 7. OBTENER CATEGORÍAS
// ============================================================
const getCategorias = async (req, res) => {
  try {
    const categorias = await Product.distinct('categoria');
    const filtradas = categorias.filter(c => c && c.trim() !== '').sort();
    res.json(filtradas);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
};

// ============================================================
// 8. OBTENER TALLAS
// ============================================================
const getTallas = async (req, res) => {
  try {
    const tallas = await Product.distinct('tallas');
    const filtradas = tallas.flat().filter(t => t && t.trim() !== '').sort();
    res.json(filtradas);
  } catch (error) {
    console.error('❌ Error al obtener tallas:', error);
    res.status(500).json({ mensaje: 'Error al obtener tallas', error: error.message });
  }
};

// ============================================================
// EXPORTAR
// ============================================================
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
  getCategorias,
  getTallas,
};