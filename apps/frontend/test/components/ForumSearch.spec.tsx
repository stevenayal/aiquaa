import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForumSearch } from '../../src/components/ForumSearch';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn()
}));

const mockUseSearchParams = require('next/navigation').useSearchParams;

describe('ForumSearch', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('')
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <ForumSearch
        onSearch={mockOnSearch}
        placeholder="Buscar hilos..."
        className=""
        {...props}
      />
    );
  };

  it('renderiza correctamente el componente', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText('Buscar hilos...')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar hilos')).toBeInTheDocument();
    expect(screen.getByTestId('forum-search-input')).toBeInTheDocument();
  });

  it('permite personalizar el placeholder', () => {
    renderComponent({ placeholder: 'Buscar en foros...' });
    
    expect(screen.getByPlaceholderText('Buscar en foros...')).toBeInTheDocument();
  });

  it('permite personalizar la clase CSS', () => {
    const { container } = renderComponent({ className: 'custom-class' });
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('permite escribir en el campo de búsqueda', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    await user.type(searchInput, 'react hooks');
    
    expect(searchInput).toHaveValue('react hooks');
  });

  it('aplica debounce a la búsqueda', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    await user.type(searchInput, 'react');
    
    // La búsqueda no debe ejecutarse inmediatamente
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Avanzar el tiempo para activar el debounce
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('react');
    });
    
    jest.useRealTimers();
  });

  it('ejecuta la búsqueda después del debounce', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    await user.type(searchInput, 'typescript');
    
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('typescript');
    });
    
    jest.useRealTimers();
  });

  it('no ejecuta búsquedas duplicadas', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    
    // Escribir "react"
    await user.type(searchInput, 'react');
    jest.advanceTimersByTime(300);
    
    // Escribir "react" nuevamente
    await user.clear(searchInput);
    await user.type(searchInput, 'react');
    jest.advanceTimersByTime(300);
    
    // Solo debe haberse llamado una vez
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
  });

  it('muestra el botón de limpiar cuando hay texto', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    await user.type(searchInput, 'react');
    
    expect(screen.getByTestId('clear-search-button')).toBeInTheDocument();
    expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument();
  });

  it('no muestra el botón de limpiar cuando no hay texto', () => {
    renderComponent();
    
    expect(screen.queryByTestId('clear-search-button')).not.toBeInTheDocument();
  });

  it('limpia la búsqueda cuando se presiona el botón limpiar', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    await user.type(searchInput, 'react');
    
    const clearButton = screen.getByTestId('clear-search-button');
    await user.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('inicializa el valor de búsqueda desde los parámetros de URL', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('react hooks')
    });
    
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    expect(searchInput).toHaveValue('react hooks');
  });

  it('no ejecuta búsqueda si el valor de URL es igual al valor actual', async () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('react')
    });
    
    jest.useFakeTimers();
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    await user.type(searchInput, 'react');
    
    jest.advanceTimersByTime(300);
    
    // No debe ejecutar búsqueda porque el valor es igual al de la URL
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('maneja cambios en los parámetros de URL', async () => {
    const mockSearchParams = {
      get: jest.fn().mockReturnValue('')
    };
    
    mockUseSearchParams.mockReturnValue(mockSearchParams);
    
    const { rerender } = renderComponent();
    
    // Cambiar los parámetros de URL
    mockSearchParams.get.mockReturnValue('nuevo valor');
    
    rerender(
      <ForumSearch
        onSearch={mockOnSearch}
        placeholder="Buscar hilos..."
        className=""
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    expect(searchInput).toHaveValue('nuevo valor');
  });

  it('aplica estilos de focus correctamente', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    await user.click(searchInput);
    
    expect(searchInput).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent');
  });

  it('aplica estilos de dark mode correctamente', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    
    expect(searchInput).toHaveClass('dark:bg-gray-800', 'dark:text-white', 'dark:border-gray-600');
  });

  it('maneja el caso cuando searchParams es null', () => {
    mockUseSearchParams.mockReturnValue(null);
    
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('maneja el caso cuando searchParams.get devuelve null', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null)
    });
    
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    expect(searchInput).toHaveValue('');
  });

  it('mantiene el estado local independiente de los parámetros de URL', async () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('valor inicial')
    });
    
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    
    // Cambiar el valor localmente
    await user.clear(searchInput);
    await user.type(searchInput, 'nuevo valor local');
    
    expect(searchInput).toHaveValue('nuevo valor local');
    
    // El valor local no debe cambiar si cambian los parámetros de URL
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('otro valor')
    });
    
    expect(searchInput).toHaveValue('nuevo valor local');
  });

  it('ejecuta búsqueda con el valor correcto después del debounce', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    
    // Escribir texto rápidamente
    await user.type(searchInput, 'react');
    await user.type(searchInput, ' typescript');
    
    // Avanzar el tiempo para activar el debounce
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('react typescript');
    });
    
    jest.useRealTimers();
  });

  it('cancela el timer anterior cuando se escribe nuevo texto', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Buscar hilos...');
    
    // Escribir "react" y esperar un poco
    await user.type(searchInput, 'react');
    jest.advanceTimersByTime(150);
    
    // Escribir "typescript" antes de que se complete el primer timer
    await user.type(searchInput, ' typescript');
    jest.advanceTimersByTime(150);
    
    // Solo debe haberse ejecutado la búsqueda final
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('react typescript');
    
    jest.useRealTimers();
  });
});

