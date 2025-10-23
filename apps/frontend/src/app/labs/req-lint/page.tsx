'use client';

import { useState } from 'react';
import { analyzeRequirement } from '@/lib/req-lint/engine';
import type { RequirementInput, AnalysisResult } from '@/lib/req-lint/schemas';
import RequirementLinter from './components/RequirementLinter';
import HelpTab from './components/HelpTab';

type Tab = 'analyzer' | 'help';

const EXAMPLE_REQUIREMENTS = [
  {
    id: 'DEMO-001',
    title: 'Requisito vago con performance',
    text: 'El sistema deberá responder rápido a las consultas de saldo. Registrar esto y mostrarlo al usuario.',
  },
  {
    id: 'DEMO-002',
    title: 'Requisito bien formado (Gherkin)',
    text: `Dado que el usuario está autenticado en el sistema,
cuando solicita consultar su saldo mediante el endpoint /api/balance con su ID de usuario como parámetro,
entonces el sistema retorna un objeto JSON con el campo 'balance' tipo decimal(12,2) con un tiempo de respuesta p95 menor a 200ms.
En caso de error de autenticación, retorna HTTP 401.
Si el usuario no existe, retorna HTTP 404 con mensaje descriptivo.`,
  },
  {
    id: 'DEMO-003',
    title: 'Requisito con múltiples problemas',
    text: 'El sistema será procesado pronto de forma óptima y fácil. Performance y latencia adecuadas.',
  },
  {
    id: 'HU-666',
    title: '😈 HU satánica (peor caso posible)',
    text: `Título: Como usuario quiero que el sistema funcione bien para estar contento.

Descripción:
El sistema deberá cargar rápido y ser fácil, mostrando lo necesario.
Se realizarán validaciones según corresponda y se guardará todo.
Si no hay internet igual debe funcionar igual.
La contraseña debe ser segura pero fácil de recordar.
Los montos serán alrededor de 50k o más, lo antes posible.
Esto debe integrarse con aquello y con ellos.
El tiempo de respuesta debe ser óptimo (<1s), pero que tampoco tarde más de 5 minutos.
Siempre se pedirá 2FA, salvo para no molestar al usuario.
Se procesará la información y será registrada automáticamente.

Entradas/Salidas:
(No aplica)

Reglas de negocio:
- Se hace como se hace normalmente.

Manejo de errores:
Mostrar un error si falla algo.

NFR:
Rendimiento excelente y seguridad adecuada.

Criterios de aceptación (mal formados):
- Debe ser rápido y fácil.
- A veces guardar automáticamente.
- Que muestre bien.
- Dado el usuario, cuando entra, entonces algo pasa.
- Cuando entonces dado se hace.`,
  },
];

export default function RequirementLintPage() {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [requirementText, setRequirementText] = useState('');
  const [requirementId, setRequirementId] = useState('REQ-001');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!requirementText.trim()) {
      alert('Por favor ingresa un texto de requisito');
      return;
    }

    setIsAnalyzing(true);

    // Simulate a small delay for UX
    setTimeout(() => {
      const input: RequirementInput = {
        requirement_id: requirementId,
        requirement_text: requirementText,
        acceptance_template: 'GWT',
      };

      const analysisResult = analyzeRequirement(input);
      setResult(analysisResult);
      setIsAnalyzing(false);
    }, 100);
  };

  const handleClear = () => {
    setRequirementText('');
    setResult(null);
  };

  const handleLoadExample = (exampleText: string) => {
    setRequirementText(exampleText);
    setResult(null);
  };

  const handleCopyJson = async () => {
    if (!result) return;

    try {
      const json = JSON.stringify(result, null, 2);
      await navigator.clipboard.writeText(json);
      alert('✅ JSON copiado al portapapeles');
    } catch (err) {
      alert('❌ Error al copiar al portapapeles');
    }
  };

  const handleDownloadJson = () => {
    if (!result) return;

    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.requirement_id}-analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Análisis Estático de Requisitos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Evalúa la calidad de tus requisitos según heurísticas ISTQB (claridad, completitud,
            testabilidad). Sin IA, solo reglas determinísticas.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {[
                { id: 'analyzer' as Tab, label: '🔍 Analizador' },
                { id: 'help' as Tab, label: '❓ Ayuda' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Analyzer Tab */}
        {activeTab === 'analyzer' && (
          <>
            {/* Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ID del Requisito
            </label>
            <input
              type="text"
              value={requirementId}
              onChange={(e) => setRequirementId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="REQ-001"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Texto del Requisito
            </label>
            <textarea
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="Ingresa el texto del requisito aquí..."
            />
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {requirementText.length} caracteres
            </div>
          </div>

          {/* Example Buttons */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Ejemplos de requisitos:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_REQUIREMENTS.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleLoadExample(example.text)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  {example.title}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !requirementText.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? 'Analizando...' : '🔍 Analizar Requisito'}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <RequirementLinter
            result={result}
            onCopyJson={handleCopyJson}
            onDownloadJson={handleDownloadJson}
          />
        )}

          {/* Rules Info Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Reglas Implementadas (v1)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Términos Vagos
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detecta palabras imprecisas: rápido, fácil, óptimo, adecuado, aproximadamente,
                varios, etc.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Cuantificadores Difusos
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Identifica expresiones como &quot;alrededor de&quot;, &quot;más o menos&quot;, &quot;cercano a&quot;.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Performance Sin Umbral
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detecta menciones de rendimiento, latencia, throughput sin valores numéricos.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Voz Pasiva</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Identifica construcciones que ocultan el agente responsable de la acción.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Falta de Entradas/Salidas
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifica que se especifiquen inputs y outputs del requisito.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Validación Gherkin
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Valida formato Dado/Cuando/Entonces y otorga bonus de testabilidad.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Roles No Definidos
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifica que se identifique quién (usuario, sistema) realiza las acciones.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Requisito Muy Corto
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detecta requisitos menores a 30 caracteres que carecen de detalle.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Nota:</strong> Este analizador utiliza reglas determinísticas (regex + checks)
              sin IA. El score RPN (Risk Priority Number) se calcula como Severidad × Probabilidad,
              con valores de 1 a 9.
            </p>
          </div>
          </div>
        </>
      )}

      {/* Help Tab */}
      {activeTab === 'help' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <HelpTab />
        </div>
      )}
      </div>
    </div>
  );
}
