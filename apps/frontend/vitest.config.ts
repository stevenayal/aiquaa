import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    css: true,
    include: [
      '**/*.spec.tsx',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.test.ts',
      'test/**/*.spec.tsx',
      'test/**/*.test.tsx',
      'test/**/*.spec.ts',
      'test/**/*.test.ts',
      './test/**/*.spec.tsx',
      './test/**/*.test.tsx',
      './test/**/*.spec.ts',
      './test/**/*.test.ts',
      path.resolve(__dirname, 'test/**/*.spec.tsx'),
      path.resolve(__dirname, 'test/**/*.test.tsx'),
      path.resolve(__dirname, 'test/**/*.spec.ts'),
      path.resolve(__dirname, 'test/**/*.test.ts'),
      path.resolve(__dirname, 'test', '**', '*.spec.tsx'),
      path.resolve(__dirname, 'test', '**', '*.test.tsx'),
      path.resolve(__dirname, 'test', '**', '*.spec.ts'),
      path.resolve(__dirname, 'test', '**', '*.test.ts'),
      // Patrones absolutos para CI/CD
      '/vercel/path0/apps/frontend/test/**/*.spec.tsx',
      '/vercel/path0/apps/frontend/test/**/*.test.tsx',
      '/vercel/path0/apps/frontend/test/**/*.spec.ts',
      '/vercel/path0/apps/frontend/test/**/*.test.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
