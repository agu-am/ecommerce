const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: [1, 'La cantidad mínima es 1'],
          default: 1,
        },
        precioUnitario: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CartSchema.methods.calcularTotal = function() {
  let total = 0;
  this.items.forEach(item => {
    total += item.precioUnitario * item.cantidad;
  });
  this.total = total;
  return total;
};

module.exports = mongoose.model('Cart', CartSchema);