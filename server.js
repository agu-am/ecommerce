const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const paymentRoutes = require('./src/routes/paymentRoutes');

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
app.use('/api', paymentRoutes);

// Endpoint para recibir notificaciones de Mercado Pago
app.post('/api/webhook', async (req, res) => {
  try {
    // 1. Recibir la notificación
    const { type, data, id } = req.body; // Mercado Pago envía estos datos
    console.log('Notificación recibida:', { type, id });

    // 2. IMPORTANTE: Siempre responder con 200 OK primero
    //    para que Mercado Pago sepa que recibiste la notificación.
    res.status(200).send('OK');

    // 3. Procesar la notificación en segundo plano
    //    (No uses await aquí para no bloquear la respuesta)
    if (type === 'payment') {
      // Aquí es donde buscarías el pago por su ID y actualizarías
      // el estado de tu pedido en tu base de datos.
      // const paymentId = data.id;
      // const payment = await mercadopago.payment.findById(paymentId);
      // ... actualizar el pedido en tu DB.
      console.log(`Pago ${id} recibido. Procesar en segundo plano.`);
    }

  } catch (error) {
    console.error('Error en el webhook:', error);
    // Incluso si hay error, es mejor responder 200 para evitar que
    // Mercado Pago siga reintentando.
    res.status(200).send('OK');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});