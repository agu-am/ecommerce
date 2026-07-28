const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    imagen: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: ['electronica', 'ropa', 'hogar', 'deportes', 'libros', 'otros'],
      default: 'otros',
    },
    // 🆕 NUEVOS CAMPOS PARA FILTROS AVANZADOS
    marca: {
      type: String,
      default: 'Sin marca',
    },
    tallas: {
      type: [String],
      default: [],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], // Ejemplo de tallas
    },
    colores: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', ProductSchema);