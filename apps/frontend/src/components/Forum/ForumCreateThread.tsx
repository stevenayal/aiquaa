'use client';

import React, { useState, useEffect } from 'react';
import { CreateThreadData } from '../../services/forumService';
import forumService from '../../services/forumService';

interface ForumCreateThreadProps {
  onSubmit: (data: CreateThreadData) => Promise<{ success: boolean; message?: string }>;
  onCancel: () => void;
}

export default function ForumCreateThread({ onSubmit, onCancel }: ForumCreateThreadProps) {
  const [formData, setFormData] = useState<CreateThreadData>({
    title: '',
    content: '',
    category: 'General',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await forumService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    } else if (formData.title.length > 200) {
      newErrors.title = 'El título no puede exceder 200 caracteres';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es requerido';
    } else if (formData.content.length < 20) {
      newErrors.content = 'El contenido debe tener al menos 20 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'Debes seleccionar una categoría';
    }

    if (formData.tags.length > 10) {
      newErrors.tags = 'No puedes agregar más de 10 tags';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await onSubmit(formData);
      
      if (result.success) {
        // Resetear formulario
        setFormData({
          title: '',
          content: '',
          category: 'General',
          tags: [],
        });
        setTagInput('');
        setErrors({});
      } else {
        alert(result.message || 'Error creando thread');
      }
    } catch (error) {
      console.error('Error en submit:', error);
      alert('Error inesperado creando thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    
    if (!tag) return;
    
    if (formData.tags.includes(tag)) {
      alert('Este tag ya existe');
      return;
    }
    
    if (formData.tags.length >= 10) {
      alert('No puedes agregar más de 10 tags');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-brand-accent/20">
      <h2 className="text-2xl font-bold text-brand-text mb-6">Crear Nuevo Thread</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-brand-text mb-2">
            Título del Thread *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Escribe un título descriptivo para tu thread..."
            maxLength={200}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {formData.title.length}/200 caracteres
          </p>
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-brand-text mb-2">
            Categoría *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-brand-text mb-2">
            Tags (opcional)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent"
              placeholder="Agregar tag..."
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-brand-accent hover:bg-brand-primary text-white rounded-lg font-medium transition-colors"
            >
              Agregar
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-brand-accent hover:text-brand-primary ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {errors.tags && (
            <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
          )}
          
          <p className="text-gray-500 text-sm">
            {formData.tags.length}/10 tags máximo
          </p>
        </div>

        {/* Contenido */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-brand-text mb-2">
            Contenido del Thread *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={8}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent resize-none ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe tu pregunta, comparte tu experiencia o inicia una discusión..."
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {formData.content.length} caracteres (mínimo 20)
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-accent hover:bg-brand-primary text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creando...' : 'Crear Thread'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Consejos */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Consejos para crear un buen thread:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Sé específico en el título y descripción</li>
          <li>• Usa tags relevantes para facilitar la búsqueda</li>
          <li>• Proporciona contexto suficiente para que otros puedan ayudarte</li>
          <li>• Respeta las reglas de la comunidad</li>
        </ul>
      </div>
    </div>
  );
}
