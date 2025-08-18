'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  isChecked: boolean;
  notes: string;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
}

export default function ChecklistPage() {
  const [currentTemplate, setCurrentTemplate] = useState<string>('manual');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showCompleted, setShowCompleted] = useState(true);

  // Templates predefinidos
  const templates: Record<string, ChecklistTemplate> = {
    manual: {
      id: 'manual',
      name: 'QA Manual',
      description: 'Checklist para testing manual de aplicaciones web',
      items: [
        { id: '1', text: 'Verificar que la página se carga correctamente', category: 'Funcionalidad', isChecked: false, notes: '' },
        { id: '2', text: 'Probar navegación entre páginas', category: 'Navegación', isChecked: false, notes: '' },
        { id: '3', text: 'Validar formularios de entrada', category: 'Formularios', isChecked: false, notes: '' },
        { id: '4', text: 'Verificar responsividad en móvil', category: 'Responsive', isChecked: false, notes: '' },
        { id: '5', text: 'Probar en diferentes navegadores', category: 'Compatibilidad', isChecked: false, notes: '' },
        { id: '6', text: 'Verificar mensajes de error', category: 'Validación', isChecked: false, notes: '' },
        { id: '7', text: 'Probar funcionalidad de búsqueda', category: 'Funcionalidad', isChecked: false, notes: '' },
        { id: '8', text: 'Verificar carga de imágenes', category: 'Contenido', isChecked: false, notes: '' }
      ]
    },
    api: {
      id: 'api',
      name: 'API Testing',
      description: 'Checklist para testing de APIs REST',
      items: [
        { id: '1', text: 'Verificar códigos de respuesta HTTP', category: 'Respuestas', isChecked: false, notes: '' },
        { id: '2', text: 'Validar estructura JSON de respuesta', category: 'Datos', isChecked: false, notes: '' },
        { id: '3', text: 'Probar autenticación y autorización', category: 'Seguridad', isChecked: false, notes: '' },
        { id: '4', text: 'Verificar validación de parámetros', category: 'Entrada', isChecked: false, notes: '' },
        { id: '5', text: 'Probar manejo de errores', category: 'Errores', isChecked: false, notes: '' },
        { id: '6', text: 'Verificar rate limiting', category: 'Seguridad', isChecked: false, notes: '' },
        { id: '7', text: 'Probar diferentes métodos HTTP', category: 'Métodos', isChecked: false, notes: '' },
        { id: '8', text: 'Verificar headers de respuesta', category: 'Headers', isChecked: false, notes: '' }
      ]
    },
    mobile: {
      id: 'mobile',
      name: 'Mobile Testing',
      description: 'Checklist para testing en dispositivos móviles',
      items: [
        { id: '1', text: 'Probar en diferentes tamaños de pantalla', category: 'Responsive', isChecked: false, notes: '' },
        { id: '2', text: 'Verificar gestos táctiles', category: 'Interacción', isChecked: false, notes: '' },
        { id: '3', text: 'Probar orientación del dispositivo', category: 'Orientación', isChecked: false, notes: '' },
        { id: '4', text: 'Verificar notificaciones push', category: 'Notificaciones', isChecked: false, notes: '' },
        { id: '5', text: 'Probar funcionalidad offline', category: 'Conectividad', isChecked: false, notes: '' },
        { id: '6', text: 'Verificar rendimiento en móvil', category: 'Performance', isChecked: false, notes: '' },
        { id: '7', text: 'Probar integración con cámara', category: 'Hardware', isChecked: false, notes: '' },
        { id: '8', text: 'Verificar accesibilidad móvil', category: 'Accesibilidad', isChecked: false, notes: '' }
      ]
    },
    security: {
      id: 'security',
      name: 'Security Testing',
      description: 'Checklist para testing de seguridad',
      items: [
        { id: '1', text: 'Probar inyección SQL', category: 'Inyección', isChecked: false, notes: '' },
        { id: '2', text: 'Verificar XSS (Cross-Site Scripting)', category: 'XSS', isChecked: false, notes: '' },
        { id: '3', text: 'Probar CSRF (Cross-Site Request Forgery)', category: 'CSRF', isChecked: false, notes: '' },
        { id: '4', text: 'Verificar autenticación robusta', category: 'Autenticación', isChecked: false, notes: '' },
        { id: '5', text: 'Probar autorización de roles', category: 'Autorización', isChecked: false, notes: '' },
        { id: '6', text: 'Verificar encriptación de datos', category: 'Encriptación', isChecked: false, notes: '' },
        { id: '7', text: 'Probar validación de entrada', category: 'Validación', isChecked: false, notes: '' },
        { id: '8', text: 'Verificar logs de auditoría', category: 'Auditoría', isChecked: false, notes: '' }
      ]
    }
  };

  const loadTemplate = (templateId: string) => {
    setCurrentTemplate(templateId);
    setChecklistItems([...templates[templateId].items]);
    setNotes({});
  };

  const toggleItem = (itemId: string) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const updateNotes = (itemId: string, note: string) => {
    setNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const getProgress = () => {
    if (checklistItems.length === 0) return 0;
    const completed = checklistItems.filter(item => item.isChecked).length;
    return Math.round((completed / checklistItems.length) * 100);
  };

  const exportChecklist = () => {
    const data = {
      template: templates[currentTemplate].name,
      date: new Date().toISOString(),
      progress: getProgress(),
      items: checklistItems.map(item => ({
        ...item,
        notes: notes[item.id] || ''
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist_${currentTemplate}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetChecklist = () => {
    setChecklistItems([...templates[currentTemplate].items]);
    setNotes({});
  };

  const filteredItems = showCompleted 
    ? checklistItems 
    : checklistItems.filter(item => !item.isChecked);

  return (
    <div className="min-h-screen bg-brand-light py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link href="/labs" className="text-brand-muted hover:text-brand-text transition-colors">
              ← Volver a Labs
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            ✅ Checklist de Pruebas
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Organiza y gestiona tus pruebas con checklists profesionales. Perfecto para QA manual y automatizado.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-brand-text mb-4">Templates</h2>
              
              <div className="space-y-3">
                {Object.values(templates).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      currentTemplate === template.id
                        ? 'border-brand-accent bg-brand-accent/10'
                        : 'border-gray-200 hover:border-brand-accent/50'
                    }`}
                  >
                    <h3 className="font-semibold text-brand-text mb-1">{template.name}</h3>
                    <p className="text-sm text-brand-muted">{template.description}</p>
                  </button>
                ))}
              </div>

              {/* Progress */}
              {checklistItems.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-brand-text">Progreso</span>
                    <span className="text-sm text-brand-muted">{getProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgress()}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-brand-muted mt-1">
                    {checklistItems.filter(item => item.isChecked).length} de {checklistItems.length} completados
                  </div>
                </div>
              )}

              {/* Actions */}
              {checklistItems.length > 0 && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={exportChecklist}
                    className="w-full bg-brand-accent hover:bg-brand-primary text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    📥 Exportar Checklist
                  </button>
                  <button
                    onClick={resetChecklist}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    🔄 Reiniciar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Checklist Items */}
          <div className="lg:col-span-2">
            {checklistItems.length > 0 ? (
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-brand-text">
                    {templates[currentTemplate].name}
                  </h2>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-brand-muted">Mostrar completados</span>
                  </label>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={item.isChecked}
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 w-5 h-5 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.category === 'Funcionalidad' ? 'bg-blue-100 text-blue-800' :
                              item.category === 'Navegación' ? 'bg-green-100 text-green-800' :
                              item.category === 'Formularios' ? 'bg-purple-100 text-purple-800' :
                              item.category === 'Responsive' ? 'bg-orange-100 text-orange-800' :
                              item.category === 'Compatibilidad' ? 'bg-indigo-100 text-indigo-800' :
                              item.category === 'Validación' ? 'bg-red-100 text-red-800' :
                              item.category === 'Contenido' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.category}
                            </span>
                            {item.isChecked && (
                              <span className="text-green-600 text-sm">✅ Completado</span>
                            )}
                          </div>
                          <p className={`text-brand-text ${item.isChecked ? 'line-through text-gray-500' : ''}`}>
                            {item.text}
                          </p>
                          
                          {/* Notes */}
                          <div className="mt-3">
                            <textarea
                              placeholder="Agregar notas..."
                              value={notes[item.id] || ''}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-brand-text mb-2">
                  Selecciona un template para comenzar
                </h3>
                <p className="text-brand-muted">
                  Elige uno de los templates disponibles en el panel izquierdo para crear tu checklist de pruebas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">
            ¿Por qué usar nuestros Checklists?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Templates Profesionales</h3>
              <p className="text-brand-muted">
                Checklists predefinidos para diferentes tipos de testing
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Notas Personalizadas</h3>
              <p className="text-brand-muted">
                Agrega observaciones y notas a cada item del checklist
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Seguimiento de Progreso</h3>
              <p className="text-brand-muted">
                Visualiza el avance de tus pruebas en tiempo real
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
