const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ mensaje: 'Usuario no autorizado' });
      }

      next();
    } catch (error) {
      console.error('Error en protect middleware:', error);
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
  } else {
    return res.status(401).json({ mensaje: 'Acceso denegado, no hay token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado, se requiere rol de administrador' });
  }
};

module.exports = { protect, admin };