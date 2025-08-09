import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HealthPage from '../../src/app/health/page';

describe('HealthPage', () => {
  it('should render health status when API is healthy', async () => {
    render(<HealthPage />);

    // Mostrar loading inicialmente
    expect(screen.getByText('Verificando conexión con el backend...')).toBeInTheDocument();

    // Esperar a que se cargue el estado
    await waitFor(() => {
      expect(screen.getByText('✅ Conectado')).toBeInTheDocument();
    });

    expect(screen.getByText('Status: ok')).toBeInTheDocument();
    expect(screen.getByText(/Time:/)).toBeInTheDocument();
  });

  it('should render error when API is not available', async () => {
    // Mock fetch para simular error
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    render(<HealthPage />);

    await waitFor(() => {
      expect(screen.getByText('❌ Error')).toBeInTheDocument();
    });

    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });
});
