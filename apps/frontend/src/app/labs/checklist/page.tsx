'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';
import { useToolUsage } from '@/hooks/useToolUsage';

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
  const { isDarkMode } = useTheme();
  const { logUsage } = useToolUsage('checklist');
  const [currentTemplate, setCurrentTemplate] = useState<string>('manual');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

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

  // Cargar estado guardado del localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('checklistState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.template && parsed.items) {
          setCurrentTemplate(parsed.template);
          setChecklistItems(parsed.items);
          setNotes(parsed.notes || {});
        }
      } catch (error) {
        console.error('Error al cargar estado guardado:', error);
      }
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    if (checklistItems.length > 0) {
      const stateToSave = {
        template: currentTemplate,
        items: checklistItems,
        notes: notes,
        timestamp: Date.now()
      };
      localStorage.setItem('checklistState', JSON.stringify(stateToSave));
    }
  }, [currentTemplate, checklistItems, notes]);

  const loadTemplate = (templateId: string) => {
    setCurrentTemplate(templateId);
    setChecklistItems([...templates[templateId].items]);
    setNotes({});
    
    setAlertMessage(`Template "${templates[templateId].name}" cargado correctamente`);
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
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

  const exportChecklist = (format: 'json' | 'markdown') => {
    void logUsage(`export-${format}`);
    if (checklistItems.length === 0) {
      setAlertMessage('No hay items para exportar');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      return;
    }

    const data = {
      template: templates[currentTemplate].name,
      date: new Date().toISOString(),
      progress: getProgress(),
      items: checklistItems.map(item => ({
        ...item,
        notes: notes[item.id] || ''
      }))
    };

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `checklist_${currentTemplate}_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      // Markdown format
      content = `# Checklist: ${templates[currentTemplate].name}\n\n`;
      content += `**Fecha:** ${new Date().toLocaleDateString('es-ES')}\n`;
      content += `**Progreso:** ${getProgress()}%\n\n`;
      
      // Agrupar por categoría
      const groupedByCategory = checklistItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, ChecklistItem[]>);

      Object.entries(groupedByCategory).forEach(([category, items]) => {
        content += `## ${category}\n\n`;
        items.forEach(item => {
          const status = item.isChecked ? '✅' : '❌';
          content += `- ${status} ${item.text}\n`;
          if (notes[item.id]) {
            content += `  > Notas: ${notes[item.id]}\n`;
          }
          content += '\n';
        });
      });

      filename = `checklist_${currentTemplate}_${new Date().toISOString().split('T')[0]}.md`;
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setAlertMessage(`Checklist exportado en formato ${format.toUpperCase()}`);
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const resetChecklist = () => {
    setChecklistItems([...templates[currentTemplate].items]);
    setNotes({});
    
    setAlertMessage('Checklist reiniciado correctamente');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const clearSavedState = () => {
    localStorage.removeItem('checklistState');
    setChecklistItems([]);
    setNotes({});
    
    setAlertMessage('Estado guardado eliminado correctamente');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const filteredItems = showCompleted 
    ? checklistItems 
    : checklistItems.filter(item => !item.isChecked);

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link href="/labs" className={`transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-brand-muted hover:text-brand-text'
            }`}>
              ← Volver a Labs
            </Link>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            ✅ Checklist de Pruebas
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Organiza y gestiona tus pruebas con checklists profesionales. Perfecto para QA manual y automatizado.
          </p>
        </div>

        {/* Alertas */}
        {showAlert && (
          <div className="mb-6">
            <Alert
              type={alertType}
              message={alertMessage}
              onClose={() => setShowAlert(false)}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-lg p-6 sticky top-4 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Templates</h2>

              <div className="space-y-3">
                {Object.values(templates).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      currentTemplate === template.id
                        ? isDarkMode
                          ? 'border-brand-accent bg-brand-accent/20 text-white'
                          : 'border-brand-accent bg-brand-accent/10'
                        : isDarkMode
                          ? 'border-slate-600 hover:border-brand-accent/50 text-slate-300'
                          : 'border-gray-200 hover:border-brand-accent/50'
                    }`}
                  >
                    <h3 className={`font-semibold mb-1 ${
                      isDarkMode ? 'text-white' : 'text-brand-text'
                    }`}>{template.name}</h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                    }`}>{template.description}</p>
                  </button>
                ))}
              </div>

              {/* Progress */}
              {checklistItems.length > 0 && (
                <div className={`mt-6 p-4 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-brand-text'
                    }`}>Progreso</span>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-brand-muted'
                    }`}>{getProgress()}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${
                    isDarkMode ? 'bg-slate-600' : 'bg-gray-200'
                  }`}>
                    <div
                      className="bg-brand-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgress()}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs mt-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                  }`}>
                    {checklistItems.filter(item => item.isChecked).length} de {checklistItems.length} completados
                  </div>
                </div>
              )}

              {/* Actions */}
              {checklistItems.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => exportChecklist('json')}
                      className="bg-brand-accent hover:bg-brand-primary text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      📥 JSON
                    </button>
                    <button
                      onClick={() => exportChecklist('markdown')}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      📝 MD
                    </button>
                  </div>
                  <button
                    onClick={resetChecklist}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    🔄 Reiniciar
                  </button>
                  <button
                    onClick={clearSavedState}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    🗑️ Limpiar Estado
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
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    {templates[currentTemplate].name}
                  </h2>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="mr-2"
                    />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-brand-muted'
                    }`}>Mostrar completados</span>
                  </label>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className={`rounded-lg shadow-lg p-6 transition-colors ${
                      isDarkMode ? 'bg-slate-800' : 'bg-white'
                    }`}>
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
                          <p className={`${
                            item.isChecked
                              ? isDarkMode ? 'line-through text-slate-500' : 'line-through text-gray-500'
                              : isDarkMode ? 'text-white' : 'text-brand-text'
                          }`}>
                            {item.text}
                          </p>

                          {/* Notes */}
                          <div className="mt-3">
                            <textarea
                              placeholder="Agregar notas..."
                              value={notes[item.id] || ''}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent resize-none transition-colors ${
                                isDarkMode
                                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
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
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}>
                  Selecciona un template para comenzar
                </h3>
                <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                  Elige uno de los templates disponibles en el panel izquierdo para crear tu checklist de pruebas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            ¿Por qué usar nuestros Checklists?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Templates Profesionales</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Checklists predefinidos para diferentes tipos de testing
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Notas Personalizadas</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Agrega observaciones y notas a cada item del checklist
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Seguimiento de Progreso</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Visualiza el avance de tus pruebas en tiempo real
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
