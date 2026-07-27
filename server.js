const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const test = require('./src/test/test');

// Cargar variables de entornooooo
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middlewares globales

// Permitir solo tu frontend en producción
const allowedOrigins = [
  'http://localhost:5173',
  'https://ecommerce-frontend-chi-ten.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
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