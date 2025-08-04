import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from './Breadcrumb';

interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

const Checklist = () => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  // Lista de ítems comunes para testing
  const defaultItems: ChecklistItem[] = [
    // Funcionalidad
    { id: '1', text: 'Verificar que todos los campos requeridos estén marcados', category: 'Funcionalidad', completed: false },
    { id: '2', text: 'Validar mensajes de error para campos inválidos', category: 'Funcionalidad', completed: false },
    { id: '3', text: 'Comprobar que los botones de acción funcionen correctamente', category: 'Funcionalidad', completed: false },
    { id: '4', text: 'Verificar la navegación entre páginas', category: 'Funcionalidad', completed: false },
    { id: '5', text: 'Validar formularios de registro y login', category: 'Funcionalidad', completed: false },
    
    // UI/UX
    { id: '6', text: 'Verificar que la interfaz sea responsive en móviles', category: 'UI/UX', completed: false },
    { id: '7', text: 'Comprobar que los elementos estén alineados correctamente', category: 'UI/UX', completed: false },
    { id: '8', text: 'Validar que los colores y fuentes sean consistentes', category: 'UI/UX', completed: false },
    { id: '9', text: 'Verificar que las imágenes se carguen correctamente', category: 'UI/UX', completed: false },
    { id: '10', text: 'Comprobar que los tooltips y ayudas funcionen', category: 'UI/UX', completed: false },
    
    // Rendimiento
    { id: '11', text: 'Verificar tiempos de carga de páginas', category: 'Rendimiento', completed: false },
    { id: '12', text: 'Comprobar que no haya errores en la consola', category: 'Rendimiento', completed: false },
    { id: '13', text: 'Validar que las consultas a la base de datos sean eficientes', category: 'Rendimiento', completed: false },
    
    // Seguridad
    { id: '14', text: 'Verificar que las contraseñas se encripten', category: 'Seguridad', completed: false },
    { id: '15', text: 'Comprobar que las sesiones se manejen correctamente', category: 'Seguridad', completed: false },
    { id: '16', text: 'Validar que no haya vulnerabilidades XSS', category: 'Seguridad', completed: false },
    
    // Compatibilidad
    { id: '17', text: 'Probar en diferentes navegadores (Chrome, Firefox, Safari)', category: 'Compatibilidad', completed: false },
    { id: '18', text: 'Verificar funcionamiento en diferentes dispositivos', category: 'Compatibilidad', completed: false },
    { id: '19', text: 'Comprobar que funcione con JavaScript deshabilitado', category: 'Compatibilidad', completed: false },
    
    // Datos
    { id: '20', text: 'Verificar que los datos se guarden correctamente', category: 'Datos', completed: false },
    { id: '21', text: 'Comprobar que las validaciones de datos funcionen', category: 'Datos', completed: false },
    { id: '22', text: 'Validar que los reportes muestren información correcta', category: 'Datos', completed: false }
  ];

  useEffect(() => {
    // Cargar checklist desde localStorage o usar valores por defecto
    const savedChecklist = localStorage.getItem('testing-checklist');
    if (savedChecklist) {
      try {
        setChecklistItems(JSON.parse(savedChecklist));
      } catch (error) {
        setChecklistItems(defaultItems);
      }
    } else {
      setChecklistItems(defaultItems);
    }
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('testing-checklist', JSON.stringify(checklistItems));
  }, [checklistItems]);

  const toggleItem = (id: string) => {
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const resetChecklist = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear toda la checklist?')) {
      setChecklistItems(defaultItems);
    }
  };

  const getProgress = () => {
    const completed = checklistItems.filter(item => item.completed).length;
    const total = checklistItems.length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  };

  const getCompletedItems = () => {
    return checklistItems.filter(item => item.completed);
  };

  const getIncompleteItems = () => {
    return checklistItems.filter(item => !item.completed);
  };

  const handleCopyCompleted = async () => {
    const completedItems = getCompletedItems();
    if (completedItems.length === 0) {
      alert('No hay ítems completados para copiar');
      return;
    }

    const textToCopy = completedItems.map(item => `✅ ${item.text}`).join('\n');
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleExportJSON = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      progress: getProgress(),
      completedItems: getCompletedItems(),
      incompleteItems: getIncompleteItems(),
      allItems: checklistItems
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checklist_testing_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const progress = getProgress();
  const categories = [...new Set(checklistItems.map(item => item.category))];

  return (
    <>
      <Helmet>
        <title>Checklist de Pruebas - Labs | AIQUAA</title>
        <meta name="description" content="Checklist interactiva para procesos de testing. Marca ítems completados y exporta resultados." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Breadcrumb />
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ✅ Checklist de Pruebas
                </h1>
                <p className="text-gray-600">
                  Checklist interactiva para procesos de testing
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={resetChecklist}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Resetear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Progreso General
              </h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {progress.percentage}%
                </div>
                <div className="text-sm text-gray-500">
                  {progress.completed} de {progress.total} completados
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>

            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleCopyCompleted}
                disabled={progress.completed === 0}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copySuccess ? '¡Copiado!' : '📋 Copiar Completados'}
              </button>
              
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                💾 Exportar JSON
              </button>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Mostrar completados</span>
              </label>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            {categories.map(category => {
              const categoryItems = checklistItems.filter(item => 
                item.category === category && (showCompleted || !item.completed)
              );
              
              if (categoryItems.length === 0) return null;

              const categoryProgress = {
                completed: categoryItems.filter(item => item.completed).length,
                total: categoryItems.length,
                percentage: Math.round((categoryItems.filter(item => item.completed).length / categoryItems.length) * 100)
              };

              return (
                <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-600">
                        {categoryProgress.completed}/{categoryProgress.total}
                      </div>
                      <div className="text-xs text-gray-500">
                        {categoryProgress.percentage}% completado
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${categoryProgress.percentage}%` }}
                    ></div>
                  </div>

                  <div className="space-y-3">
                    {categoryItems.map(item => (
                      <label
                        key={item.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                          item.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className={`flex-1 text-sm ${
                          item.completed ? 'text-green-800 line-through' : 'text-gray-700'
                        }`}>
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">💡 Consejos para Testing:</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <div>• Marca los ítems conforme los vayas completando</div>
              <div>• Usa "Copiar Completados" para reportar avances</div>
              <div>• Exporta en JSON para guardar el estado actual</div>
              <div>• La checklist se guarda automáticamente en tu navegador</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checklist; 