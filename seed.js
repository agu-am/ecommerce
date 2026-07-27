const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Importar el modelo (ruta correcta)
const Product = require('./src/models/Product');

const products = [
  {
    nombre: 'Laptop Gamer Pro',
    descripcion: 'Laptop con RTX 4060, 16GB RAM, SSD 1TB, pantalla 15.6" 144Hz',
    precio: 1499.99,
    stock: 10,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500',
  },
  {
    nombre: 'Auriculares Bluetooth Sony',
    descripcion: 'Auriculares inalámbricos con cancelación de ruido, 30 horas de batería',
    precio: 199.99,
    stock: 25,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
  },
  {
    nombre: 'Camiseta Deportiva Nike',
    descripcion: 'Camiseta de algodón transpirable para running y entrenamiento',
    precio: 39.99,
    stock: 50,
    categoria: 'ropa',
    imagen: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500',
  },
  {
    nombre: 'Silla Gamer Ergonómica',
    descripcion: 'Silla con soporte lumbar, ajuste de altura y reposabrazos 3D',
    precio: 299.99,
    stock: 8,
    categoria: 'hogar',
    imagen: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500',
  },
  {
    nombre: 'Smart TV 55" 4K',
    descripcion: 'TV LED 4K con HDR, Smart TV, control por voz, 60Hz',
    precio: 599.99,
    stock: 5,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1593305841991-05c297ba4573?w=500',
  },
  {
    nombre: 'Zapatillas Running Adidas',
    descripcion: 'Zapatillas con amortiguación Boost, suela de goma antideslizante',
    precio: 89.99,
    stock: 30,
    categoria: 'deportes',
    imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  },
  {
    nombre: 'Libro: Aprende JavaScript',
    descripcion: 'Guía completa de JavaScript desde cero hasta avanzado',
    precio: 29.99,
    stock: 40,
    categoria: 'libros',
    imagen: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
  },
  {
    nombre: 'Mochila Impermeable',
    descripcion: 'Mochila de 25L con compartimento para laptop, material impermeable',
    precio: 49.99,
    stock: 20,
    categoria: 'hogar',
    imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  },
];

const seedDB = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Limpiar productos existentes
    await Product.deleteMany();
    console.log('Productos eliminados');

    // Insertar nuevos productos
    await Product.insertMany(products);
    console.log(`${products.length} productos insertados correctamente`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar productos:', error);
    process.exit(1);
  }
};

seedDB();