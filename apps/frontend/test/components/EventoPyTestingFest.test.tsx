import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PyTestingFestClient from '@/app/eventos/py-testing-fest-2026/PyTestingFestClient';
import { PY_TESTING_FEST_2026 as EVENT } from '@/lib/events/py-testing-fest-2026';

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

describe('PyTestingFestClient', () => {
  it('muestra el título, la fecha y la sede del evento', () => {
    render(<PyTestingFestClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: EVENT.title })
    ).toBeInTheDocument();
    expect(screen.getAllByText(EVENT.dateLabel).length).toBeGreaterThan(0);
    expect(screen.getAllByText(EVENT.venue).length).toBeGreaterThan(0);
  });

  it('lleva al formulario de inscripción en una pestaña nueva', () => {
    render(<PyTestingFestClient />);

    const links = screen.getAllByRole('link', {
      name: /Inscribirme gratis|Completar la inscripción/i,
    });

    expect(links.length).toBe(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', EVENT.registrationUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('lista las seis charlas con su speaker', () => {
    render(<PyTestingFestClient />);

    for (const speaker of EVENT.speakers) {
      expect(screen.getAllByText(speaker.talk).length).toBeGreaterThan(0);
      expect(screen.getAllByText(speaker.name).length).toBeGreaterThan(0);
    }
  });

  it('da alt descriptivo a cada imagen', () => {
    const { container } = render(<PyTestingFestClient />);

    const images = Array.from(container.querySelectorAll('img'));
    expect(images.length).toBe(EVENT.speakers.length + 1);
    for (const img of images) {
      expect(img.getAttribute('alt')).toBeTruthy();
    }
  });
});
