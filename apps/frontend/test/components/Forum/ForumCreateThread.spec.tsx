import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForumCreateThread from '../../../src/components/Forum/ForumCreateThread';
import { CreateThreadData } from '../../../src/services/forumService';

// Mock del servicio del foro
jest.mock('../../../src/services/forumService', () => ({
  getCategories: jest.fn().mockResolvedValue({
    success: true,
    data: ['General', 'Tecnología', 'Ayuda', 'Discusión']
  }),
  getTags: jest.fn().mockResolvedValue({
    success: true,
    data: ['react', 'typescript', 'nextjs']
  })
}));

describe('ForumCreateThread', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ForumCreateThread
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
  };

  it('renderiza correctamente el formulario', () => {
    renderComponent();
    
    expect(screen.getByText('Crear Nuevo Thread')).toBeInTheDocument();
    expect(screen.getByLabelText('Título del Thread *')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoría *')).toBeInTheDocument();
    expect(screen.getByLabelText('Contenido del Thread *')).toBeInTheDocument();
    expect(screen.getByText('Crear Thread')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('carga las categorías al montar el componente', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('General')).toBeInTheDocument();
    });
  });

  it('permite escribir en el título', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByLabelText('Título del Thread *');
    await user.type(titleInput, 'Mi primer thread');
    
    expect(titleInput).toHaveValue('Mi primer thread');
  });

  it('permite escribir en el contenido', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const contentInput = screen.getByLabelText('Contenido del Thread *');
    await user.type(contentInput, 'Este es el contenido de mi thread');
    
    expect(contentInput).toHaveValue('Este es el contenido de mi thread');
  });

  it('permite agregar tags', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const tagInput = screen.getByPlaceholderText('Agregar tag...');
    const addButton = screen.getByText('Agregar');
    
    await user.type(tagInput, 'react');
    await user.click(addButton);
    
    expect(screen.getByText('#react')).toBeInTheDocument();
  });

  it('permite remover tags', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const tagInput = screen.getByPlaceholderText('Agregar tag...');
    const addButton = screen.getByText('Agregar');
    
    await user.type(tagInput, 'react');
    await user.click(addButton);
    
    const removeButton = screen.getByText('×');
    await user.click(removeButton);
    
    expect(screen.queryByText('#react')).not.toBeInTheDocument();
  });

  it('valida que el título sea requerido', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const submitButton = screen.getByText('Crear Thread');
    await user.click(submitButton);
    
    expect(screen.getByText('El título es requerido')).toBeInTheDocument();
  });

  it('valida que el título tenga al menos 5 caracteres', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByLabelText('Título del Thread *');
    const submitButton = screen.getByText('Crear Thread');
    
    await user.type(titleInput, 'Hola');
    await user.click(submitButton);
    
    expect(screen.getByText('El título debe tener al menos 5 caracteres')).toBeInTheDocument();
  });

  it('valida que el contenido sea requerido', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByLabelText('Título del Thread *');
    const submitButton = screen.getByText('Crear Thread');
    
    await user.type(titleInput, 'Título válido');
    await user.click(submitButton);
    
    expect(screen.getByText('El contenido es requerido')).toBeInTheDocument();
  });

  it('valida que el contenido tenga al menos 20 caracteres', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByLabelText('Título del Thread *');
    const contentInput = screen.getByLabelText('Contenido del Thread *');
    const submitButton = screen.getByText('Crear Thread');
    
    await user.type(titleInput, 'Título válido');
    await user.type(contentInput, 'Contenido corto');
    await user.click(submitButton);
    
    expect(screen.getByText('El contenido debe tener al menos 20 caracteres')).toBeInTheDocument();
  });

  it('envía el formulario con datos válidos', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByLabelText('Título del Thread *');
    const contentInput = screen.getByLabelText('Contenido del Thread *');
    const submitButton = screen.getByText('Crear Thread');
    
    await user.type(titleInput, 'Mi primer thread en el foro');
    await user.type(contentInput, 'Este es el contenido de mi primer thread en el foro de la comunidad');
    
    mockOnSubmit.mockResolvedValue({ success: true });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Mi primer thread en el foro',
        content: 'Este es el contenido de mi primer thread en el foro de la comunidad',
        category: 'General',
        tags: []
      });
    });
  });

  it('llama a onCancel cuando se presiona el botón cancelar', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('muestra el contador de caracteres del título', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByLabelText('Título del Thread *');
    await user.type(titleInput, 'Hola');
    
    expect(screen.getByText('4/200 caracteres')).toBeInTheDocument();
  });

  it('muestra el contador de caracteres del contenido', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const contentInput = screen.getByLabelText('Contenido del Thread *');
    await user.type(contentInput, 'Contenido de prueba');
    
    expect(screen.getByText('20 caracteres (mínimo 20)')).toBeInTheDocument();
  });

  it('permite agregar tags con Enter', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const tagInput = screen.getByPlaceholderText('Agregar tag...');
    await user.type(tagInput, 'typescript{enter}');
    
    expect(screen.getByText('#typescript')).toBeInTheDocument();
  });

  it('no permite agregar tags duplicados', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const tagInput = screen.getByPlaceholderText('Agregar tag...');
    const addButton = screen.getByText('Agregar');
    
    await user.type(tagInput, 'react');
    await user.click(addButton);
    
    await user.type(tagInput, 'react');
    await user.click(addButton);
    
    // Solo debe haber un tag
    expect(screen.getAllByText(/#react/)).toHaveLength(1);
  });

  it('no permite agregar más de 10 tags', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const tagInput = screen.getByPlaceholderText('Agregar tag...');
    const addButton = screen.getByText('Agregar');
    
    // Agregar 10 tags
    for (let i = 1; i <= 10; i++) {
      await user.type(tagInput, `tag${i}`);
      await user.click(addButton);
    }
    
    // Intentar agregar uno más
    await user.type(tagInput, 'tag11');
    await user.click(addButton);
    
    expect(screen.queryByText('#tag11')).not.toBeInTheDocument();
  });

  it('resetea el formulario después de un envío exitoso', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByLabelText('Título del Thread *');
    const contentInput = screen.getByLabelText('Contenido del Thread *');
    const submitButton = screen.getByText('Crear Thread');
    
    await user.type(titleInput, 'Mi thread');
    await user.type(contentInput, 'Contenido de mi thread que cumple con el mínimo de caracteres requerido');
    
    mockOnSubmit.mockResolvedValue({ success: true });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
    });
  });
});

