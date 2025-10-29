'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TestAppLayout from '../components/TestAppLayout';
import { useToast } from '../components/Toast';
import { apiCheckout, apiGetCart } from '../lib/mockApi';
import { getProducts } from '../lib/storage';
import type { CartItem, ShippingAddress, PaymentInfo } from '../lib/types';
import { logCheckoutAttempt, logCheckoutSuccess, logCheckoutFail } from '../lib/auditLog';

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    street: '',
    apartmentSuite: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Paraguay',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await apiGetCart();
      if (response.success && response.data) {
        if (response.data.length === 0) {
          showToast('El carrito está vacío', 'error');
          router.push('/labs/test-app/cart');
          return;
        }
        setCart(response.data);
      }
    } catch (error) {
      showToast('Error al cargar carrito', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    return subtotal + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();

    logCheckoutAttempt(total);
    setProcessing(true);

    try {
      const response = await apiCheckout(shippingAddress, paymentInfo);

      if (response.success && response.data) {
        logCheckoutSuccess(response.data.id, total);
        showToast('¡Pedido realizado con éxito!', 'success');
        setTimeout(() => {
          router.push('/labs/test-app/history');
        }, 1500);
      } else {
        logCheckoutFail(response.error || 'Unknown error');
        showToast(response.error || 'Error al procesar pedido', 'error');
      }
    } catch (error) {
      logCheckoutFail('Unexpected error');
      showToast('Error inesperado', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <TestAppLayout requireAuth>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </TestAppLayout>
    );
  }

  return (
    <TestAppLayout requireAuth>
      {ToastComponent}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-sm text-gray-600">
            <strong>Objetivo:</strong> Completar compra con datos de envío y pago
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping & Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Dirección de Envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calle y Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apartamento / Suite
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.apartmentSuite}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, apartmentSuite: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de Pago</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-800">
                  ⚠️ Simulación: No se procesarán pagos reales. Usa datos ficticios.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Tarjeta *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentInfo.cardNumber}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })
                    }
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titular de la Tarjeta *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentInfo.cardHolder}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, cardHolder: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Expiración *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentInfo.expiryDate}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })
                    }
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                  <input
                    type="text"
                    required
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-2 mb-4">
                {cart.map((item) => {
                  const product = getProducts().find((p) => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {product?.name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {processing ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </TestAppLayout>
  );
}
