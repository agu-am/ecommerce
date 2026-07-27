const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un email válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    rol: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// ❌ ELIMINAR TODO EL PRE-SAVE
// Ya no usamos middleware, hasheamos en el controlador

// 📝 Método para comparar contraseñas (usando bcrypt)
UserSchema.methods.comparePassword = function(passwordIngresada) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(passwordIngresada, this.password);
};

module.exports = mongoose.model('User', UserSchema);