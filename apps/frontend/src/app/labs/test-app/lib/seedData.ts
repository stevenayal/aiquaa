import type { Product, User, Order, SupportTicket, CandidateSession } from './types';
import { PRNG, getCandidateId } from './prng';
import {
  getProducts,
  saveProducts,
  getUsers,
  addUser,
  findUserByEmail,
  addOrder,
  addTicket,
  saveCandidateSession,
  getCandidateSession,
} from './storage';
import { getActiveBugs } from './bugsManifest';

const CATEGORIES = [
  'Electrónica',
  'Ropa',
  'Hogar',
  'Deportes',
  'Libros',
  'Juguetes',
  'Alimentación',
];

const PRODUCT_NAMES = {
  Electrónica: [
    'Auriculares Bluetooth',
    'Mouse Inalámbrico',
    'Teclado Mecánico',
    'Webcam HD',
    'Micrófono USB',
    'Cargador Portátil',
    'Cable HDMI',
    'Memoria USB',
  ],
  Ropa: [
    'Camiseta Básica',
    'Jeans Clásicos',
    'Zapatillas Deportivas',
    'Chaqueta de Invierno',
    'Bufanda de Lana',
    'Gorra Deportiva',
    'Medias Pack x3',
    'Cinturón de Cuero',
  ],
  Hogar: [
    'Lámpara LED',
    'Cojín Decorativo',
    'Toallas Pack x2',
    'Organizador de Escritorio',
    'Reloj de Pared',
    'Alfombra',
    'Espejo Redondo',
    'Portarretratos',
  ],
  Deportes: [
    'Pelota de Fútbol',
    'Esterilla de Yoga',
    'Pesas 5kg',
    'Cuerda para Saltar',
    'Botella Térmica',
    'Guantes de Gimnasio',
    'Banda Elástica',
    'Mochila Deportiva',
  ],
  Libros: [
    'Novela de Ficción',
    'Manual de Programación',
    'Libro de Cocina',
    'Guía de Viajes',
    'Biografía Inspiradora',
    'Ensayo Filosófico',
    'Cómic Clásico',
    'Diccionario',
  ],
  Juguetes: [
    'Puzzle 1000 Piezas',
    'Juego de Mesa',
    'Peluche Osito',
    'Bloques de Construcción',
    'Muñeca Articulada',
    'Auto a Control Remoto',
    'Set de Pintura',
    'Rompecabezas 3D',
  ],
  Alimentación: [
    'Café Premium 250g',
    'Té Verde Orgánico',
    'Chocolate Artesanal',
    'Miel Natural 500g',
    'Aceite de Oliva',
    'Galletas Integrales',
    'Frutos Secos Mix',
    'Mermelada Casera',
  ],
};

const DEMO_USER = {
  email: 'tester@aiquaa.com',
  password: 'Test1234!',
  name: 'Tester Demo',
  phone: '+595 991 234567',
  timezone: 'America/Asuncion',
};

/**
 * Generate mock products using PRNG
 */
export function generateProducts(prng: PRNG, count: number = 30): Product[] {
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const category = prng.choice(CATEGORIES);
    const namesList = PRODUCT_NAMES[category as keyof typeof PRODUCT_NAMES];
    const name = prng.choice(namesList);

    const product: Product = {
      id: `prod-${i + 1}`,
      name: `${name} ${i + 1}`,
      description: `Descripción detallada del producto ${name}. Alta calidad y excelente precio.`,
      price: Math.round(prng.nextFloat(10, 500) * 100) / 100,
      stock: prng.nextInt(0, 50),
      category,
      imageUrl: `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(name)}`,
    };

    products.push(product);
  }

  return products;
}

/**
 * Create demo user if not exists
 */
export function ensureDemoUser(): User {
  const existing = findUserByEmail(DEMO_USER.email);
  if (existing) return existing;

  const user: User = {
    id: 'user-demo',
    ...DEMO_USER,
    createdAt: new Date().toISOString(),
  };

  addUser(user);
  return user;
}

/**
 * Generate sample orders for demo user
 */
export function generateSampleOrders(prng: PRNG, userId: string): void {
  const products = getProducts();
  if (products.length === 0) return;

  const orderCount = prng.nextInt(1, 2);

  for (let i = 0; i < orderCount; i++) {
    const itemCount = prng.nextInt(1, 3);
    const items = prng.pick(products, itemCount).map((p) => ({
      productId: p.id,
      quantity: prng.nextInt(1, 2),
      price: p.price,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;

    const order: Order = {
      id: `order-${Date.now()}-${i}`,
      userId,
      items,
      subtotal,
      tax,
      total: subtotal + tax,
      shippingAddress: {
        fullName: DEMO_USER.name,
        street: `Calle ${prng.nextInt(1, 100)}`,
        apartmentSuite: `Apto ${prng.nextInt(1, 20)}`,
        city: 'Asunción',
        state: 'Central',
        zipCode: '1234',
        country: 'Paraguay',
      },
      paymentInfo: {
        cardNumber: '**** **** **** 1234',
        cardHolder: DEMO_USER.name,
        expiryDate: '12/25',
        cvv: '***',
      },
      status: 'completed',
      createdAt: new Date(Date.now() - prng.nextInt(1, 30) * 86400000).toISOString(),
    };

    addOrder(order);
  }
}

/**
 * Generate sample support ticket
 */
export function generateSampleTicket(prng: PRNG, userId: string): void {
  const subjects = [
    '¿Cómo puedo rastrear mi pedido?',
    'Problema con el pago',
    'Consulta sobre devolución',
    'Producto defectuoso',
  ];

  const ticket: SupportTicket = {
    id: `ticket-${Date.now()}`,
    userId,
    subject: prng.choice(subjects),
    description: 'Necesito ayuda con mi pedido reciente.',
    priority: prng.choice(['low', 'medium', 'high'] as const),
    status: 'open',
    createdAt: new Date(Date.now() - prng.nextInt(1, 7) * 86400000).toISOString(),
  };

  addTicket(ticket);
}

/**
 * Main seed function - initializes all data for a candidate
 */
export function seedData(candidateId: string): void {
  // Check if already seeded for this candidate
  const existingSession = getCandidateSession();
  if (existingSession && existingSession.candidateId === candidateId) {
    return; // Already seeded
  }

  const prng = new PRNG(candidateId);

  // Generate and save products
  const products = generateProducts(prng, 30);
  saveProducts(products);

  // Ensure demo user exists
  const demoUser = ensureDemoUser();

  // Generate sample data
  generateSampleOrders(prng, demoUser.id);
  generateSampleTicket(prng, demoUser.id);

  // Get active bugs for this candidate
  const activeBugs = getActiveBugs(candidateId);

  // Save session
  const session: CandidateSession = {
    candidateId,
    activeBugs,
    seedValue: prng.getSeed(),
    startedAt: new Date().toISOString(),
  };

  saveCandidateSession(session);
}

/**
 * Initialize app on first load
 */
export function initializeApp(): void {
  const candidateId = getCandidateId();
  if (!candidateId) {
    // No candidate ID - use default
    seedData('default');
  } else {
    seedData(candidateId);
  }

  // Ensure demo user always exists
  ensureDemoUser();
}

/**
 * Check if app needs initialization
 */
export function needsInitialization(): boolean {
  const products = getProducts();
  const users = getUsers();
  return products.length === 0 || users.length === 0;
}
