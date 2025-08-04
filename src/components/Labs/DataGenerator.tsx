import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from './Breadcrumb';

interface GeneratedData {
  [key: string]: string | number;
}

const DataGenerator = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [generatedData, setGeneratedData] = useState<GeneratedData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const dataTypes = [
    { id: 'nombre', label: 'Nombre', icon: '👤' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'telefono', label: 'Teléfono', icon: '📱' },
    { id: 'fecha', label: 'Fecha', icon: '📅' },
    { id: 'cedula', label: 'Cédula', icon: '🆔' },
    { id: 'monto', label: 'Monto', icon: '💰' }
  ];

  // Función para generar datos aleatorios
  const generateRandomData = (type: string): string | number => {
    switch (type) {
      case 'nombre':
        const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Sofía', 'Pedro', 'Carmen', 'Miguel', 'Isabella'];
        const apellidos = ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];
        return `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
      
      case 'email':
        const dominios = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
        const usuario = Math.random().toString(36).substring(2, 8);
        const dominio = dominios[Math.floor(Math.random() * dominios.length)];
        return `${usuario}@${dominio}`;
      
      case 'telefono':
        const codigoPais = '+593';
        const numero = Math.floor(Math.random() * 90000000) + 10000000;
        return `${codigoPais} ${numero}`;
      
      case 'fecha':
        const startDate = new Date(1990, 0, 1);
        const endDate = new Date(2020, 11, 31);
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        return randomDate.toLocaleDateString('es-ES');
      
      case 'cedula':
        const cedula = Math.floor(Math.random() * 90000000) + 10000000;
        return cedula.toString();
      
      case 'monto':
        const monto = (Math.random() * 10000).toFixed(2);
        return parseFloat(monto);
      
      default:
        return '';
    }
  };

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleGenerate = () => {
    if (selectedTypes.length === 0) {
      alert('Por favor, selecciona al menos un tipo de dato');
      return;
    }

    setIsGenerating(true);
    
    // Simular delay para mejor UX
    setTimeout(() => {
      const newData: GeneratedData = {};
      selectedTypes.forEach(type => {
        newData[type] = generateRandomData(type);
      });
      
      setGeneratedData(prev => [...prev, newData]);
      setIsGenerating(false);
    }, 500);
  };

  const handleClear = () => {
    setGeneratedData([]);
    setSelectedTypes([]);
  };

  const handleCopyToClipboard = async () => {
    if (generatedData.length === 0) return;

    try {
      const dataToCopy = generatedData.map((data, index) => {
        const entries = Object.entries(data);
        return `Registro ${index + 1}:\n${entries.map(([key, value]) => `  ${key}: ${value}`).join('\n')}`;
      }).join('\n\n');

      await navigator.clipboard.writeText(dataToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleExportJSON = () => {
    if (generatedData.length === 0) return;

    const dataStr = JSON.stringify(generatedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'datos_prueba.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Generador de Datos - Labs | AIQUAA</title>
        <meta name="description" content="Genera datos de prueba aleatorios para testing. Nombres, emails, teléfonos, fechas, cédulas y montos." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Breadcrumb />
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🎲 Generador de Datos
                </h1>
                <p className="text-gray-600">
                  Genera datos de prueba aleatorios para testing
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Limpiar Todo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Configuration Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tipos de Datos
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {dataTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeToggle(type.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedTypes.includes(type.id)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || selectedTypes.length === 0}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isGenerating ? 'Generando...' : 'Generar Datos'}
                  </button>
                </div>

                {selectedTypes.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Tipos seleccionados:</strong> {selectedTypes.length}
                    </p>
                  </div>
                )}
              </div>

              {/* Export Options */}
              {generatedData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Exportar Datos
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleCopyToClipboard}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <span className="mr-2">📋</span>
                      {copySuccess ? '¡Copiado!' : 'Copiar al Portapapeles'}
                    </button>
                    
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <span className="mr-2">💾</span>
                      Exportar como JSON
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Datos Generados
                  </h3>
                  {generatedData.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {generatedData.length} registro{generatedData.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {generatedData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">🎲</div>
                    <p className="text-gray-600">
                      Selecciona tipos de datos y haz clic en "Generar Datos"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedData.map((data, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            Registro {index + 1}
                          </h4>
                          <span className="text-xs text-gray-500">
                            #{index + 1}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">
                                {key}:
                              </span>
                              <span className="font-mono text-gray-900">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Tipos de Datos Disponibles:</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <div><strong>Nombre:</strong> Nombres y apellidos aleatorios</div>
                  <div><strong>Email:</strong> Direcciones de email válidas</div>
                  <div><strong>Teléfono:</strong> Números con código de país</div>
                  <div><strong>Fecha:</strong> Fechas aleatorias entre 1990-2020</div>
                  <div><strong>Cédula:</strong> Números de identificación</div>
                  <div><strong>Monto:</strong> Valores monetarios aleatorios</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataGenerator; 