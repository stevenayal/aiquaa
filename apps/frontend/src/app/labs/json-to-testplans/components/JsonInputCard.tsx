'use client';

import React, { useRef } from 'react';

interface JsonInputCardProps {
  value: string;
  onChange: (value: string) => void;
  onLoadDemo: () => void;
  error?: string | null;
}

export default function JsonInputCard({
  value,
  onChange,
  onLoadDemo,
  error,
}: JsonInputCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onChange(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Entrada JSON
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Subir archivo .json
          </button>
          <button
            onClick={onLoadDemo}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Cargar demo (KAN-6)
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-64 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
        placeholder='Pegue aquí el JSON de análisis de pruebas o use "Cargar demo"'
        spellCheck={false}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-800 dark:text-red-300 font-medium text-sm">
            Error de validación
          </p>
          <pre className="text-red-600 dark:text-red-400 text-xs mt-2 whitespace-pre-wrap">
            {error}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-2">Formato esperado:</p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
{`{
  "id_work_item": "...",
  "datos_jira": { "key": "KAN-1", "summary": "...", ... },
  "casos_prueba": [
    {
      "id_caso_prueba": "TC001",
      "titulo": "...",
      "pasos": ["paso 1", "paso 2"],
      "precondiciones": ["precondicion 1"],
      "datos_prueba": { "usuario": "test@example.com" }
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}
