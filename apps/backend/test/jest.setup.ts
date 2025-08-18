import '@testing-library/jest-dom';

// Configuración global para tests
beforeAll(() => {
  // Configurar variables de entorno para tests
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET = 'test-secret-key';
});

afterAll(() => {
  // Limpiar variables de entorno
  delete process.env.TEST_DATABASE_URL;
});

// Configurar timeouts globales
jest.setTimeout(30000);
