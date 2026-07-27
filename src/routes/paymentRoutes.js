// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

router.post('/create-preference', async (req, res) => {
    try {
        const { items, payer, orderId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        const preferenceBody = {
            items: items.map(item => ({
                title: item.title,
                unit_price: Number(item.price),
                quantity: Number(item.quantity),
                currency_id: 'ARS',
            })),
            payer: {
                email: payer.email,
                name: payer.name,
                surname: payer.surname || '',
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/order-success`,
                failure: `${process.env.FRONTEND_URL}/cart`,
                pending: `${process.env.FRONTEND_URL}/cart`,
            },
            auto_return: 'approved',
            notification_url: `${process.env.BACKEND_URL}/api/webhook`,
            external_reference: orderId,
            statement_descriptor: 'MI TIENDA',
        };

        const preference = new Preference(client);
        const response = await preference.create({ body: preferenceBody });

        res.json({
            id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point,
        });

    } catch (error) {
        console.error('❌ Error al crear preferencia:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
});

router.post('/webhook', async (req, res) => {
    try {
        res.status(200).send('OK');
        const { type, data, id } = req.body;
        console.log('📩 Webhook recibido:', { type, id });

        if (type === 'payment') {
            console.log(`🔄 Procesando pago ID: ${data.id}`);
            // Aquí iría la lógica para actualizar el estado del pedido
        }
    } catch (error) {
        console.error('❌ Error en webhook:', error);
    }
});

module.exports = router;