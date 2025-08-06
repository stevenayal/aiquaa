import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from './Breadcrumb';

interface SqlObject {
  name: string;
  type: string;
  dependencies: string[];
  description: string;
}

interface CompilationStep {
  step: number;
  action: string;
  command: string;
  description: string;
  status: 'pending' | 'success' | 'error';
}

const SqlObjectGenerator: React.FC = () => {
  const [sqlObjects, setSqlObjects] = useState<SqlObject[]>([]);
  const [newObject, setNewObject] = useState<SqlObject>({
    name: '',
    type: '',
    dependencies: [],
    description: ''
  });
  const [compilationSteps, setCompilationSteps] = useState<CompilationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const objectTypes = [
    { value: 'TABLE', label: 'Tabla' },
    { value: 'VIEW', label: 'Vista' },
    { value: 'PROCEDURE', label: 'Procedimiento Almacenado' },
    { value: 'FUNCTION', label: 'Función' },
    { value: 'TRIGGER', label: 'Trigger' },
    { value: 'INDEX', label: 'Índice' },
    { value: 'SEQUENCE', label: 'Secuencia' },
    { value: 'PACKAGE', label: 'Paquete' }
  ];

  const exampleObjects: SqlObject[] = [
    {
      name: 'users',
      type: 'TABLE',
      dependencies: [],
      description: 'Tabla de usuarios del sistema'
    },
    {
      name: 'user_profiles',
      type: 'TABLE',
      dependencies: ['users'],
      description: 'Perfiles extendidos de usuarios'
    },
    {
      name: 'get_user_data',
      type: 'PROCEDURE',
      dependencies: ['users', 'user_profiles'],
      description: 'Procedimiento para obtener datos completos de usuario'
    },
    {
      name: 'user_audit_trigger',
      type: 'TRIGGER',
      dependencies: ['users'],
      description: 'Trigger para auditoría de cambios en usuarios'
    }
  ];

  const addObject = () => {
    if (newObject.name && newObject.type) {
      setSqlObjects([...sqlObjects, { ...newObject }]);
      setNewObject({
        name: '',
        type: '',
        dependencies: [],
        description: ''
      });
    }
  };

  const removeObject = (index: number) => {
    setSqlObjects(sqlObjects.filter((_, i) => i !== index));
  };

  const loadExample = () => {
    setSqlObjects(exampleObjects);
    setCompilationSteps([]);
  };

  const clearAll = () => {
    setSqlObjects([]);
    setCompilationSteps([]);
  };

  const generateCompilationSteps = () => {
    if (sqlObjects.length === 0) return;

    setIsGenerating(true);
    
    // Simulate processing time
    setTimeout(() => {
      const steps: CompilationStep[] = [];
      let stepNumber = 1;

      // Sort objects by dependencies (topological sort)
      const sortedObjects = sortByDependencies(sqlObjects);

      // Generate steps for each object
      sortedObjects.forEach((obj) => {
        // Add dependency check step
        if (obj.dependencies.length > 0) {
          steps.push({
            step: stepNumber++,
            action: 'Verificar dependencias',
            command: `-- Verificar que ${obj.dependencies.join(', ')} existan`,
            description: `Verificando dependencias para ${obj.name}`,
            status: 'pending'
          });
        }

        // Add compilation step
        steps.push({
          step: stepNumber++,
          action: `Compilar ${getTypeLabel(obj.type)}`,
          command: generateCompilationCommand(obj),
          description: `Compilando ${obj.type.toLowerCase()} ${obj.name}`,
          status: 'pending'
        });

        // Add verification step
        steps.push({
          step: stepNumber++,
          action: 'Verificar compilación',
          command: generateVerificationCommand(obj),
          description: `Verificando que ${obj.name} se compiló correctamente`,
          status: 'pending'
        });
      });

      // Add final validation step
      steps.push({
        step: stepNumber,
        action: 'Validación final',
        command: '-- Ejecutar pruebas de integración',
        description: 'Validando que todos los objetos funcionan correctamente',
        status: 'pending'
      });

      setCompilationSteps(steps);
      setIsGenerating(false);
    }, 1000);
  };

  const sortByDependencies = (objects: SqlObject[]): SqlObject[] => {
    const result: SqlObject[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (obj: SqlObject) => {
      if (visiting.has(obj.name)) {
        throw new Error(`Dependencia circular detectada: ${obj.name}`);
      }
      if (visited.has(obj.name)) return;

      visiting.add(obj.name);

      // Visit dependencies first
      obj.dependencies.forEach(depName => {
        const dep = objects.find(o => o.name === depName);
        if (dep) {
          visit(dep);
        }
      });

      visiting.delete(obj.name);
      visited.add(obj.name);
      result.push(obj);
    };

    objects.forEach(obj => {
      if (!visited.has(obj.name)) {
        visit(obj);
      }
    });

    return result;
  };

  const generateCompilationCommand = (obj: SqlObject): string => {
    switch (obj.type) {
      case 'TABLE':
        return `CREATE TABLE ${obj.name} (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
      case 'VIEW':
        return `CREATE VIEW ${obj.name} AS
SELECT * FROM users WHERE active = 1;`;
      case 'PROCEDURE':
        return `CREATE PROCEDURE ${obj.name}()
BEGIN
  -- Lógica del procedimiento
  SELECT * FROM users;
END;`;
      case 'FUNCTION':
        return `CREATE FUNCTION ${obj.name}()
RETURNS INT
BEGIN
  -- Lógica de la función
  RETURN 1;
END;`;
      case 'TRIGGER':
        return `CREATE TRIGGER ${obj.name}
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  -- Lógica del trigger
END;`;
      case 'INDEX':
        return `CREATE INDEX ${obj.name} ON users(name);`;
      case 'SEQUENCE':
        return `CREATE SEQUENCE ${obj.name}
START WITH 1
INCREMENT BY 1;`;
      case 'PACKAGE':
        return `CREATE PACKAGE ${obj.name} AS
  -- Especificación del paquete
END ${obj.name};`;
      default:
        return `-- Comando de compilación para ${obj.type}`;
    }
  };

  const generateVerificationCommand = (obj: SqlObject): string => {
    switch (obj.type) {
      case 'TABLE':
        return `DESCRIBE ${obj.name};`;
      case 'VIEW':
        return `SELECT COUNT(*) FROM ${obj.name};`;
      case 'PROCEDURE':
        return `SHOW CREATE PROCEDURE ${obj.name};`;
      case 'FUNCTION':
        return `SHOW CREATE FUNCTION ${obj.name};`;
      case 'TRIGGER':
        return `SHOW TRIGGERS WHERE \`Table\` = 'users';`;
      case 'INDEX':
        return `SHOW INDEX FROM users WHERE Key_name = '${obj.name}';`;
      case 'SEQUENCE':
        return `SELECT * FROM ${obj.name};`;
      case 'PACKAGE':
        return `SELECT * FROM user_objects WHERE object_name = '${obj.name}';`;
      default:
        return `-- Comando de verificación para ${obj.type}`;
    }
  };

  const getTypeLabel = (type: string): string => {
    return objectTypes.find(t => t.value === type)?.label || type;
  };

  const copyStepsToClipboard = () => {
    const stepsText = compilationSteps
      .map(step => `${step.step}. ${step.action}\n${step.command}\n-- ${step.description}\n`)
      .join('\n');
    navigator.clipboard.writeText(stepsText);
  };

  return (
    <>
      <Helmet>
        <title>Generador de Pasos de Compilación SQL - Labs | AIQUAA</title>
        <meta name="description" content="Genera pasos de compilación ordenados para objetos SQL. Herramienta para DBA y desarrolladores." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🗄️ Generador de Pasos de Compilación SQL
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Genera pasos de compilación ordenados para objetos SQL considerando dependencias. 
              Perfecto para DBA y desarrolladores de bases de datos.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Add Object Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Agregar Objeto SQL
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Objeto
                    </label>
                    <input
                      type="text"
                      value={newObject.name}
                      onChange={(e) => setNewObject({...newObject, name: e.target.value})}
                      placeholder="Ej: users, get_user_data"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Objeto
                    </label>
                    <select
                      value={newObject.type}
                      onChange={(e) => setNewObject({...newObject, type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="">Seleccionar tipo</option>
                      {objectTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dependencias (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={newObject.dependencies.join(', ')}
                      onChange={(e) => setNewObject({
                        ...newObject, 
                        dependencies: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                      })}
                      placeholder="Ej: users, user_profiles"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={newObject.description}
                      onChange={(e) => setNewObject({...newObject, description: e.target.value})}
                      placeholder="Descripción del objeto..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  <button
                    onClick={addObject}
                    disabled={!newObject.name || !newObject.type}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Agregar Objeto
                  </button>
                </div>
              </div>

              {/* Objects List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Objetos SQL ({sqlObjects.length})
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={loadExample}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Cargar ejemplo
                    </button>
                    <button
                      onClick={clearAll}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {sqlObjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">🗄️</div>
                    <p>No hay objetos agregados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sqlObjects.map((obj, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{obj.name}</h3>
                          <button
                            onClick={() => removeObject(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Tipo:</span> {getTypeLabel(obj.type)}
                        </p>
                        {obj.dependencies.length > 0 && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Dependencias:</span> {obj.dependencies.join(', ')}
                          </p>
                        )}
                        {obj.description && (
                          <p className="text-sm text-gray-600">{obj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {sqlObjects.length > 0 && (
                  <button
                    onClick={generateCompilationSteps}
                    disabled={isGenerating}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando...
                      </span>
                    ) : (
                      'Generar Pasos de Compilación'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pasos de Compilación
                  </h2>
                  {compilationSteps.length > 0 && (
                    <button
                      onClick={copyStepsToClipboard}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Copiar
                    </button>
                  )}
                </div>
                
                {compilationSteps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <p>Genera pasos de compilación para ver los resultados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {compilationSteps.map((step, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Paso {step.step}: {step.action}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            step.status === 'success' ? 'bg-green-100 text-green-800' :
                            step.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {step.status === 'success' ? '✅ Completado' :
                             step.status === 'error' ? '❌ Error' : '⏳ Pendiente'}
                          </span>
                        </div>
                        <pre className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-800 overflow-x-auto">
                          {step.command}
                        </pre>
                        <p className="text-sm text-gray-600 mt-2">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">
                  💡 Consejos para Compilación SQL
                </h3>
                <ul className="space-y-2 text-purple-800 text-sm">
                  <li>• Las dependencias se compilan primero</li>
                  <li>• Verifica cada objeto después de compilarlo</li>
                  <li>• Usa transacciones para rollback en caso de error</li>
                  <li>• Ejecuta en un entorno de desarrollo primero</li>
                  <li>• Documenta cualquier cambio manual requerido</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Características del Generador
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🔗</div>
                <h3 className="font-semibold text-gray-900 mb-2">Orden por Dependencias</h3>
                <p className="text-gray-600 text-sm">
                  Genera el orden correcto considerando dependencias entre objetos
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-900 mb-2">Pasos Detallados</h3>
                <p className="text-gray-600 text-sm">
                  Cada paso incluye comando SQL y descripción clara
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-semibold text-gray-900 mb-2">Verificación</h3>
                <p className="text-gray-600 text-sm">
                  Incluye comandos de verificación para cada objeto
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SqlObjectGenerator; 