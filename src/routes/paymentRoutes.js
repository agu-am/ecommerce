// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
require('dotenv').config();

// --- Configuración de Mercado Pago ---
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// --- Endpoint para crear una preferencia de pago ---
router.post('/create-preference', async (req, res) => {
    try {
        // 1. Recibimos los datos del carrito desde el frontend
        const { items, payer, orderId } = req.body;

        // 2. Construimos el objeto de la preferencia
        //    Basado en la documentación oficial y ejemplos[reference:5][reference:6]
        const preference = {
            items: items.map(item => ({
                title: item.title,
                unit_price: Number(item.price),
                quantity: Number(item.quantity),
                currency_id: 'ARS', // o la moneda que uses
            })),
            payer: {
                email: payer.email,
                name: payer.name,
                // ... puedes agregar más datos del pagador si lo deseas
            },
            back_urls: {
                success: 'https://tudominio.com/success', // Reemplaza con tu URL
                failure: 'https://tudominio.com/failure',
                pending: 'https://tudominio.com/pending',
            },
            auto_return: 'approved',
            notification_url: 'https://tudominio.com/api/webhook', // ¡IMPORTANTE! Lo veremos luego
            external_reference: orderId, // Para vincular el pago con tu pedido
            statement_descriptor: 'MI TIENDA', // El nombre que verá el usuario en su resumen
        };

        // 3. Llamamos a la API de Mercado Pago para crear la preferencia
        const response = await mercadopago.preferences.create(preference);
        console.log('Preferencia creada:', response.body.id);

        // 4. Enviamos la URL de pago (init_point) al frontend
        res.json({
            id: response.body.id,
            init_point: response.body.init_point
        });

    } catch (error) {
        console.error('Error al crear la preferencia:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
});

module.exports = router;