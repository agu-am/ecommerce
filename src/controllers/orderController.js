// backend/src/controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ============================================================
// 1. Crear un nuevo pedido (desde el carrito)
// ============================================================
// @desc    Crear un pedido y vaciar el carrito
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { items, total, direccion, ciudad, codigoPostal, telefono, metodoPago } = req.body;

        // Validar que el carrito no esté vacío
        if (!items || items.length === 0) {
            return res.status(400).json({ mensaje: 'El carrito está vacío' });
        }

        // Validar campos obligatorios
        if (!direccion || !ciudad || !telefono) {
            return res.status(400).json({ mensaje: 'Faltan datos de envío' });
        }

        // Verificar stock de cada producto y obtener datos para copia
        const itemsConDetalle = [];
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ mensaje: `Producto no encontrado: ${item.product}` });
            }
            if (product.stock < item.cantidad) {
                return res.status(400).json({
                    mensaje: `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock}`
                });
            }

            // Guardar copia de los datos del producto (para historial)
            itemsConDetalle.push({
                product: item.product,
                nombreProducto: product.nombre,
                imagenProducto: product.imagen || 'https://via.placeholder.com/60',
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
            });
        }

        // Crear el pedido en la base de datos
        const order = await Order.create({
            user: req.user._id,
            items: itemsConDetalle,
            total,
            direccion,
            ciudad,
            codigoPostal,
            telefono,
            metodoPago,
            estado: 'pendiente', // estado inicial
        });

        // Actualizar el stock de los productos (restar las cantidades)
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.cantidad }
            });
        }

        // Eliminar el carrito del usuario
        await Cart.findOneAndDelete({ user: req.user._id });

        // Responder con el pedido creado
        res.status(201).json({
            mensaje: 'Pedido creado exitosamente',
            order, // <- devolvemos el objeto completo con _id
        });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({
            mensaje: 'Error al crear pedido',
            error: error.message
        });
    }
};

// ============================================================
// 2. Obtener todos los pedidos (admin ve todos, usuario solo los suyos)
// ============================================================
// @desc    Obtener pedidos (todos si admin, solo del usuario si no)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        let query = {};
        // Si no es admin, solo sus pedidos
        if (req.user.rol !== 'admin') {
            query.user = req.user._id;
        }

        const orders = await Order.find(query)
            .populate('user', 'nombre email')      // para admin, muestra usuario
            .populate('items.product', 'nombre precio imagen') // para admin, muestra detalles
            .sort({ createdAt: -1 });               // más recientes primero

        res.json(orders);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({
            mensaje: 'Error al obtener pedidos',
            error: error.message
        });
    }
};

// ============================================================
// 3. Obtener un pedido por ID
// ============================================================
// @desc    Obtener un pedido específico
// @route   GET /api/orders/:id
// @access  Private (usuario o admin)
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID no sea undefined o inválido
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ mensaje: 'ID de pedido inválido' });
        }

        const order = await Order.findById(id)
            .populate('items.product', 'nombre precio imagen');

        if (!order) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        // Verificar que el pedido pertenezca al usuario o sea admin
        if (order.user.toString() !== req.user._id.toString() && req.user.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'No autorizado para ver este pedido' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        // Si el error es por ID mal formado
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        res.status(500).json({
            mensaje: 'Error al obtener pedido',
            error: error.message
        });
    }
};

// ============================================================
// 4. Actualizar el estado de un pedido (solo admin)
// ============================================================
// @desc    Cambiar estado del pedido (pendiente, confirmado, enviado, entregado, cancelado)
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { estado } = req.body;
        const { id } = req.params;

        // Validar que el estado sea válido
        const estadosValidos = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ mensaje: 'Estado inválido' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        // Actualizar estado
        order.estado = estado;
        await order.save();

        res.json({
            mensaje: 'Estado actualizado correctamente',
            order,
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        res.status(500).json({
            mensaje: 'Error al actualizar estado',
            error: error.message
        });
    }
};

// ============================================================
// (Opcional) Eliminar un pedido (solo admin)
// ============================================================
// @desc    Eliminar un pedido (solo admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        await order.deleteOne();
        res.json({ mensaje: 'Pedido eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        res.status(500).json({
            mensaje: 'Error al eliminar pedido',
            error: error.message
        });
    }
};

// ============================================================
// EXPORTAR todas las funciones
// ============================================================
module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder, // opcional
};