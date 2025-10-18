'use client';

import { useState } from 'react';
import { PairwiseInput } from '@aiquaa/allpairs-core';

interface JsonYamlTabProps {
  input: PairwiseInput;
  onChange: (input: PairwiseInput) => void;
}

export default function JsonYamlTab({ input, onChange }: JsonYamlTabProps) {
  const [text, setText] = useState(JSON.stringify(input, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    setError(null);

    try {
      const response = await fetch('/api/labs/allpairs/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Conversion failed');
      }

      onChange(data);
      setText(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message || 'Failed to convert');
    } finally {
      setIsConverting(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Editor JSON / YAML
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleFormat}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            Formatear JSON
          </button>
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isConverting ? 'Convirtiendo...' : 'Analizar y Convertir'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Pega JSON o YAML
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={20}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Pega JSON o YAML aquí..."
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          Formatos Soportados:
        </p>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <div>
            <strong>Formato directo:</strong>
            <pre className="mt-1 bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
{`{
  "labels": ["A", "B"],
  "parameters": [["1", "2"], ["X", "Y"]]
}`}
            </pre>
          </div>
          <div>
            <strong>Formato de objeto:</strong>
            <pre className="mt-1 bg-white dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
{`{
  "Navegador": ["Chrome", "Firefox"],
  "OS": ["Windows", "Mac"]
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
