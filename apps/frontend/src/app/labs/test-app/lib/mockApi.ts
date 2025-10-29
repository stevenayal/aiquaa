import type {
  User,
  Product,
  CartItem,
  Order,
  SupportTicket,
  ShippingAddress,
  PaymentInfo,
} from './types';
import {
  findUserByEmail,
  addUser,
  getCurrentUser,
  setCurrentUser,
  getProducts,
  findProductById,
  getCart,
  addToCart as storageAddToCart,
  updateCartItemQty,
  removeFromCart as storageRemoveFromCart,
  clearCart as storageClearCart,
  addOrder,
  getUserOrders,
  updateUser,
  addTicket,
  getUserTickets,
} from './storage';
import { getCandidateId } from './prng';
import { isBugActive, BUG_IDS } from './bugsManifest';

/**
 * Simulate API delay
 */
async function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========== AUTH API ==========

export async function apiLogin(
  email: string,
  password: string
): Promise<ApiResponse<User>> {
  await delay(400);

  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Contraseña incorrecta' };
  }

  setCurrentUser(user);
  return { success: true, data: user };
}

export async function apiRegister(
  email: string,
  password: string,
  name: string
): Promise<ApiResponse<User>> {
  await delay(500);

  // Check if user exists
  const existing = findUserByEmail(email);
  if (existing) {
    return { success: false, error: 'El email ya está registrado' };
  }

  // Validate password
  if (password.length < 8) {
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    password,
    name,
    phone: '',
    timezone: 'America/Asuncion',
    createdAt: new Date().toISOString(),
  };

  addUser(newUser);
  setCurrentUser(newUser);
  return { success: true, data: newUser };
}

export async function apiLogout(): Promise<ApiResponse<void>> {
  await delay(200);
  setCurrentUser(null);
  return { success: true };
}

// ========== PRODUCTS API ==========

export interface ProductFilters {
  search?: string;
  category?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name';
  page?: number;
  pageSize?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function apiGetProducts(
  filters: ProductFilters = {}
): Promise<ApiResponse<ProductsResponse>> {
  await delay(300);

  const candidateId = getCandidateId() || 'default';
  let products = getProducts();

  // Search filter
  if (filters.search && filters.search.trim() !== '') {
    const searchLower = filters.search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    );
  }

  // Category filter
  if (filters.category) {
    products = products.filter((p) => p.category === filters.category);
  }

  // BUG: Filter inconsistent - count vs rendered items
  const filterBugActive = isBugActive(BUG_IDS.FILTER_INCONSISTENT, candidateId);
  const totalBeforeBug = products.length;

  // Sorting
  const sortBy = filters.sortBy || 'name';
  if (sortBy === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  // BUG: Unstable sort - items with same price jump between pages
  if (isBugActive(BUG_IDS.SORT_UNSTABLE, candidateId) && sortBy.startsWith('price')) {
    // Intentionally don't use stable sort secondary key
    // Items with same price will appear in different order on pagination
  }

  // Pagination
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedProducts = products.slice(start, end);

  // BUG: Return wrong total when filtering (off by 1-2)
  const reportedTotal = filterBugActive && filters.search && filters.category
    ? totalBeforeBug + 2  // Report wrong count
    : products.length;

  return {
    success: true,
    data: {
      products: paginatedProducts,
      total: reportedTotal,
      page,
      pageSize,
      totalPages: Math.ceil(products.length / pageSize),
    },
  };
}

export async function apiGetProduct(productId: string): Promise<ApiResponse<Product>> {
  await delay(250);

  const product = findProductById(productId);
  if (!product) {
    return { success: false, error: 'Producto no encontrado' };
  }

  return { success: true, data: product };
}

// ========== CART API ==========

export async function apiGetCart(): Promise<ApiResponse<CartItem[]>> {
  await delay(200);
  const cart = getCart();
  return { success: true, data: cart };
}

export async function apiAddToCart(
  productId: string,
  quantity: number
): Promise<ApiResponse<CartItem[]>> {
  await delay(300);

  const product = findProductById(productId);
  if (!product) {
    return { success: false, error: 'Producto no encontrado' };
  }

  if (quantity <= 0) {
    return { success: false, error: 'Cantidad inválida' };
  }

  if (quantity > product.stock) {
    return { success: false, error: 'Stock insuficiente' };
  }

  storageAddToCart(productId, quantity, product.price);
  const cart = getCart();
  return { success: true, data: cart };
}

export async function apiUpdateCartQty(
  productId: string,
  quantity: number
): Promise<ApiResponse<CartItem[]>> {
  // BUG: Quantity validation broken - allows 0 or > stock if typed fast
  const candidateId = getCandidateId() || 'default';
  const qtyBugActive = isBugActive(BUG_IDS.QUANTITY_VALIDATION, candidateId);

  if (qtyBugActive) {
    // Validation delay - allows invalid values to slip through
    await delay(100);
  } else {
    await delay(300);
  }

  const product = findProductById(productId);
  if (!product) {
    return { success: false, error: 'Producto no encontrado' };
  }

  // Delayed validation (bug allows bypass)
  if (!qtyBugActive) {
    if (quantity < 0) {
      return { success: false, error: 'Cantidad inválida' };
    }

    if (quantity > product.stock) {
      return { success: false, error: 'Stock insuficiente' };
    }
  }

  updateCartItemQty(productId, quantity);
  const cart = getCart();
  return { success: true, data: cart };
}

export async function apiRemoveFromCart(productId: string): Promise<ApiResponse<CartItem[]>> {
  await delay(200);
  storageRemoveFromCart(productId);
  const cart = getCart();
  return { success: true, data: cart };
}

// ========== CHECKOUT API ==========

export async function apiCheckout(
  shippingAddress: ShippingAddress,
  paymentInfo: PaymentInfo
): Promise<ApiResponse<Order>> {
  await delay(800);

  const candidateId = getCandidateId() || 'default';
  const checkoutBugActive = isBugActive(BUG_IDS.CHECKOUT_500, candidateId);

  // BUG: Apartment/Suite > 50 chars causes generic error
  if (checkoutBugActive && shippingAddress.apartmentSuite.length > 50) {
    return {
      success: false,
      error: 'Error 500: Error interno del servidor. Por favor intente nuevamente.',
    };
  }

  // Normal validation
  if (!shippingAddress.fullName || shippingAddress.fullName.trim().length === 0) {
    return { success: false, error: 'Nombre completo es requerido' };
  }

  if (!shippingAddress.street || shippingAddress.street.trim().length === 0) {
    return { success: false, error: 'Dirección es requerida' };
  }

  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const cart = getCart();
  if (cart.length === 0) {
    return { success: false, error: 'El carrito está vacío' };
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tax;

  const order: Order = {
    id: `order-${Date.now()}`,
    userId: user.id,
    items: cart,
    subtotal,
    tax,
    total,
    shippingAddress,
    paymentInfo: {
      ...paymentInfo,
      cardNumber: `**** **** **** ${paymentInfo.cardNumber.slice(-4)}`,
      cvv: '***',
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  addOrder(order);
  storageClearCart();

  return { success: true, data: order };
}

// ========== USER API ==========

export async function apiUpdateProfile(updates: {
  name?: string;
  phone?: string;
  timezone?: string;
}): Promise<ApiResponse<User>> {
  await delay(400);

  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  updateUser(user.id, updates);
  const updatedUser = { ...user, ...updates };
  setCurrentUser(updatedUser);

  return { success: true, data: updatedUser };
}

export async function apiGetOrders(): Promise<ApiResponse<Order[]>> {
  await delay(300);

  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const orders = getUserOrders(user.id);

  // BUG: Timezone - orders show in UTC instead of user's timezone
  const candidateId = getCandidateId() || 'default';
  const timezoneBugActive = isBugActive(BUG_IDS.TIMEZONE_BUG, candidateId);

  if (!timezoneBugActive && user.timezone) {
    // Normally would convert to user timezone (but bug skips this)
  }

  return { success: true, data: orders };
}

// ========== SUPPORT API ==========

export async function apiCreateTicket(
  subject: string,
  description: string,
  priority: 'low' | 'medium' | 'high'
): Promise<ApiResponse<SupportTicket>> {
  const candidateId = getCandidateId() || 'default';
  const priorityBugActive = isBugActive(BUG_IDS.TICKET_PRIORITY, candidateId);

  // BUG: Priority gets changed if submitted too fast
  let actualPriority = priority;
  if (priorityBugActive && priority === 'high') {
    await delay(150); // Fast response
    actualPriority = 'medium'; // Wrong priority assigned
  } else {
    await delay(400);
  }

  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const ticket: SupportTicket = {
    id: `ticket-${Date.now()}`,
    userId: user.id,
    subject,
    description,
    priority: actualPriority,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  addTicket(ticket);
  return { success: true, data: ticket };
}

export async function apiGetTickets(): Promise<ApiResponse<SupportTicket[]>> {
  await delay(300);

  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  const tickets = getUserTickets(user.id);
  return { success: true, data: tickets };
}
