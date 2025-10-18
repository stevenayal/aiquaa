'use client';

import { useState, useEffect } from 'react';
import { PairwiseInput, PairwiseResult, toCsv } from '@aiquaa/allpairs-core';
import EditorTab from './components/EditorTab';
import JsonYamlTab from './components/JsonYamlTab';
import ExamplesTab from './components/ExamplesTab';
import HelpTab from './components/HelpTab';
import ResultsTable from './components/ResultsTable';

type Tab = 'editor' | 'json-yaml' | 'examples' | 'help';

const STORAGE_KEY = 'allpairs-last-input';

export default function AllPairsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [input, setInput] = useState<PairwiseInput>({
    labels: ['Navegador', 'Sistema Operativo'],
    parameters: [
      ['Chrome', 'Firefox', 'Safari'],
      ['Windows', 'macOS', 'Linux'],
    ],
  });
  const [result, setResult] = useState<PairwiseResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load last input from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setInput(parsed);
      }
    } catch (err) {
      console.error('Failed to load stored input:', err);
    }
  }, []);

  // Save input to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    } catch (err) {
      console.error('Failed to save input:', err);
    }
  }, [input]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/labs/allpairs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate pairwise combinations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (includeCounter: boolean = true) => {
    if (!result) return;

    const csv = toCsv(result, { includeCounter });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pairwise-tests.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (includeCounter: boolean = true) => {
    if (!result) return;

    try {
      const csv = toCsv(result, { includeCounter });
      await navigator.clipboard.writeText(csv);
      alert('¡Copiado al portapapeles!');
    } catch (err) {
      alert('Error al copiar al portapapeles');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Generador All Pairs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Genera combinaciones de pruebas pairwise para reducir casos de prueba manteniendo la cobertura
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {[
                { id: 'editor' as Tab, label: 'Editor' },
                { id: 'json-yaml' as Tab, label: 'JSON/YAML' },
                { id: 'examples' as Tab, label: 'Ejemplos' },
                { id: 'help' as Tab, label: 'Ayuda' },
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

          <div className="p-6">
            {activeTab === 'editor' && (
              <EditorTab input={input} onChange={setInput} />
            )}
            {activeTab === 'json-yaml' && (
              <JsonYamlTab input={input} onChange={setInput} />
            )}
            {activeTab === 'examples' && (
              <ExamplesTab onSelect={setInput} />
            )}
            {activeTab === 'help' && <HelpTab />}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generando...' : 'Generar Combinaciones Pairwise'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-300 font-medium">Error</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <ResultsTable
            result={result}
            onExport={handleExport}
            onCopy={handleCopy}
          />
        )}
      </div>
    </div>
  );
}
