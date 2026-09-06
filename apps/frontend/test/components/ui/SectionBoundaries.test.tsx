import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Skeleton, { SkeletonScreen } from '@/components/ui/Skeleton';
import SectionError from '@/components/ui/SectionError';

describe('Skeleton', () => {
  it('se oculta a la tecnología asistiva', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  // 838 animaciones en el proyecto contra 4 referencias a reduced-motion. Los
  // skeletons nuevos no suman a esa deuda: laten solo si el sistema lo permite.
  it('anima solo cuando el sistema no pide movimiento reducido', () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toHaveClass('motion-safe:animate-pulse');
    expect(container.firstChild).not.toHaveClass('animate-pulse');
  });
});

describe('SkeletonScreen', () => {
  it('anuncia la carga a un lector de pantalla', () => {
    render(
      <SkeletonScreen label="Cargando el ranking…">
        <Skeleton />
      </SkeletonScreen>
    );

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Cargando el ranking…')).toBeInTheDocument();
  });
});

describe('SectionError', () => {
  const baseProps = {
    error: new Error('boom') as Error & { digest?: string },
    reset: vi.fn(),
    emoji: '🏆',
    title: 'El ranking no pudo cargar',
    description: 'Ocurrió un error al traer las posiciones.',
    backHref: '/dashboard',
    backLabel: 'Ir a tu panel',
  };

  beforeEach(() => {
    // el componente loguea el error a proposito; no ensuciar la salida del test
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('anuncia el error con role alert', () => {
    render(<SectionError {...baseProps} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'El ranking no pudo cargar' })
    ).toBeInTheDocument();
  });

  it('ofrece reintentar y una salida a la sección', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<SectionError {...baseProps} reset={reset} />);

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(reset).toHaveBeenCalledOnce();

    expect(screen.getByRole('link', { name: 'Ir a tu panel' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });

  // Sin el digest, un reporte de usuario no se puede cruzar con el log del server.
  it('muestra el digest cuando el error lo trae', () => {
    const error = Object.assign(new Error('boom'), { digest: 'abc123' });
    render(<SectionError {...baseProps} error={error} />);

    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });

  it('no muestra código de error cuando no hay digest', () => {
    render(<SectionError {...baseProps} />);

    expect(screen.queryByText(/Código de error/)).not.toBeInTheDocument();
  });

  it('registra el error para poder diagnosticarlo', () => {
    render(<SectionError {...baseProps} />);

    expect(console.error).toHaveBeenCalled();
  });
});
