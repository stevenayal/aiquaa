import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import GoogleAnalytics from '../../src/components/GoogleAnalytics';
import { usePathname, useSearchParams } from 'next/navigation';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock de window.gtag
const mockGtag = vi.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
  // configurable: sin esto los tests que hacen `delete window.gtag` para probar
  // el caso "gtag todavia no cargo" fallaban con "Cannot delete property".
  configurable: true,
});

// Mock de document.head.appendChild
const mockAppendChild = vi.fn();
Object.defineProperty(document, 'head', {
  value: { appendChild: mockAppendChild },
  writable: true,
  configurable: true,
});

// Mock de process.env
const originalEnv = process.env;

describe('GoogleAnalytics', () => {
  // vi.mocked sobre el import ESM. Con require() se resolvia el modulo real en
  // vez del mock, asi que usePathname no era un spy y .mockReturnValue no existia.
  const mockUsePathname = vi.mocked(usePathname);
  const mockUseSearchParams = vi.mocked(useSearchParams);

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };

    // Configurar mocks por defecto
    mockUsePathname.mockReturnValue('/test-page');
    mockUseSearchParams.mockReturnValue({
      toString: vi.fn().mockReturnValue('?param=value'),
    });

    // Limpiar window.gtag
    delete (window as any).gtag;
    mockGtag.mockClear();
    mockAppendChild.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const renderComponent = () => {
    return render(<GoogleAnalytics />);
  };

  it('renderiza sin contenido visible', () => {
    const { container } = renderComponent();

    expect(container.firstChild).toBeNull();
  });

  it('carga el script de Google Analytics cuando no existe gtag', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockAppendChild).toHaveBeenCalledTimes(2);
    });

    // Verificar que se cargó el script principal
    const firstCall = mockAppendChild.mock.calls[0][0];
    expect(firstCall.tagName).toBe('SCRIPT');
    expect(firstCall.async).toBe(true);
    expect(firstCall.src).toContain('googletagmanager.com/gtag/js');

    // Verificar que se cargó el script de configuración
    const secondCall = mockAppendChild.mock.calls[1][0];
    expect(secondCall.tagName).toBe('SCRIPT');
    expect(secondCall.innerHTML).toContain("gtag('js', new Date())");
  });

  it('usa el ID de medición del environment variable', async () => {
    // GA_MEASUREMENT_ID es una const de modulo: se evalua una sola vez, al
    // importar. Cambiar process.env despues no la afecta, por eso hay que
    // resetear el registro de modulos y re-importar el componente.
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
    vi.resetModules();
    const { default: FreshGoogleAnalytics } = await import(
      '../../src/components/GoogleAnalytics'
    );

    render(<FreshGoogleAnalytics />);

    await waitFor(() => {
      expect(mockAppendChild).toHaveBeenCalled();
    });

    const firstCall = mockAppendChild.mock.calls[0][0];
    expect(firstCall.src).toContain('G-TEST123');

    const secondCall = mockAppendChild.mock.calls[1][0];
    expect(secondCall.innerHTML).toContain('G-TEST123');
  });

  it('usa el ID de medición por defecto cuando no hay environment variable', async () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    renderComponent();

    await waitFor(() => {
      expect(mockAppendChild).toHaveBeenCalled();
    });

    const firstCall = mockAppendChild.mock.calls[0][0];
    expect(firstCall.src).toContain('G-XXXXXXXXXX');

    const secondCall = mockAppendChild.mock.calls[1][0];
    expect(secondCall.innerHTML).toContain('G-XXXXXXXXXX');
  });

  it('configura gtag cuando ya existe y hay searchParams', async () => {
    // Simular que gtag ya existe
    (window as any).gtag = mockGtag;

    renderComponent();

    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-XXXXXXXXXX', {
        page_path: '/test-page?param=value',
      });
    });
  });

  it('no configura gtag cuando no hay searchParams', async () => {
    // Simular que gtag ya existe
    (window as any).gtag = mockGtag;
    mockUseSearchParams.mockReturnValue(null);

    renderComponent();

    await waitFor(() => {
      expect(mockGtag).not.toHaveBeenCalledWith(
        'config',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  it('no configura gtag cuando no existe gtag', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockGtag).not.toHaveBeenCalledWith(
        'config',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  it('maneja cambios en pathname y searchParams', async () => {
    // Simular que gtag ya existe
    (window as any).gtag = mockGtag;

    const { rerender } = renderComponent();

    // Cambiar pathname y searchParams
    mockUsePathname.mockReturnValue('/nueva-pagina');
    mockUseSearchParams.mockReturnValue({
      toString: vi.fn().mockReturnValue('?nuevo=valor'),
    });

    rerender(<GoogleAnalytics />);

    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-XXXXXXXXXX', {
        page_path: '/nueva-pagina?nuevo=valor',
      });
    });
  });

  it('crea correctamente el script de configuración', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockAppendChild).toHaveBeenCalledTimes(2);
    });

    const configScript = mockAppendChild.mock.calls[1][0];
    expect(configScript.innerHTML).toContain(
      'window.dataLayer = window.dataLayer || []'
    );
    expect(configScript.innerHTML).toContain(
      'function gtag(){dataLayer.push(arguments);}'
    );
    expect(configScript.innerHTML).toContain("gtag('js', new Date())");
    expect(configScript.innerHTML).toContain("gtag('config', 'G-XXXXXXXXXX')");
  });

  // Los dos tests que habia aca borraban global.window y global.document y
  // despues pedian un render. Eso no prueba la guarda `typeof window` del
  // componente: rompe a React, que necesita document para renderizar, asi que
  // fallaban siempre. Bajo jsdom `typeof window` es siempre 'undefined' -> false,
  // esa rama solo se recorre en SSR real. Lo que si es observable aca es que el
  // componente no rompe cuando gtag todavia no existe, que es el caso real en
  // la primera carga de la pagina.
  it('no lanza error cuando gtag todavía no está cargado', () => {
    delete (window as any).gtag;

    expect(() => renderComponent()).not.toThrow();
  });

  it('no recarga scripts si gtag ya existe', async () => {
    // Simular que gtag ya existe
    (window as any).gtag = mockGtag;

    renderComponent();

    await waitFor(() => {
      // No debe haber llamado a appendChild porque gtag ya existe
      expect(mockAppendChild).not.toHaveBeenCalled();
    });
  });

  it('configura gtag solo una vez por cambio de ruta', async () => {
    // Simular que gtag ya existe
    (window as any).gtag = mockGtag;

    const { rerender } = renderComponent();

    // Primera configuración
    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledTimes(1);
    });

    // Re-renderizar sin cambios
    rerender(<GoogleAnalytics />);

    // No debe configurar nuevamente
    expect(mockGtag).toHaveBeenCalledTimes(1);
  });

  it('maneja URLs complejas correctamente', async () => {
    // Simular que gtag ya existe
    (window as any).gtag = mockGtag;

    mockUsePathname.mockReturnValue('/forum/thread/123');
    mockUseSearchParams.mockReturnValue({
      toString: vi.fn().mockReturnValue('?category=tech&sort=newest'),
    });

    renderComponent();

    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-XXXXXXXXXX', {
        page_path: '/forum/thread/123?category=tech&sort=newest',
      });
    });
  });

  it('maneja searchParams vacíos correctamente', async () => {
    // Simular que gtag ya existe
    (window as any).gtag = mockGtag;

    mockUseSearchParams.mockReturnValue({
      toString: vi.fn().mockReturnValue(''),
    });

    renderComponent();

    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-XXXXXXXXXX', {
        page_path: '/test-page',
      });
    });
  });

  it('maneja múltiples re-renders correctamente', async () => {
    // Simular que gtag ya existe
    (window as any).gtag = mockGtag;

    const { rerender } = renderComponent();

    // Primer render
    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledTimes(1);
    });

    // Segundo render
    rerender(<GoogleAnalytics />);

    // Tercer render
    rerender(<GoogleAnalytics />);

    // Solo debe haberse llamado una vez
    expect(mockGtag).toHaveBeenCalledTimes(1);
  });
});
