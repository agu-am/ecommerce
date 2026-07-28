const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');

dotenv.config();

const products = [
  // ============================
  // ELECTRÓNICA (8 productos, sin tallas)
  // ============================
  {
    nombre: 'Laptop Gamer Pro',
    descripcion: 'Laptop con Intel i7, 16GB RAM, SSD 512GB y RTX 3060.',
    precio: 1499.99,
    stock: 10,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500',
    marca: 'MSI',
    tallas: [],
    colores: ['Negro', 'Plateado'],
  },
  {
    nombre: 'Auriculares Bluetooth Sony',
    descripcion: 'Auriculares inalámbricos con cancelación de ruido y 30h de batería.',
    precio: 199.99,
    stock: 25,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
    marca: 'Sony',
    tallas: [],
    colores: ['Negro', 'Blanco'],
  },
  {
    nombre: 'Smart TV 55" 4K',
    descripcion: 'TV LED 4K con HDR, Smart TV y control por voz.',
    precio: 599.99,
    stock: 5,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1593305841991-05c297ba4573?w=500',
    marca: 'Samsung',
    tallas: [],
    colores: ['Negro'],
  },
  {
    nombre: 'Smartphone Galaxy S23',
    descripcion: 'Pantalla AMOLED, cámara 50MP y batería de larga duración.',
    precio: 899.99,
    stock: 15,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=500',
    marca: 'Samsung',
    tallas: [],
    colores: ['Negro', 'Blanco', 'Verde'],
  },
  {
    nombre: 'Tablet iPad Air',
    descripcion: 'Pantalla 10.9", chip M1, compatible con lápiz y teclado.',
    precio: 649.99,
    stock: 8,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    marca: 'Apple',
    tallas: [],
    colores: ['Gris', 'Oro'],
  },
  {
    nombre: 'Reloj Inteligente Fitbit',
    descripcion: 'Monitor de ritmo cardíaco, GPS y seguimiento del sueño.',
    precio: 129.99,
    stock: 20,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500',
    marca: 'Fitbit',
    tallas: [],
    colores: ['Negro', 'Azul'],
  },
  {
    nombre: 'Auriculares Deportivos JBL',
    descripcion: 'In-ear, resistentes al sudor y sonido potente.',
    precio: 49.99,
    stock: 35,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1517373116456-5e1b5482e46c?w=500',
    marca: 'JBL',
    tallas: [],
    colores: ['Negro', 'Azul'],
  },
  {
    nombre: 'Base de Carga Inalámbrica Samsung',
    descripcion: 'Carga rápida para dispositivos compatibles con Qi.',
    precio: 29.99,
    stock: 25,
    categoria: 'electronica',
    imagen: 'https://images.unsplash.com/photo-1600267185393-e158a98703de?w=500',
    marca: 'Samsung',
    tallas: [],
    colores: ['Negro'],
  },

  // ============================
  // ROPA (7 productos, con tallas S,M,L,XL)
  // ============================
  {
    nombre: 'Camiseta Deportiva Nike',
    descripcion: 'Camiseta de algodón transpirable para running y entrenamiento.',
    precio: 39.99,
    stock: 50,
    categoria: 'ropa',
    imagen: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500',
    marca: 'Nike',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Rojo', 'Azul', 'Negro'],
  },
  {
    nombre: 'Pantalón Deportivo Adidas',
    descripcion: 'Pantalón con tejido elástico, ideal para correr o hacer ejercicio.',
    precio: 59.99,
    stock: 30,
    categoria: 'ropa',
    imagen: 'https://images.unsplash.com/photo-1556906781-9a4129617d5b?w=500',
    marca: 'Adidas',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Negro', 'Gris'],
  },
  {
    nombre: 'Camisa Casual Zara',
    descripcion: 'Camisa de manga larga con estampado sutil, para ocasiones informales.',
    precio: 49.99,
    stock: 20,
    categoria: 'ropa',
    imagen: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
    marca: 'Zara',
    tallas: ['M', 'L', 'XL'],
    colores: ['Blanco', 'Celeste'],
  },
  {
    nombre: 'Chaqueta de Cuero H&M',
    descripcion: 'Chaqueta de cuero sintético con cierre frontal y cuello alto.',
    precio: 89.99,
    stock: 12,
    categoria: 'ropa',
    imagen: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    marca: 'H&M',
    tallas: ['M', 'L', 'XL'],
    colores: ['Negro', 'Marrón'],
  },
  {
    nombre: 'Vestido Floral Mango',
    descripcion: 'Vestido largo con estampado floral y tirantes ajustables.',
    precio: 69.99,
    stock: 18,
    categoria: 'ropa',
    imagen: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500',
    marca: 'Mango',
    tallas: ['S', 'M', 'L'],
    colores: ['Rojo', 'Amarillo'],
  },
  {
    nombre: 'Zapatillas Deportivas Puma',
    descripcion: 'Zapatillas con suela de goma y amortiguación para máxima comodidad.',
    precio: 79.99,
    stock: 25,
    categoria: 'ropa',
    imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    marca: 'Puma',
    tallas: [], // Tallas numéricas (calzado)
    colores: ['Negro', 'Blanco'],
  },
  {
    nombre: 'Gorra Deportiva Nike',
    descripcion: 'Gorra con visera curva, transpirable y ajustable.',
    precio: 19.99,
    stock: 60,
    categoria: 'ropa',
    imagen: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
    marca: 'Nike',
    tallas: [],
    colores: ['Negro', 'Blanco', 'Azul'],
  },

  // ============================
  // HOGAR (5 productos, sin tallas)
  // ============================
  {
    nombre: 'Silla Gamer Ergonómica',
    descripcion: 'Silla con soporte lumbar, ajuste de altura y reposabrazos 3D.',
    precio: 299.99,
    stock: 8,
    categoria: 'hogar',
    imagen: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500',
    marca: 'Xtech',
    tallas: [],
    colores: ['Negro', 'Rojo'],
  },
  {
    nombre: 'Mesa de Centro Moderna',
    descripcion: 'Mesa de centro con diseño minimalista y acabado en madera.',
    precio: 149.99,
    stock: 6,
    categoria: 'hogar',
    imagen: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500',
    marca: 'IKEA',
    tallas: [],
    colores: ['Madera', 'Blanco'],
  },
  {
    nombre: 'Lámpara de Pie LED',
    descripcion: 'Lámpara con luz regulable y diseño moderno, ideal para salas.',
    precio: 79.99,
    stock: 15,
    categoria: 'hogar',
    imagen: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    marca: 'Philips',
    tallas: [],
    colores: ['Negro', 'Plateado'],
  },
  {
    nombre: 'Juego de Sábanas Premium',
    descripcion: 'Set de sábanas de algodón egipcio, suaves y duraderas.',
    precio: 89.99,
    stock: 20,
    categoria: 'hogar',
    imagen: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=500',
    marca: 'Home',
    tallas: [], // Tallas de cama
    colores: ['Blanco', 'Gris', 'Azul'],
  },
  {
    nombre: 'Set de Toallas de Baño',
    descripcion: 'Set de 3 toallas de algodón de alta absorción.',
    precio: 34.99,
    stock: 30,
    categoria: 'hogar',
    imagen: 'https://images.unsplash.com/photo-1582484374839-bc7a8e8adf99?w=500',
    marca: 'Home',
    tallas: [],
    colores: ['Blanco', 'Gris', 'Rosa'],
  },

  // ============================
  // DEPORTES (4 productos, con tallas)
  // ============================
  {
    nombre: 'Pelota de Fútbol Adidas',
    descripcion: 'Pelota oficial de fútbol, resistente y con agarre mejorado.',
    precio: 29.99,
    stock: 40,
    categoria: 'deportes',
    imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500',
    marca: 'Adidas',
    tallas: [],
    colores: ['Blanco', 'Negro'],
  },
  {
    nombre: 'Raqueta de Tenis Wilson',
    descripcion: 'Raqueta de tenis con estructura ligera y buen control.',
    precio: 99.99,
    stock: 12,
    categoria: 'deportes',
    imagen: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500',
    marca: 'Wilson',
    tallas: [],
    colores: ['Negro', 'Rojo'],
  },
  {
    nombre: 'Mochila Impermeable',
    descripcion: 'Mochila de 25L con compartimento para laptop, material impermeable.',
    precio: 49.99,
    stock: 20,
    categoria: 'hogar',
    imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    marca: 'Xtech',
    tallas: [],
    colores: ['Negro', 'Verde'],
  },
  {
    nombre: 'Bolsa de Gimnasio Puma',
    descripcion: 'Bolsa deportiva de gran capacidad, con compartimentos para zapatos y ropa.',
    precio: 39.99,
    stock: 18,
    categoria: 'deportes',
    imagen: 'https://images.unsplash.com/photo-1584735935682-2f2b69d0c9b7?w=500',
    marca: 'Puma',
    tallas: [],
    colores: ['Negro', 'Rojo'],
  },

  // ============================
  // LIBROS (3 productos, sin tallas)
  // ============================
  {
    nombre: 'Libro: Aprende JavaScript',
    descripcion: 'Guía completa de JavaScript desde cero hasta avanzado, con ejercicios prácticos.',
    precio: 29.99,
    stock: 40,
    categoria: 'libros',
    imagen: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    marca: 'O\'Reilly',
    tallas: [],
    colores: ['Azul'],
  },
  {
    nombre: 'Libro: El Arte de la Guerra',
    descripcion: 'Edición de bolsillo del clásico de Sun Tzu, con comentarios modernos.',
    precio: 14.99,
    stock: 35,
    categoria: 'libros',
    imagen: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500',
    marca: 'Penguin',
    tallas: [],
    colores: ['Rojo'],
  },
  {
    nombre: 'Libro: Cien Años de Soledad',
    descripcion: 'Obra maestra de Gabriel García Márquez, edición especial ilustrada.',
    precio: 24.99,
    stock: 25,
    categoria: 'libros',
    imagen: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
    marca: 'Random House',
    tallas: [],
    colores: ['Verde'],
  },

  // ============================
  // OTROS (3 productos)
  // ============================
  {
    nombre: 'Puzzle 3D - Torre Eiffel',
    descripcion: 'Puzzle tridimensional de la Torre Eiffel, de 100 piezas.',
    precio: 19.99,
    stock: 15,
    categoria: 'otros',
    imagen: 'https://images.unsplash.com/photo-1587654780291-39c9404d9ec2?w=500',
    marca: 'Ravensburger',
    tallas: [],
    colores: ['Multicolor'],
  },
  {
    nombre: 'Cámara Instantánea Polaroid',
    descripcion: 'Cámara que imprime fotos al instante, con estilo retro.',
    precio: 89.99,
    stock: 10,
    categoria: 'otros',
    imagen: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
    marca: 'Polaroid',
    tallas: [],
    colores: ['Negro', 'Blanco'],
  },
  {
    nombre: 'Set de Juegos de Mesa',
    descripcion: 'Set con ajedrez, damas, dominó y cartas, ideal para reuniones.',
    precio: 34.99,
    stock: 20,
    categoria: 'otros',
    imagen: 'https://images.unsplash.com/photo-1523528283115-9bf9b1699245?w=500',
    marca: 'Hasbro',
    tallas: [],
    colores: ['Multicolor'],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    await Product.deleteMany();
    console.log('🗑️ Productos eliminados');

    await Product.insertMany(products);
    console.log(`✅ ${products.length} productos insertados correctamente`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar productos:', error);
    process.exit(1);
  }
};

seedDB();