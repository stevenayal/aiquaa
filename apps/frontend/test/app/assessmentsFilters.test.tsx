import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssessmentsCatalog, {
  type CatalogItem,
  type CatalogCategory,
} from '@/app/assessments/_components/AssessmentsCatalog';

const categories: CatalogCategory[] = [
  { id: 'qa', name: 'QA y Testing', description: 'Criterio de testing' },
  { id: 'devops', name: 'DevOps', description: 'Contenedores y CI' },
];

function item(over: Partial<CatalogItem> = {}): CatalogItem {
  return {
    slug: 'docker-fundamentals',
    title: 'Docker — Fundamentos',
    description: 'Construcción de imágenes y contenedores',
    level: 'Trainee a Junior',
    durationMinutes: 35,
    totalScore: 100,
    icon: '🐳',
    categoryId: 'devops',
    categoryName: 'DevOps',
    featured: false,
    status: 'new',
    bestPercentage: 0,
    ...over,
  };
}

const items: CatalogItem[] = [
  item({
    slug: 'api-testing-fundamentals',
    title: 'API Testing — Fundamentos',
    description: 'Contratos REST y validación de respuestas',
    categoryId: 'qa',
    categoryName: 'QA y Testing',
    level: 'Junior a Semi Senior',
    featured: true,
  }),
  item({
    slug: 'playwright-fundamentals',
    title: 'Playwright — Fundamentos',
    description: 'Automatización web end to end',
    categoryId: 'qa',
    categoryName: 'QA y Testing',
    level: 'Junior a Semi Senior',
  }),
  item(),
  item({
    slug: 'cicd-fundamentals',
    title: 'CI/CD — Fundamentos',
    description: 'Pipelines de integración continua',
  }),
];

function renderCatalog(
  over: { hasSession?: boolean; items?: CatalogItem[] } = {}
) {
  return render(
    <AssessmentsCatalog
      items={over.items ?? items}
      categories={categories}
      hasSession={over.hasSession ?? false}
    />
  );
}

describe('buscador y filtros de /assessments', () => {
  it('el buscador tiene un label asociado, no solo placeholder', () => {
    renderCatalog();

    const input = screen.getByLabelText('Buscar evaluación');
    expect(input).toHaveAttribute('type', 'search');
  });

  it('filtra por texto del título', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.type(screen.getByLabelText('Buscar evaluación'), 'docker');

    expect(screen.getByText('Docker — Fundamentos')).toBeInTheDocument();
    expect(
      screen.queryByText('Playwright — Fundamentos')
    ).not.toBeInTheDocument();
  });

  it('filtra por texto de la descripción', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.type(screen.getByLabelText('Buscar evaluación'), 'pipelines');

    expect(screen.getByText('CI/CD — Fundamentos')).toBeInTheDocument();
    expect(screen.queryByText('Docker — Fundamentos')).not.toBeInTheDocument();
  });

  // Alguien que escribe rápido no pone tildes. Si "automatizacion" no encuentra
  // "Automatización", el buscador falla justo cuando más se lo necesita.
  it('encuentra sin acentos', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.type(
      screen.getByLabelText('Buscar evaluación'),
      'automatizacion'
    );

    expect(screen.getByText('Playwright — Fundamentos')).toBeInTheDocument();
  });

  it('ignora mayúsculas y espacios sobrantes', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.type(screen.getByLabelText('Buscar evaluación'), '  DOCKER  ');

    expect(screen.getByText('Docker — Fundamentos')).toBeInTheDocument();
  });

  it('filtra por categoría', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.click(screen.getByRole('button', { name: 'QA y Testing' }));

    expect(screen.getByText('API Testing — Fundamentos')).toBeInTheDocument();
    expect(screen.queryByText('Docker — Fundamentos')).not.toBeInTheDocument();
  });

  it('filtra por nivel', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.click(
      screen.getByRole('button', { name: 'Junior a Semi Senior' })
    );

    expect(screen.getByText('Playwright — Fundamentos')).toBeInTheDocument();
    expect(screen.queryByText('CI/CD — Fundamentos')).not.toBeInTheDocument();
  });

  it('combina buscador y filtro', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.click(screen.getByRole('button', { name: 'QA y Testing' }));
    await user.type(screen.getByLabelText('Buscar evaluación'), 'playwright');

    expect(screen.getByText('Playwright — Fundamentos')).toBeInTheDocument();
    expect(
      screen.queryByText('API Testing — Fundamentos')
    ).not.toBeInTheDocument();
  });

  it('marca el filtro activo con aria-pressed', async () => {
    const user = userEvent.setup();
    renderCatalog();

    const chip = screen.getByRole('button', { name: 'QA y Testing' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');

    await user.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  it('anuncia cuántos resultados quedaron', async () => {
    const user = userEvent.setup();
    renderCatalog();

    expect(screen.getByText('4 evaluaciones')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Buscar evaluación'), 'docker');

    const contador = screen.getByText('1 de 4 evaluaciones');
    expect(contador).toHaveAttribute('aria-live', 'polite');
  });

  it('ofrece salida cuando no hay coincidencias', async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.type(screen.getByLabelText('Buscar evaluación'), 'kubernetes');

    expect(
      screen.getByText('No hay evaluaciones que coincidan')
    ).toBeInTheDocument();

    // el estado vacío tiene que ofrecer el camino de vuelta, no solo informar
    await user.click(
      screen.getAllByRole('button', { name: 'Limpiar filtros' })[0]
    );

    expect(screen.getByText('Docker — Fundamentos')).toBeInTheDocument();
    expect(screen.getByText('4 evaluaciones')).toBeInTheDocument();
  });

  // Con un filtro activo el usuario ya dijo qué busca: repetir tarjetas arriba
  // duplicaría resultados en pantalla.
  it('esconde los destacados mientras hay un filtro activo', async () => {
    const user = userEvent.setup();
    renderCatalog();

    expect(
      screen.getByRole('heading', { name: /Para empezar/ })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'QA y Testing' }));

    expect(
      screen.queryByRole('heading', { name: /Para empezar/ })
    ).not.toBeInTheDocument();
  });

  it('no ofrece filtro por estado sin sesión', () => {
    renderCatalog({ hasSession: false });

    expect(
      screen.queryByRole('button', { name: 'Aprobadas' })
    ).not.toBeInTheDocument();
  });

  it('filtra por estado cuando hay sesión', async () => {
    const user = userEvent.setup();
    renderCatalog({
      hasSession: true,
      items: [
        item({
          slug: 'a',
          title: 'Aprobada',
          status: 'passed',
          bestPercentage: 90,
        }),
        item({ slug: 'b', title: 'Empezada', status: 'in_progress' }),
        item({ slug: 'c', title: 'Nueva', status: 'new' }),
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Aprobadas' }));

    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(screen.queryByText('Nueva')).not.toBeInTheDocument();
    expect(screen.queryByText('Empezada')).not.toBeInTheDocument();
  });

  it('oculta "Limpiar filtros" cuando no hay nada filtrado', async () => {
    const user = userEvent.setup();
    renderCatalog();

    expect(
      screen.queryByRole('button', { name: 'Limpiar filtros' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'DevOps' }));

    expect(
      screen.getByRole('button', { name: 'Limpiar filtros' })
    ).toBeInTheDocument();
  });
});
