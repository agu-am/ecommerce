const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        nombreProducto: {      // ✅ Copia del nombre
          type: String,
          required: true,
        },
        imagenProducto: {      // ✅ Copia de la imagen
          type: String,
          default: 'https://via.placeholder.com/60',
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
        precioUnitario: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    ciudad: {
      type: String,
      required: true,
    },
    codigoPostal: {
      type: String,
    },
    telefono: {
      type: String,
      required: true,
    },
    metodoPago: {
      type: String,
      enum: ['tarjeta', 'paypal', 'transferencia', 'contraentrega'],
      required: true,
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
      default: 'pendiente',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);