const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const paymentRoutes = require('./src/routes/paymentRoutes');

dotenv.config();
connectDB();

const app = express();

// --- Configuración CORS mejorada ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://ecommerce-frontend-chi-ten.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman o apps móviles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Origen bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Manejar explícitamente las solicitudes OPTIONS (preflight)
app.options('*', cors()); // Responde a todas las preflight

app.use(express.json());

// --- Rutas ---
app.get('/', (req, res) => {
  res.send('API del Ecommerce funcionando 🚀');
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});