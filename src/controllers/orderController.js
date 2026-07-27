const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
  try {
    const { items, total, direccion, ciudad, codigoPostal, telefono, metodoPago } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ mensaje: 'El carrito está vacío' });
    }

    // Verificar stock y obtener datos del producto
    const itemsConDetalle = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ mensaje: `Producto no encontrado: ${item.product}` });
      }
      if (product.stock < item.cantidad) {
        return res.status(400).json({ 
          mensaje: `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}` 
        });
      }

      // ✅ Guardar copia de los datos del producto
      itemsConDetalle.push({
        product: item.product,
        nombreProducto: product.nombre,        // Copia
        imagenProducto: product.imagen,        // Copia
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      });
    }

    // Crear el pedido con los datos enriquecidos
    const order = await Order.create({
      user: req.user._id,
      items: itemsConDetalle,
      total,
      direccion,
      ciudad,
      codigoPostal,
      telefono,
      metodoPago,
      estado: 'pendiente',
    });

    // Actualizar stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.cantidad }
      });
    }

    // Eliminar carrito
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      mensaje: 'Pedido creado exitosamente',
      order,
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ mensaje: 'Error al crear pedido', error: error.message });
  }
};

// @desc   Obtener pedidos (todos si es admin, solo los del usuario si no)
// @route  GET /api/orders
// @access Private
const getOrders = async (req, res) => {
  try {
    let query = {};
    // Si no es admin, solo sus pedidos
    if (req.user.rol !== 'admin') {
      query.user = req.user._id;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'nombre email')   // Para admin, mostrar usuario
      .populate('items.product', 'nombre precio imagen')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
  }
};

// @desc   Obtener un pedido específico
// @route  GET /api/orders/:id
// @access Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Verificar que el usuario sea el dueño del pedido o admin
    if (order.user.toString() !== req.user._id.toString() && req.user.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el pedido' });
  }
};

// @desc   Actualizar estado del pedido (solo admin)
// @route  PUT /api/orders/:id
// @access Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    if (!['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado inválido' });
    }

    order.estado = estado;
    await order.save();

    res.json({ mensaje: 'Estado actualizado', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el pedido' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};