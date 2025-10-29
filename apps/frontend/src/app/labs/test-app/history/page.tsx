'use client';

import { useState, useEffect } from 'react';
import TestAppLayout from '../components/TestAppLayout';
import { apiGetOrders } from '../lib/mockApi';
import { getProducts } from '../lib/storage';
import type { Order } from '../lib/types';

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiGetOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    // BUG: Timezone bug - always shows UTC instead of user's timezone
    // Should use user.timezone but doesn't
    const date = new Date(dateString);
    return date.toLocaleString('es-PY', {
      timeZone: 'UTC', // Bug: hardcoded UTC instead of user timezone
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'Procesando';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <TestAppLayout requireAuth>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Pedidos</h1>
          <p className="text-sm text-gray-600">
            <strong>Objetivo:</strong> Ver todos los pedidos realizados anteriormente
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No tienes pedidos aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Pedido #{order.id}</h3>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Productos:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const product = getProducts().find((p) => p.id === item.productId);
                      return (
                        <div
                          key={item.productId}
                          className="flex justify-between text-sm text-gray-600"
                        >
                          <span>
                            {product?.name || 'Producto'} x{item.quantity}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Dirección de envío:</strong>
                      </p>
                      <p>
                        {order.shippingAddress.street}
                        {order.shippingAddress.apartmentSuite &&
                          `, ${order.shippingAddress.apartmentSuite}`}
                      </p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal: ${order.subtotal.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Impuestos: ${order.tax.toFixed(2)}</p>
                      <p className="text-lg font-bold text-gray-900">
                        Total: ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TestAppLayout>
  );
}
