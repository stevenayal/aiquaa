'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import TestAppLayout from '../../components/TestAppLayout';
import { useToast } from '../../components/Toast';
import { apiGetProduct, apiAddToCart } from '../../lib/mockApi';
import type { Product } from '../../lib/types';
import { getCandidateId } from '../../lib/prng';
import { isBugActive, BUG_IDS } from '../../lib/bugsManifest';
import { logAddToCart } from '../../lib/auditLog';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const response = await apiGetProduct(params.id as string);
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        showToast('Producto no encontrado', 'error');
        router.push('/labs/test-app/catalog');
      }
    } catch (error) {
      showToast('Error al cargar producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const response = await apiAddToCart(product.id, quantity);
      if (response.success) {
        logAddToCart(product.id, quantity);
        showToast(`${product.name} agregado al carrito`, 'success');
      } else {
        showToast(response.error || 'Error al agregar al carrito', 'error');
      }
    } catch (error) {
      showToast('Error inesperado', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <TestAppLayout requireAuth>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </TestAppLayout>
    );
  }

  if (!product) {
    return null;
  }

  const candidateId = getCandidateId() || 'default';
  const a11yBugActive = isBugActive(BUG_IDS.ACCESSIBILITY, candidateId);
  const isOutOfStock = product.stock === 0;

  return (
    <TestAppLayout requireAuth>
      {ToastComponent}
      <div>
        <Link
          href="/labs/test-app/catalog"
          className="text-amber-600 hover:text-amber-700 mb-6 inline-block"
        >
          ← Volver al catálogo
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {product.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <p className="text-gray-600 mb-6">{product.description}</p>

              <div className="mb-6">
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  ${product.price.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} unidades disponibles`
                    : 'Producto agotado'}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                {/* BUG: Accessibility - label without htmlFor */}
                <label className={a11yBugActive ? 'block text-sm font-medium text-gray-700 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Cantidad
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    id="quantity-input"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              {/* BUG: Accessibility - button missing aria-label when disabled */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || isOutOfStock}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
                {...(!a11yBugActive && isOutOfStock ? { 'aria-label': 'Producto agotado, no se puede agregar al carrito' } : {})}
              >
                {addingToCart
                  ? 'Agregando...'
                  : isOutOfStock
                  ? 'Agotado'
                  : 'Agregar al Carrito'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Objetivo:</strong> Ver detalles del producto y agregarlo al carrito de compras
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TestAppLayout>
  );
}
