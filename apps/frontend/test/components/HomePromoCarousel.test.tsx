import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePromoCarousel from '@/components/HomePromoCarousel';

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

describe('HomePromoCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Fecha fija anterior al evento: el suite no debe depender del reloj real.
    vi.setSystemTime(new Date('2026-09-01T12:00:00Z'));
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza el slide del evento activo por defecto', () => {
    render(<HomePromoCarousel />);

    expect(screen.getByText('PY Testing Fest 2026')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Ir a novedad 1: PY Testing Fest 2026')
    ).toHaveAttribute('aria-current', 'true');
  });

  it('incluye un link por cada evaluación destacada y por el ranking', () => {
    const { container } = render(<HomePromoCarousel />);

    const hrefs = Array.from(container.querySelectorAll('a[href]')).map((a) =>
      a.getAttribute('href')
    );

    expect(hrefs).toContain('/eventos/py-testing-fest-2026');
    expect(hrefs).toContain('/ranking');
    expect(hrefs).toContain('/assessments/api-testing-fundamentals');
    expect(hrefs).toContain('/assessments/database-fundamentals');
    expect(hrefs).toContain('/assessments/database-practice');
    expect(hrefs).toContain('/assessments/infrastructure-fundamentals');
    expect(hrefs).toContain('/assessments/api-developer-fundamentals');
    expect(hrefs).toContain('/assessments/api-banking');
  });

  it('avanza de slide automáticamente con el tiempo', () => {
    render(<HomePromoCarousel />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(
      screen.getByLabelText('Ir a novedad 2: Ranking AIQUAA')
    ).toHaveAttribute('aria-current', 'true');
  });

  it('pausa el autoplay al pasar el mouse (hover)', () => {
    render(<HomePromoCarousel />);

    const region = screen.getByRole('region', { name: /Novedades/i });
    fireEvent.mouseEnter(region);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(
      screen.getByLabelText('Ir a novedad 1: PY Testing Fest 2026')
    ).toHaveAttribute('aria-current', 'true');
  });

  it('navega manualmente con las flechas prev/next', async () => {
    const user = userEvent.setup({ delay: null });
    render(<HomePromoCarousel />);

    await user.click(screen.getByLabelText('Siguiente novedad'));
    expect(
      screen.getByLabelText('Ir a novedad 2: Ranking AIQUAA')
    ).toHaveAttribute('aria-current', 'true');

    await user.click(screen.getByLabelText('Novedad anterior'));
    expect(
      screen.getByLabelText('Ir a novedad 1: PY Testing Fest 2026')
    ).toHaveAttribute('aria-current', 'true');
  });

  it('navega con teclado (flecha derecha) sobre el carrusel', async () => {
    const user = userEvent.setup({ delay: null });
    render(<HomePromoCarousel />);

    const region = screen.getByRole('region', { name: /Novedades/i });
    region.focus();
    await user.keyboard('{ArrowRight}');

    expect(
      screen.getByLabelText('Ir a novedad 2: Ranking AIQUAA')
    ).toHaveAttribute('aria-current', 'true');
  });

  it('permite ir directo a un slide haciendo click en su dot', async () => {
    const user = userEvent.setup({ delay: null });
    render(<HomePromoCarousel />);

    await user.click(
      screen.getByLabelText(/Ir a novedad 3: API Testing — Fundamentos/i)
    );

    expect(
      screen.getByLabelText(/Ir a novedad 3: API Testing — Fundamentos/i)
    ).toHaveAttribute('aria-current', 'true');
  });

  it('muestra el slide del evento antes de la fecha del evento', () => {
    render(
      <HomePromoCarousel now={new Date('2026-09-26T12:00:00Z').getTime()} />
    );

    expect(screen.getByText('PY Testing Fest 2026')).toBeInTheDocument();
  });

  it('oculta el slide del evento una vez pasada la fecha', () => {
    render(
      <HomePromoCarousel now={new Date('2026-10-01T12:00:00Z').getTime()} />
    );

    expect(screen.queryByText('PY Testing Fest 2026')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Ir a novedad 1: Ranking AIQUAA')
    ).toHaveAttribute('aria-current', 'true');
  });
});
