import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatalogFilterBar, {
  type FilterGroup,
} from '@/components/ui/CatalogFilterBar';

function setup(over: Partial<Parameters<typeof CatalogFilterBar>[0]> = {}) {
  const onQueryChange = vi.fn();
  const onClear = vi.fn();
  const onChange = vi.fn();

  const groups: FilterGroup[] = [
    {
      id: 'cat',
      legend: 'Categoría',
      value: 'todas',
      onChange,
      options: [
        { value: 'todas', label: 'Todas' },
        { value: 'qa', label: 'QA' },
      ],
    },
  ];

  render(
    <CatalogFilterBar
      inputId="buscar"
      searchLabel="Buscar herramienta"
      searchPlaceholder="ISTQB…"
      query=""
      onQueryChange={onQueryChange}
      groups={groups}
      resultCount={10}
      totalCount={10}
      itemNoun="herramientas"
      isFiltering={false}
      onClear={onClear}
      {...over}
    />
  );

  return { onQueryChange, onClear, onChange };
}

describe('CatalogFilterBar', () => {
  // El placeholder no es una etiqueta: desaparece al escribir y no lo anuncia
  // ningún lector de pantalla. El repo tiene 223 <label> para 51 htmlFor, así
  // que esta pieza compartida no debería sumar a esa deuda.
  it('asocia el label con el input', () => {
    setup();

    const input = screen.getByLabelText('Buscar herramienta');
    expect(input).toHaveAttribute('id', 'buscar');
    expect(input).toHaveAttribute('type', 'search');
  });

  it('agrupa los chips en un fieldset con su legend', () => {
    setup();

    expect(
      screen.getByRole('group', { name: 'Categoría' })
    ).toBeInTheDocument();
  });

  it('marca el chip activo con aria-pressed', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'QA' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('avisa el cambio de filtro con el valor elegido', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.click(screen.getByRole('button', { name: 'QA' }));

    expect(onChange).toHaveBeenCalledWith('qa');
  });

  it('propaga lo tipeado', async () => {
    const user = userEvent.setup();
    const { onQueryChange } = setup();

    await user.type(screen.getByLabelText('Buscar herramienta'), 'a');

    expect(onQueryChange).toHaveBeenCalledWith('a');
  });

  // Filtrar es un cambio silencioso para quien no ve la grilla.
  it('anuncia el contador con aria-live', () => {
    setup({ resultCount: 3, totalCount: 10, isFiltering: true });

    const contador = screen.getByText('3 de 10 herramientas');
    expect(contador).toHaveAttribute('aria-live', 'polite');
  });

  it('sin filtrar muestra solo el total', () => {
    setup();

    expect(screen.getByText('10 herramientas')).toBeInTheDocument();
  });

  it('ofrece limpiar solo cuando hay algo que limpiar', async () => {
    const user = userEvent.setup();
    const { onClear } = setup({ isFiltering: true });

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('oculta "Limpiar filtros" sin filtros activos', () => {
    setup({ isFiltering: false });

    expect(
      screen.queryByRole('button', { name: 'Limpiar filtros' })
    ).not.toBeInTheDocument();
  });
});
