'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TestAppLayout from '../components/TestAppLayout';
import { useToast } from '../components/Toast';
import { apiGetProducts, type ProductFilters } from '../lib/mockApi';
import type { Product } from '../lib/types';
import { getCandidateId } from '../lib/prng';
import { isBugActive, BUG_IDS } from '../lib/bugsManifest';
import { logSearch, logFilter, logSort } from '../lib/auditLog';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const categories = [
    'Electrónica',
    'Ropa',
    'Hogar',
    'Deportes',
    'Libros',
    'Juguetes',
    'Alimentación',
  ];

  useEffect(() => {
    loadProducts();
  }, [page, search, category, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filters: ProductFilters = {
        page,
        pageSize: 12,
        search,
        category: category || undefined,
        sortBy,
      };

      const response = await apiGetProducts(filters);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // BUG: XSS Reflected - don't properly escape special chars in search
    const candidateId = getCandidateId() || 'default';
    const xssBugActive = isBugActive(BUG_IDS.XSS_REFLECTED, candidateId);

    if (xssBugActive) {
      // Allow "><test> to break placeholder (but escape <script>)
      const sanitized = searchInput.replace(/<script[^>]*>.*?<\/script>/gi, '');
      setSearch(sanitized);
    } else {
      // Properly sanitize
      setSearch(searchInput.trim());
    }

    setPage(1);
    logSearch(searchInput, total);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
    logFilter(cat || null);
  };

  const handleSortChange = (sort: 'price-asc' | 'price-desc' | 'name') => {
    setSortBy(sort);
    setPage(1);
    logSort(sort);
  };

  return (
    <TestAppLayout requireAuth>
      {ToastComponent}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Productos</h1>
          <p className="text-sm text-gray-600">
            <strong>Objetivo:</strong> Explorar y buscar productos disponibles en la tienda
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
              >
                Buscar
              </button>
            </form>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="name">Ordenar por Nombre</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>

          {/* Active Filters */}
          {(search || category) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {search && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm flex items-center space-x-2">
                  <span>Búsqueda: {search}</span>
                  <button
                    onClick={() => {
                      setSearch('');
                      setSearchInput('');
                      setPage(1);
                    }}
                    className="hover:text-amber-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {category && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm flex items-center space-x-2">
                  <span>Categoría: {category}</span>
                  <button
                    onClick={() => {
                      setCategory('');
                      setPage(1);
                    }}
                    className="hover:text-amber-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {products.length} de {total} productos
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/labs/test-app/product/${product.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                        {product.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-amber-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          product.stock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </TestAppLayout>
  );
}
