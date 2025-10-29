import type {
  User,
  Product,
  CartItem,
  Order,
  SupportTicket,
  CandidateSession,
} from './types';

// Storage keys
const KEYS = {
  USERS: 'test-app:users',
  PRODUCTS: 'test-app:products',
  CART: 'test-app:cart',
  ORDERS: 'test-app:orders',
  TICKETS: 'test-app:tickets',
  CURRENT_USER: 'test-app:current-user',
  SESSION: 'test-app:session',
} as const;

// Generic storage helpers
function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return null;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

// Users
export function getUsers(): User[] {
  return getFromStorage<User[]>(KEYS.USERS) || [];
}

export function saveUsers(users: User[]): void {
  saveToStorage(KEYS.USERS, users);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(userId: string, updates: Partial<User>): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
}

export function findUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find((u) => u.email === email) || null;
}

// Current user session
export function getCurrentUser(): User | null {
  return getFromStorage<User>(KEYS.CURRENT_USER);
}

export function setCurrentUser(user: User | null): void {
  if (user === null) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  } else {
    saveToStorage(KEYS.CURRENT_USER, user);
  }
}

// Products
export function getProducts(): Product[] {
  return getFromStorage<Product[]>(KEYS.PRODUCTS) || [];
}

export function saveProducts(products: Product[]): void {
  saveToStorage(KEYS.PRODUCTS, products);
}

export function findProductById(productId: string): Product | null {
  const products = getProducts();
  return products.find((p) => p.id === productId) || null;
}

// Cart
export function getCart(): CartItem[] {
  const user = getCurrentUser();
  if (!user) return [];

  const allCarts = getFromStorage<Record<string, CartItem[]>>(KEYS.CART) || {};
  return allCarts[user.id] || [];
}

export function saveCart(items: CartItem[]): void {
  const user = getCurrentUser();
  if (!user) return;

  const allCarts = getFromStorage<Record<string, CartItem[]>>(KEYS.CART) || {};
  allCarts[user.id] = items;
  saveToStorage(KEYS.CART, allCarts);
}

export function addToCart(productId: string, quantity: number, price: number): void {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ productId, quantity, price });
  }

  saveCart(cart);
}

export function updateCartItemQty(productId: string, quantity: number): void {
  const cart = getCart();
  const index = cart.findIndex((item) => item.productId === productId);
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart(cart);
  }
}

export function removeFromCart(productId: string): void {
  const cart = getCart();
  const filtered = cart.filter((item) => item.productId !== productId);
  saveCart(filtered);
}

export function clearCart(): void {
  saveCart([]);
}

// Orders
export function getOrders(): Order[] {
  return getFromStorage<Order[]>(KEYS.ORDERS) || [];
}

export function saveOrders(orders: Order[]): void {
  saveToStorage(KEYS.ORDERS, orders);
}

export function addOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}

export function getUserOrders(userId: string): Order[] {
  const orders = getOrders();
  return orders.filter((o) => o.userId === userId);
}

// Support Tickets
export function getTickets(): SupportTicket[] {
  return getFromStorage<SupportTicket[]>(KEYS.TICKETS) || [];
}

export function saveTickets(tickets: SupportTicket[]): void {
  saveToStorage(KEYS.TICKETS, tickets);
}

export function addTicket(ticket: SupportTicket): void {
  const tickets = getTickets();
  tickets.push(ticket);
  saveTickets(tickets);
}

export function getUserTickets(userId: string): SupportTicket[] {
  const tickets = getTickets();
  return tickets.filter((t) => t.userId === userId);
}

// Candidate Session
export function getCandidateSession(): CandidateSession | null {
  return getFromStorage<CandidateSession>(KEYS.SESSION);
}

export function saveCandidateSession(session: CandidateSession): void {
  saveToStorage(KEYS.SESSION, session);
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return;

  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

// Reset session (keep products, clear user data)
export function resetSession(): void {
  if (typeof window === 'undefined') return;

  [KEYS.CART, KEYS.ORDERS, KEYS.TICKETS, KEYS.CURRENT_USER, KEYS.SESSION].forEach((key) => {
    localStorage.removeItem(key);
  });
}
