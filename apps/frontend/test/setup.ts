import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server';
import React from 'react';

// Hacer React disponible globalmente para JSX
(global as any).React = React;

// Compatibilidad para tests escritos con API de Jest
(global as any).jest = vi;

// Polyfill para crypto en tests
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto;

  // Polyfill adicional para getRandomValues
  if (!globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues = (array: any) => {
      const bytes = new Uint8Array(array.length);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      array.set(bytes);
      return array;
    };
  }
}

// Mock de fetch global
global.fetch = vi.fn();

// Establecer handlers de MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Resetear handlers y mocks después de cada test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
  if (global.fetch && typeof (global.fetch as any).mockClear === 'function') {
    (global.fetch as any).mockClear();
  }
});

// Limpiar después de todos los tests
afterAll(() => server.close());

// Configurar variables de entorno para tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
