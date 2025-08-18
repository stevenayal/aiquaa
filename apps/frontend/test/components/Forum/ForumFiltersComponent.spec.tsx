import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForumFiltersComponent from '../../../src/components/Forum/ForumFiltersComponent';
import { ForumFilters } from '../../../src/services/forumService';

// Mock del servicio del foro
jest.mock('../../../src/services/forumService', () => ({
  getCategories: jest.fn().mockResolvedValue({
    success: true,
    data: ['General', 'Tecnología', 'Ayuda', 'Discusión']
  }),
  getTags: jest.fn().mockResolvedValue({
    success: true,
    data: ['react', 'typescript', 'nextjs', 'javascript']
  })
}));

describe('ForumFiltersComponent', () => {
  const mockFilters: ForumFilters = {
    search: '',
    category: undefined,
    tags: [],
    sortBy: 'newest'
  };

  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (filters = mockFilters) => {
    return render(
      <ForumFiltersComponent
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
      />
    );
  };

  it('renderiza correctamente el componente', () => {
    renderComponent();
    
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar en threads...')).toBeInTheDocument();
    expect(screen.getByText('📂 Categorías')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Tags')).toBeInTheDocument();
    expect(screen.getByText('📊 Ordenar por')).toBeInTheDocument();
  });

  it('carga las categorías al montar el componente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('all')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Tecnología')).toBeInTheDocument();
      expect(screen.getByText('Ayuda')).toBeInTheDocument();
      expect(screen.getByText('Discusión')).toBeInTheDocument();
    });
  });

  it('carga los tags al montar el componente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(screen.getByText('nextjs')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  it('permite buscar threads', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar en threads...');
    await user.type(searchInput, 'react hooks');
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'react hooks' });
  });

  it('permite cambiar la categoría', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const categorySelect = screen.getByDisplayValue('all');
    await user.selectOptions(categorySelect, 'Tecnología');
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ category: 'Tecnología' });
  });

  it('permite seleccionar "todas las categorías"', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const categorySelect = screen.getByDisplayValue('all');
    await user.selectOptions(categorySelect, 'all');
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ category: undefined });
  });

  it('permite agregar tags a los filtros', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const reactTag = screen.getByText('react');
    await user.click(reactTag);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ tags: ['react'] });
  });

  it('permite remover tags de los filtros', async () => {
    const user = userEvent.setup();
    const filtersWithTags: ForumFilters = {
      ...mockFilters,
      tags: ['react', 'typescript']
    };
    
    renderComponent(filtersWithTags);
    
    const reactTag = screen.getByText('react');
    await user.click(reactTag);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ tags: ['typescript'] });
  });

  it('permite cambiar el orden de los threads', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const sortSelect = screen.getByDisplayValue('newest');
    await user.selectOptions(sortSelect, 'mostViewed');
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ sortBy: 'mostViewed' });
  });

  it('muestra los filtros activos', () => {
    const activeFilters: ForumFilters = {
      search: 'react hooks',
      category: 'Tecnología',
      tags: ['react', 'typescript'],
      sortBy: 'mostViewed'
    };
    
    renderComponent(activeFilters);
    
    expect(screen.getByText('🔍 Búsqueda: "react hooks"')).toBeInTheDocument();
    expect(screen.getByText('📂 Categoría: Tecnología')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Tags: react, typescript')).toBeInTheDocument();
    expect(screen.getByText('📊 Orden: Más vistos')).toBeInTheDocument();
  });

  it('muestra el botón de limpiar filtros cuando hay filtros activos', () => {
    const activeFilters: ForumFilters = {
      search: 'react',
      category: 'Tecnología',
      tags: ['react'],
      sortBy: 'newest'
    };
    
    renderComponent(activeFilters);
    
    expect(screen.getByText('🧹 Limpiar filtros')).toBeInTheDocument();
  });

  it('no muestra el botón de limpiar filtros cuando no hay filtros activos', () => {
    renderComponent();
    
    expect(screen.queryByText('🧹 Limpiar filtros')).not.toBeInTheDocument();
  });

  it('limpia todos los filtros cuando se presiona el botón limpiar', async () => {
    const user = userEvent.setup();
    const activeFilters: ForumFilters = {
      search: 'react',
      category: 'Tecnología',
      tags: ['react'],
      sortBy: 'mostViewed'
    };
    
    renderComponent(activeFilters);
    
    const clearButton = screen.getByText('🧹 Limpiar filtros');
    await user.click(clearButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: undefined,
      category: undefined,
      tags: undefined,
      sortBy: 'newest'
    });
  });

  it('resetea el campo de búsqueda cuando se limpian los filtros', async () => {
    const user = userEvent.setup();
    const activeFilters: ForumFilters = {
      search: 'react hooks',
      category: undefined,
      tags: [],
      sortBy: 'newest'
    };
    
    renderComponent(activeFilters);
    
    const clearButton = screen.getByText('🧹 Limpiar filtros');
    await user.click(clearButton);
    
    const searchInput = screen.getByPlaceholderText('Buscar en threads...');
    expect(searchInput).toHaveValue('');
  });

  it('maneja múltiples tags correctamente', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Agregar varios tags
    const reactTag = screen.getByText('react');
    const typescriptTag = screen.getByText('typescript');
    
    await user.click(reactTag);
    await user.click(typescriptTag);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ tags: ['react'] });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ tags: ['react', 'typescript'] });
  });

  it('maneja la eliminación de tags correctamente', async () => {
    const user = userEvent.setup();
    const filtersWithTags: ForumFilters = {
      ...mockFilters,
      tags: ['react', 'typescript', 'nextjs']
    };
    
    renderComponent(filtersWithTags);
    
    // Remover el tag del medio
    const typescriptTag = screen.getByText('typescript');
    await user.click(typescriptTag);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ tags: ['react', 'nextjs'] });
  });

  it('muestra el texto correcto para cada opción de orden', () => {
    const filters: ForumFilters = {
      ...mockFilters,
      sortBy: 'oldest'
    };
    
    renderComponent(filters);
    
    expect(screen.getByDisplayValue('oldest')).toBeInTheDocument();
  });

  it('aplica estilos visuales a los tags seleccionados', () => {
    const filtersWithTags: ForumFilters = {
      ...mockFilters,
      tags: ['react', 'typescript']
    };
    
    renderComponent(filtersWithTags);
    
    const reactTag = screen.getByText('react');
    const typescriptTag = screen.getByText('typescript');
    
    // Los tags seleccionados deben tener estilos diferentes
    expect(reactTag).toHaveClass('bg-brand-accent', 'text-white');
    expect(typescriptTag).toHaveClass('bg-brand-accent', 'text-white');
  });

  it('maneja el caso cuando no hay categorías disponibles', async () => {
    jest.mocked(require('../../../src/services/forumService').getCategories)
      .mockResolvedValue({ success: false, data: [] });
    
    renderComponent();
    
    await waitFor(() => {
      const categorySelect = screen.getByDisplayValue('all');
      expect(categorySelect.children).toHaveLength(1); // Solo la opción "all"
    });
  });

  it('maneja el caso cuando no hay tags disponibles', async () => {
    jest.mocked(require('../../../src/services/forumService').getTags)
      .mockResolvedValue({ success: false, data: [] });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByText('🏷️ Tags')).toBeInTheDocument();
      // No debe haber tags para mostrar
    });
  });

  it('mantiene el estado de los filtros entre re-renders', () => {
    const { rerender } = renderComponent();
    
    // Cambiar filtros
    const searchInput = screen.getByPlaceholderText('Buscar en threads...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Re-renderizar con los mismos filtros
    rerender(
      <ForumFiltersComponent
        filters={{ ...mockFilters, search: 'test' }}
        onFiltersChange={mockOnFiltersChange}
      />
    );
    
    expect(searchInput).toHaveValue('test');
  });
});

