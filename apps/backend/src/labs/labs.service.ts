import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { AllPairsGeneratedEvent } from './events/allpairs-generated.event';
import { randomUUID } from 'crypto';

type LabPriority = 'low' | 'medium' | 'high';
type LabTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type LabOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface LabProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

interface LabCartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface LabShippingAddress {
  fullName: string;
  street: string;
  apartmentSuite: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface LabPaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

interface LabOrder {
  id: string;
  userId: string;
  items: LabCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: LabShippingAddress;
  paymentInfo: Omit<LabPaymentInfo, 'cvv'> & { cvv: string };
  status: LabOrderStatus;
  createdAt: string;
}

interface LabTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  priority: LabPriority;
  status: LabTicketStatus;
  createdAt: string;
}

interface LabAuditEntry {
  id: string;
  timestamp: string;
  candidateId: string;
  action: string;
  details: Record<string, unknown>;
  success: boolean;
}

interface LabUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  timezone: string;
  createdAt: string;
}

interface LabSession {
  sessionId: string;
  candidateId: string;
  activeBugs: string[];
  seedValue: number;
  startedAt: string;
  user: LabUser;
  products: LabProduct[];
  cart: LabCartItem[];
  orders: LabOrder[];
  tickets: LabTicket[];
  auditLog: LabAuditEntry[];
}

interface ProductFilters {
  search?: string;
  category?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name';
  page?: number;
  pageSize?: number;
}

interface LabCheckoutInput {
  shippingAddress: LabShippingAddress;
  paymentInfo: LabPaymentInfo;
}

const DEMO_USER = {
  email: 'tester@aiquaa.com',
  password: 'Test1234!',
  name: 'Tester Demo',
  phone: '+595 991 234567',
  timezone: 'America/Asuncion',
};

const COHORT_IDS = new Set(['default', 'demo', 'team-a', 'team-b']);
const BUG_IDS = [
  'FILTER_INCONSISTENT',
  'SORT_UNSTABLE',
  'QUANTITY_VALIDATION',
  'TOTAL_STALE',
  'CHECKOUT_500',
  'TIMEZONE_BUG',
  'A11Y_PRODUCT',
  'XSS_SEARCH',
  'TICKET_PRIORITY',
  'BACK_BUTTON_STATE',
] as const;

const CATEGORIES = [
  'Electrónica',
  'Ropa',
  'Hogar',
  'Deportes',
  'Libros',
  'Juguetes',
  'Alimentación',
] as const;

const PRODUCT_NAMES: Record<(typeof CATEGORIES)[number], string[]> = {
  Electrónica: [
    'Auriculares Bluetooth',
    'Mouse Inalámbrico',
    'Teclado Mecánico',
    'Webcam HD',
    'Micrófono USB',
  ],
  Ropa: [
    'Camiseta Básica',
    'Jeans Clásicos',
    'Zapatillas Deportivas',
    'Bufanda de Lana',
  ],
  Hogar: [
    'Lámpara LED',
    'Cojín Decorativo',
    'Organizador de Escritorio',
    'Reloj de Pared',
  ],
  Deportes: [
    'Pelota de Fútbol',
    'Esterilla de Yoga',
    'Pesas 5kg',
    'Mochila Deportiva',
  ],
  Libros: [
    'Novela de Ficción',
    'Manual de Programación',
    'Guía de Viajes',
    'Diccionario',
  ],
  Juguetes: [
    'Puzzle 1000 Piezas',
    'Juego de Mesa',
    'Peluche Osito',
    'Auto a Control Remoto',
  ],
  Alimentación: [
    'Café Premium 250g',
    'Té Verde Orgánico',
    'Chocolate Artesanal',
    'Miel Natural 500g',
  ],
};

class PRNG {
  constructor(private seed: number) {}

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choice<T>(items: readonly T[]): T {
    return items[this.nextInt(0, items.length - 1)];
  }
}

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);
  private readonly sessions = new Map<string, LabSession>();

  constructor(private readonly eventBus: EventBus) {}

  async sendGitExamResult(_examResult: any): Promise<void> {
    this.logger.debug(
      'sendGitExamResult called but email notifications are disabled'
    );
  }

  async sendTechnicalBugReport(_report: any): Promise<void> {
    this.logger.debug(
      'sendTechnicalBugReport called but email notifications are disabled'
    );
  }

  async trackAllPairsGeneration(
    userId: number,
    combinationsCount: number,
    sessionId: string
  ): Promise<void> {
    this.eventBus.publish(
      new AllPairsGeneratedEvent(userId, combinationsCount, sessionId)
    );
  }

  seedTestApp(candidateId: string, sessionId?: string) {
    const normalizedCandidateId = this.normalizeCandidateId(candidateId);
    const resolvedSessionId = sessionId || randomUUID();
    const session = this.createSession(
      normalizedCandidateId,
      resolvedSessionId
    );
    this.sessions.set(resolvedSessionId, session);

    return this.serializeSession(session);
  }

  resetTestApp(sessionId?: string, candidateId?: string) {
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new NotFoundException('Sesión de laboratorio no encontrada');
      }
      this.sessions.delete(sessionId);
      return {
        message: 'Sesión reiniciada exitosamente',
        sessionId,
        candidateId: session.candidateId,
      };
    }

    const normalizedCandidateId = this.normalizeCandidateId(
      candidateId || 'demo'
    );
    for (const [id, session] of this.sessions.entries()) {
      if (session.candidateId === normalizedCandidateId) {
        this.sessions.delete(id);
      }
    }

    return {
      message: 'Cohorte reiniciada exitosamente',
      candidateId: normalizedCandidateId,
    };
  }

  getEvidence(sessionId: string) {
    const session = this.getSession(sessionId);
    return {
      sessionId: session.sessionId,
      candidateId: session.candidateId,
      startedAt: session.startedAt,
      activeBugs: session.activeBugs,
      auditLog: session.auditLog,
      orders: session.orders,
      tickets: session.tickets,
    };
  }

  getProductsForTestApp(
    sessionId: string | undefined,
    candidateId: string | undefined,
    filters: ProductFilters
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    let products = [...session.products];

    if (filters.search?.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category?.trim()) {
      products = products.filter(
        (product) => product.category === filters.category
      );
    }

    const totalBeforeBug = products.length;

    switch (filters.sortBy || 'name') {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      default:
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;
    const start = (page - 1) * pageSize;
    const paginatedProducts = products.slice(start, start + pageSize);
    const hasFilterBug = session.activeBugs.includes('FILTER_INCONSISTENT');
    const total =
      hasFilterBug && filters.search && filters.category
        ? totalBeforeBug + 2
        : products.length;

    this.addAuditEntry(session, 'GET_PRODUCTS', {
      page,
      pageSize,
      total,
      search: filters.search,
      category: filters.category,
    });

    return {
      sessionId: session.sessionId,
      candidateId: session.candidateId,
      products: paginatedProducts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(products.length / pageSize),
      activeBugs: session.activeBugs,
    };
  }

  getProductForTestApp(
    sessionId: string | undefined,
    candidateId: string | undefined,
    productId: string
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    const product = session.products.find((item) => item.id === productId);
    if (!product) {
      this.addAuditEntry(session, 'GET_PRODUCT', { productId }, false);
      throw new NotFoundException('Producto no encontrado');
    }

    this.addAuditEntry(session, 'GET_PRODUCT', { productId });
    return {
      sessionId: session.sessionId,
      product,
    };
  }

  getCartForTestApp(
    sessionId: string | undefined,
    candidateId: string | undefined
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    this.addAuditEntry(session, 'GET_CART', { items: session.cart.length });
    return {
      sessionId: session.sessionId,
      candidateId: session.candidateId,
      items: session.cart,
    };
  }

  addCartItem(
    sessionId: string | undefined,
    candidateId: string | undefined,
    productId: string,
    quantity: number
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    const product = session.products.find((item) => item.id === productId);
    if (!product) {
      this.addAuditEntry(
        session,
        'ADD_CART_ITEM',
        { productId, quantity },
        false
      );
      throw new NotFoundException('Producto no encontrado');
    }
    if (quantity <= 0) {
      this.addAuditEntry(
        session,
        'ADD_CART_ITEM',
        { productId, quantity },
        false
      );
      throw new BadRequestException('Cantidad inválida');
    }
    if (quantity > product.stock) {
      this.addAuditEntry(
        session,
        'ADD_CART_ITEM',
        { productId, quantity },
        false
      );
      throw new BadRequestException('Stock insuficiente');
    }

    const existing = session.cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      session.cart.push({ productId, quantity, price: product.price });
    }

    this.addAuditEntry(session, 'ADD_CART_ITEM', { productId, quantity });
    return {
      sessionId: session.sessionId,
      items: session.cart,
    };
  }

  updateCartItem(
    sessionId: string | undefined,
    candidateId: string | undefined,
    productId: string,
    quantity: number
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    const product = session.products.find((item) => item.id === productId);
    if (!product) {
      this.addAuditEntry(
        session,
        'UPDATE_CART_ITEM',
        { productId, quantity },
        false
      );
      throw new NotFoundException('Producto no encontrado');
    }

    if (!session.activeBugs.includes('QUANTITY_VALIDATION')) {
      if (quantity < 0) {
        this.addAuditEntry(
          session,
          'UPDATE_CART_ITEM',
          { productId, quantity },
          false
        );
        throw new BadRequestException('Cantidad inválida');
      }
      if (quantity > product.stock) {
        this.addAuditEntry(
          session,
          'UPDATE_CART_ITEM',
          { productId, quantity },
          false
        );
        throw new BadRequestException('Stock insuficiente');
      }
    }

    const index = session.cart.findIndex(
      (item) => item.productId === productId
    );
    if (index === -1) {
      this.addAuditEntry(
        session,
        'UPDATE_CART_ITEM',
        { productId, quantity },
        false
      );
      throw new NotFoundException('Ítem de carrito no encontrado');
    }

    if (quantity <= 0) {
      session.cart.splice(index, 1);
    } else {
      session.cart[index].quantity = quantity;
    }

    this.addAuditEntry(session, 'UPDATE_CART_ITEM', { productId, quantity });
    return {
      sessionId: session.sessionId,
      items: session.cart,
    };
  }

  removeCartItem(
    sessionId: string | undefined,
    candidateId: string | undefined,
    productId: string
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    session.cart = session.cart.filter((item) => item.productId !== productId);
    this.addAuditEntry(session, 'REMOVE_CART_ITEM', { productId });
    return {
      sessionId: session.sessionId,
      items: session.cart,
    };
  }

  checkoutTestApp(
    sessionId: string | undefined,
    candidateId: string | undefined,
    input: LabCheckoutInput
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    if (
      session.activeBugs.includes('CHECKOUT_500') &&
      input.shippingAddress.apartmentSuite.length > 50
    ) {
      this.addAuditEntry(
        session,
        'CHECKOUT',
        { apartmentSuiteLength: input.shippingAddress.apartmentSuite.length },
        false
      );
      throw new BadRequestException(
        'Error 500: Error interno del servidor. Por favor intente nuevamente.'
      );
    }

    if (!input.shippingAddress.fullName?.trim()) {
      throw new BadRequestException('Nombre completo es requerido');
    }
    if (!input.shippingAddress.street?.trim()) {
      throw new BadRequestException('Dirección es requerida');
    }
    if (session.cart.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const subtotal = session.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const order: LabOrder = {
      id: `order-${Date.now()}`,
      userId: session.user.id,
      items: [...session.cart],
      subtotal,
      tax,
      total: subtotal + tax,
      shippingAddress: input.shippingAddress,
      paymentInfo: {
        ...input.paymentInfo,
        cardNumber: `**** **** **** ${input.paymentInfo.cardNumber.slice(-4)}`,
        cvv: '***',
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    session.orders.push(order);
    session.cart = [];
    this.addAuditEntry(session, 'CHECKOUT', {
      orderId: order.id,
      total: order.total,
    });

    return {
      sessionId: session.sessionId,
      order,
    };
  }

  getOrdersForTestApp(
    sessionId: string | undefined,
    candidateId: string | undefined
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    this.addAuditEntry(session, 'GET_ORDERS', { count: session.orders.length });
    return {
      sessionId: session.sessionId,
      candidateId: session.candidateId,
      orders: session.orders,
      timezone: session.user.timezone,
    };
  }

  createTicketForTestApp(
    sessionId: string | undefined,
    candidateId: string | undefined,
    subject: string,
    description: string,
    priority: LabPriority
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    const actualPriority =
      session.activeBugs.includes('TICKET_PRIORITY') && priority === 'high'
        ? 'medium'
        : priority;

    const ticket: LabTicket = {
      id: `ticket-${Date.now()}`,
      userId: session.user.id,
      subject,
      description,
      priority: actualPriority,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    session.tickets.push(ticket);
    this.addAuditEntry(session, 'CREATE_TICKET', {
      ticketId: ticket.id,
      priority: actualPriority,
    });

    return {
      sessionId: session.sessionId,
      ticket,
    };
  }

  getTicketsForTestApp(
    sessionId: string | undefined,
    candidateId: string | undefined
  ) {
    const session = this.resolveSession(sessionId, candidateId);
    this.addAuditEntry(session, 'GET_TICKETS', {
      count: session.tickets.length,
    });
    return {
      sessionId: session.sessionId,
      candidateId: session.candidateId,
      tickets: session.tickets,
    };
  }

  private resolveSession(sessionId?: string, candidateId?: string) {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    const normalizedCandidateId = this.normalizeCandidateId(
      candidateId || 'demo'
    );
    const existing = [...this.sessions.values()].find(
      (session) => session.candidateId === normalizedCandidateId
    );
    if (existing) {
      return existing;
    }

    const seeded = this.seedTestApp(normalizedCandidateId);
    return this.sessions.get(seeded.sessionId)!;
  }

  private getSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException('Sesión de laboratorio no encontrada');
    }
    return session;
  }

  private normalizeCandidateId(candidateId: string) {
    const normalized = candidateId.toLowerCase().trim();
    return COHORT_IDS.has(normalized)
      ? normalized
      : candidateId.trim() || 'demo';
  }

  private createSession(candidateId: string, sessionId: string): LabSession {
    const seedValue = this.hashSeed(candidateId);
    const prng = new PRNG(seedValue);
    const user: LabUser = {
      id: 'user-demo',
      ...DEMO_USER,
      createdAt: new Date().toISOString(),
    };
    const products = this.generateProducts(prng, 24);
    const activeBugs = this.pickActiveBugs(prng);
    const session: LabSession = {
      sessionId,
      candidateId,
      activeBugs,
      seedValue,
      startedAt: new Date().toISOString(),
      user,
      products,
      cart: [],
      orders: this.generateSampleOrders(prng, user.id, products),
      tickets: this.generateSampleTickets(prng, user.id),
      auditLog: [],
    };

    this.addAuditEntry(session, 'SEED_SESSION', {
      candidateId,
      activeBugs,
      products: products.length,
    });

    return session;
  }

  private serializeSession(session: LabSession) {
    return {
      sessionId: session.sessionId,
      candidateId: session.candidateId,
      seedValue: session.seedValue,
      startedAt: session.startedAt,
      demoUser: {
        email: session.user.email,
        password: session.user.password,
        timezone: session.user.timezone,
      },
      activeBugs: session.activeBugs,
      sampleData: {
        products: session.products.length,
        orders: session.orders.length,
        tickets: session.tickets.length,
      },
    };
  }

  private generateProducts(prng: PRNG, count: number) {
    return Array.from({ length: count }, (_, index) => {
      const category = prng.choice(CATEGORIES);
      const name = prng.choice(PRODUCT_NAMES[category]);
      return {
        id: `prod-${index + 1}`,
        name: `${name} ${index + 1}`,
        description: `Descripción controlada para ${name}. Ideal para escenarios de testing funcional.`,
        price: Math.round(prng.nextFloat(10, 500) * 100) / 100,
        stock: prng.nextInt(0, 50),
        category,
        imageUrl: `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(name)}`,
      };
    });
  }

  private generateSampleOrders(
    prng: PRNG,
    userId: string,
    products: LabProduct[]
  ) {
    const orderCount = prng.nextInt(1, 2);
    return Array.from({ length: orderCount }, (_, index) => {
      const itemCount = prng.nextInt(1, 3);
      const selectedProducts = [...products]
        .sort(() => prng.next() - 0.5)
        .slice(0, itemCount);
      const items = selectedProducts.map((product) => ({
        productId: product.id,
        quantity: prng.nextInt(1, 2),
        price: product.price,
      }));
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = Math.round(subtotal * 0.1 * 100) / 100;
      return {
        id: `seed-order-${index + 1}`,
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
        status: 'completed' as const,
        createdAt: new Date(
          Date.now() - prng.nextInt(1, 30) * 86400000
        ).toISOString(),
      };
    });
  }

  private generateSampleTickets(prng: PRNG, userId: string) {
    const subjects = [
      '¿Cómo puedo rastrear mi pedido?',
      'Problema con el pago',
      'Consulta sobre devolución',
      'Producto defectuoso',
    ];
    return [
      {
        id: 'seed-ticket-1',
        userId,
        subject: prng.choice(subjects),
        description: 'Necesito ayuda con un flujo controlado del laboratorio.',
        priority: prng.choice(['low', 'medium', 'high'] as const),
        status: 'open' as const,
        createdAt: new Date(
          Date.now() - prng.nextInt(1, 7) * 86400000
        ).toISOString(),
      },
    ];
  }

  private pickActiveBugs(prng: PRNG) {
    const bugs = [...BUG_IDS];
    bugs.sort(() => prng.next() - 0.5);
    return bugs.slice(0, prng.nextInt(6, 8));
  }

  private hashSeed(value: string) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash || 123456;
  }

  private addAuditEntry(
    session: LabSession,
    action: string,
    details: Record<string, unknown>,
    success = true
  ) {
    session.auditLog.push({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      candidateId: session.candidateId,
      action,
      details,
      success,
    });
  }
}
