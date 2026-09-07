import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';

const mockProgress = vi.fn();

vi.mock('@/actions/assessments', () => ({
  getMyAssessmentProgressAction: () => mockProgress(),
}));

import AssessmentsIndexPage from '@/app/assessments/page';
import { allAssessments, assessmentCategories } from '@/lib/assessmentsCatalog';

// Server Component async: se resuelve a mano y se renderiza el árbol devuelto.
async function renderPage() {
  return render(await AssessmentsIndexPage());
}

describe('/assessments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProgress.mockResolvedValue({ hasSession: false, progress: {} });
  });

  it('lista las 17 evaluaciones sin dejar ninguna afuera', async () => {
    await renderPage();

    for (const { definition } of allAssessments) {
      expect(
        screen.getAllByRole('link', { name: definition.title }).length
      ).toBeGreaterThan(0);
    }
  });

  // Ley de Hick / Fragmentación: 17 tarjetas sueltas en una columna era el
  // problema. Cada una tiene que caer bajo un encabezado de categoría.
  it('agrupa por categorías con encabezado propio', async () => {
    await renderPage();

    for (const category of assessmentCategories) {
      expect(
        screen.getByRole('heading', { name: category.name })
      ).toBeInTheDocument();
    }
  });

  it('muestra la franja de destacados antes que las categorías', async () => {
    await renderPage();

    const destacados = screen.getByRole('heading', { name: /Para empezar/ });
    const primeraCategoria = screen.getByRole('heading', {
      name: assessmentCategories[0].name,
    });

    // compareDocumentPosition: el orden en el DOM es el orden de lectura, que
    // es lo que hace que los destacados funcionen (Posición en Serie).
    expect(
      destacados.compareDocumentPosition(primeraCategoria) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('el enlace de la tarjeta se llama como la evaluación, no como toda la tarjeta', async () => {
    await renderPage();

    const link = screen.getAllByRole('link', {
      name: 'Docker — Fundamentos',
    })[0];
    expect(link).toHaveAttribute('href', '/assessments/docker-fundamentals');
  });

  it('sin sesión no muestra ningún badge de progreso', async () => {
    mockProgress.mockResolvedValue({ hasSession: false, progress: {} });
    await renderPage();

    expect(screen.queryByText(/Aprobado ·/)).not.toBeInTheDocument();
    expect(screen.queryByText('En curso')).not.toBeInTheDocument();
  });

  it('marca "Aprobado" con el mejor puntaje', async () => {
    mockProgress.mockResolvedValue({
      hasSession: true,
      progress: {
        'docker-fundamentals': {
          passed: true,
          bestPercentage: 88,
          inProgress: false,
        },
      },
    });
    await renderPage();

    expect(screen.getAllByText('Aprobado · 88%').length).toBeGreaterThan(0);
  });

  it('marca "En curso" y ofrece continuar', async () => {
    mockProgress.mockResolvedValue({
      hasSession: true,
      progress: {
        'docker-fundamentals': {
          passed: false,
          bestPercentage: 0,
          inProgress: true,
        },
      },
    });
    await renderPage();

    expect(screen.getAllByText('En curso').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Continuar/).length).toBeGreaterThan(0);
  });

  it('muestra el mejor puntaje de un intento no aprobado', async () => {
    mockProgress.mockResolvedValue({
      hasSession: true,
      progress: {
        'docker-fundamentals': {
          passed: false,
          bestPercentage: 45,
          inProgress: false,
        },
      },
    });
    await renderPage();

    expect(screen.getAllByText('Mejor: 45%').length).toBeGreaterThan(0);
  });

  it('cada tarjeta expone nivel, duración y puntaje', async () => {
    await renderPage();

    const heading = screen.getAllByRole('link', {
      name: 'Docker — Fundamentos',
    })[0];
    const card = heading.closest('article');
    expect(card).not.toBeNull();

    const scoped = within(card as HTMLElement);
    expect(scoped.getByText('Trainee a Junior')).toBeInTheDocument();
    expect(scoped.getByText('35 min')).toBeInTheDocument();
    expect(scoped.getByText('100 pts')).toBeInTheDocument();
  });
});
