const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middlewares globales
app.use(cors()); // Permite peticiones de otros orígenes
app.use(express.json()); // Permite recibir JSON en el body de las peticiones

// Ruta de prueba para saber que el servidor funciona
app.get('/', (req, res) => {
  res.send('API del Ecommerce funcionando 🚀');
});

// Aquí irán las rutas (las agregaremos luego)
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});