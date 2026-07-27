const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generar token JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc   Registrar un nuevo usuario
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar campos obligatorios
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        mensaje: 'Por favor proporciona todos los campos requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ mensaje: 'El usuario ya está registrado' });
    }

    // ✅ HASHEAR LA CONTRASEÑA AQUÍ
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Crear el usuario con la contraseña hasheada
    const user = await User.create({
      nombre,
      email,
      password: hashedPassword,
    });

    // Si se creó correctamente, devolver los datos
    if (user) {
      res.status(201).json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token: generarToken(user._id),
      });
    } else {
      res.status(400).json({ mensaje: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      mensaje: 'Error en el servidor', 
      error: error.message 
    });
  }
};

// @desc   Iniciar sesión (login)
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ 
        mensaje: 'Por favor proporciona email y contraseña' 
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // ✅ VERIFICAR CONTRASEÑA CON BCRYPT
    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Si todo es correcto, devolver datos
    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      token: generarToken(user._id),
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      mensaje: 'Error en el servidor', 
      error: error.message 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};