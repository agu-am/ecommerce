const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc   Obtener el carrito del usuario
// @route  GET /api/cart
// @access Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'nombre precio imagen');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        total: 0,
      });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el carrito', error: error.message });
  }
};

// @desc   Agregar producto al carrito
// @route  POST /api/cart
// @access Private
const addToCart = async (req, res) => {
  try {
    const { productId, cantidad = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    if (product.stock < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        total: 0,
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].cantidad += cantidad;
    } else {
      cart.items.push({
        product: productId,
        cantidad,
        precioUnitario: product.precio,
      });
    }

    cart.calcularTotal();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'nombre precio imagen');

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al agregar al carrito', error: error.message });
  }
};

// @desc   Actualizar cantidad de un item en el carrito
// @route  PUT /api/cart/:productId
// @access Private
const updateCartItem = async (req, res) => {
  try {
    const { cantidad } = req.body;
    const { productId } = req.params;

    if (cantidad < 1) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser al menos 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ mensaje: 'Producto no encontrado en el carrito' });
    }

    const product = await Product.findById(productId);
    if (product && product.stock < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    cart.items[itemIndex].cantidad = cantidad;
    cart.calcularTotal();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'nombre precio imagen');

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el carrito', error: error.message });
  }
};

// @desc   Eliminar item del carrito
// @route  DELETE /api/cart/:productId
// @access Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    cart.calcularTotal();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'nombre precio imagen');

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar del carrito', error: error.message });
  }
};

// @desc   Vaciar carrito
// @route  DELETE /api/cart
// @access Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.total = 0;
      await cart.save();
    }

    res.json({ mensaje: 'Carrito vaciado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al vaciar el carrito', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};