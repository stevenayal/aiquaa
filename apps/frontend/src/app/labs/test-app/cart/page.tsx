'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TestAppLayout from '../components/TestAppLayout';
import { useToast } from '../components/Toast';
import { apiGetCart, apiUpdateCartQty, apiRemoveFromCart } from '../lib/mockApi';
import { getProducts } from '../lib/storage';
import type { CartItem, Product } from '../lib/types';
import { getCandidateId } from '../lib/prng';
import { isBugActive, BUG_IDS } from '../lib/bugsManifest';
import { logUpdateCartQty, logRemoveFromCart } from '../lib/auditLog';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [taxNeedsRecalc, setTaxNeedsRecalc] = useState(false);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    loadCart();
    const allProducts = getProducts();
    setProducts(allProducts);
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [cart]);

  const loadCart = async () => {
    try {
      const response = await apiGetCart();
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (error) {
      showToast('Error al cargar carrito', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const candidateId = getCandidateId() || 'default';
    const totalBugActive = isBugActive(BUG_IDS.CART_TOTAL_DESYNCED, candidateId);

    const sub = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(sub);

    // BUG: Tax doesn't recalculate immediately when quantity changes fast
    if (totalBugActive && !taxNeedsRecalc) {
      // Don't update tax immediately
      setTaxNeedsRecalc(true);
    } else {
      const calculatedTax = Math.round(sub * 0.1 * 100) / 100;
      setTax(calculatedTax);
      setTotal(sub + calculatedTax);
      setTaxNeedsRecalc(false);
    }
  };

  const handleUpdateQty = async (productId: string, newQty: number) => {
    const oldQty = cart.find((item) => item.productId === productId)?.quantity || 0;

    setUpdating(true);
    try {
      const response = await apiUpdateCartQty(productId, newQty);
      if (response.success && response.data) {
        setCart(response.data);
        logUpdateCartQty(productId, oldQty, newQty);
      } else {
        showToast(response.error || 'Error al actualizar cantidad', 'error');
      }
    } catch (error) {
      showToast('Error inesperado', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (productId: string) => {
    setUpdating(true);
    try {
      const response = await apiRemoveFromCart(productId);
      if (response.success && response.data) {
        setCart(response.data);
        logRemoveFromCart(productId);
        showToast('Producto eliminado del carrito', 'success');
      }
    } catch (error) {
      showToast('Error al eliminar producto', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getProductDetails = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  if (loading) {
    return (
      <TestAppLayout requireAuth>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando carrito...</p>
        </div>
      </TestAppLayout>
    );
  }

  return (
    <TestAppLayout requireAuth>
      {ToastComponent}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Carrito de Compras</h1>
          <p className="text-sm text-gray-600">
            <strong>Objetivo:</strong> Revisar y gestionar productos antes de comprar
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
            <Link
              href="/labs/test-app/catalog"
              className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
            >
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const product = getProductDetails(item.productId);
                if (!product) return null;

                return (
                  <div key={item.productId} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-4">
                      <Link href={`/labs/test-app/product/${product.id}`}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link href={`/labs/test-app/product/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-amber-600">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <p className="text-lg font-bold text-amber-600 mt-2">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                            disabled={updating}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) {
                                handleUpdateQty(item.productId, val);
                              }
                            }}
                            onBlur={(e) => {
                              // Delayed validation allows invalid values
                              const val = parseInt(e.target.value);
                              if (isNaN(val) || val < 1) {
                                handleUpdateQty(item.productId, 1);
                              } else if (val > product.stock) {
                                handleUpdateQty(item.productId, product.stock);
                              }
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center"
                            disabled={updating}
                          />
                          <button
                            onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                            disabled={updating || item.quantity >= product.stock}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Impuestos (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {taxNeedsRecalc && (
                    <p className="text-xs text-amber-600">
                      * Recalculando impuestos...
                    </p>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/labs/test-app/checkout')}
                  className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 font-medium"
                >
                  Proceder al Checkout
                </button>
                <Link
                  href="/labs/test-app/catalog"
                  className="block text-center text-amber-600 hover:text-amber-700 mt-4"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </TestAppLayout>
  );
}
