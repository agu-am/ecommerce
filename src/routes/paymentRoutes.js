const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
const Order = require('../models/Order');
require('dotenv').config();

mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// --- Crear preferencia de pago ---
router.post('/create-preference', async (req, res) => {
    try {
        const { items, payer, orderId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        const preference = {
            items: items.map(item => ({
                title: item.title,
                unit_price: Number(item.price),
                quantity: Number(item.quantity),
                currency_id: 'ARS',
            })),
            payer: {
                email: payer.email,
                name: payer.name,
            },
            back_urls: {
                success: 'http://localhost:5173/order-success',
                failure: 'http://localhost:5173/cart',
                pending: 'http://localhost:5173/cart',
            },
            notification_url: 'http://localhost:5000/api/webhook',
            external_reference: orderId,
            statement_descriptor: 'MI TIENDA',
        };

        const response = await mercadopago.preferences.create(preference);
        console.log('✅ Preferencia creada:', response.body.id);

        res.json({
            id: response.body.id,
            init_point: response.body.init_point,
            sandbox_init_point: response.body.sandbox_init_point,
        });
    } catch (error) {
        console.error('❌ Error al crear preferencia:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
});

// --- Webhook para notificaciones ---
router.post('/webhook', async (req, res) => {
    try {
        res.status(200).send('OK');

        const { type, data, id } = req.body;
        console.log('📩 Webhook recibido:', { type, id });

        if (type === 'payment') {
            const paymentId = data.id;
            const payment = await mercadopago.payment.findById(paymentId);
            const externalRef = payment.body.external_reference;
            const status = payment.body.status;

            console.log(`📌 External reference: ${externalRef}, Estado: ${status}`);

            if (status === 'approved' && externalRef) {
                const order = await Order.findById(externalRef);
                if (order) {
                    order.estado = 'confirmado';
                    await order.save();
                    console.log(`✅ Pedido ${order._id} actualizado a "confirmado"`);
                } else {
                    console.log(`⚠️ Pedido con ID ${externalRef} no encontrado`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en webhook:', error);
    }
});

// --- NUEVO: Consultar estado de un pago por ID (para confirmación rápida) ---
router.get('/payment-status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await mercadopago.payment.findById(paymentId);
        const status = payment.body.status;
        const externalRef = payment.body.external_reference;

        console.log(`🔍 Consulta directa: payment_id=${paymentId}, status=${status}, external_ref=${externalRef}`);

        if (status === 'approved' && externalRef) {
            // Actualizar el pedido a confirmado si aún no lo está
            const order = await Order.findById(externalRef);
            if (order && order.estado !== 'confirmado') {
                order.estado = 'confirmado';
                await order.save();
                console.log(`✅ Pedido ${order._id} confirmado por consulta directa`);
            }
            return res.json({ status: 'approved', orderId: externalRef });
        } else {
            return res.json({ status });
        }
    } catch (error) {
        console.error('Error al consultar pago:', error);
        res.status(500).json({ error: 'Error al consultar el pago' });
    }
});

module.exports = router;