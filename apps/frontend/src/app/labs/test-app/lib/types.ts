// Types for AIQUAA Test App

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  timezone: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  apartmentSuite: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  candidateId: string;
  action: string;
  details: Record<string, any>;
  success: boolean;
}

export interface Bug {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedFeature: string;
  enabled: boolean;
}

export interface CandidateSession {
  candidateId: string;
  activeBugs: string[];
  seedValue: number;
  startedAt: string;
}
