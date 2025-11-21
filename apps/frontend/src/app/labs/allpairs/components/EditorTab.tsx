'use client';

import { PairwiseInput } from '@aiquaa/allpairs-core';

interface EditorTabProps {
  input: PairwiseInput;
  onChange: (newValue: PairwiseInput) => void;
}

export default function EditorTab({ input, onChange }: EditorTabProps) {
  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...input.labels];
    newLabels[index] = value;
    onChange({ ...input, labels: newLabels });
  };

  const handleAddParameter = () => {
    onChange({
      labels: [...input.labels, `Parámetro ${input.labels.length + 1}`],
      parameters: [...input.parameters, ['Valor 1', 'Valor 2']],
    });
  };

  const handleRemoveParameter = (index: number) => {
    const newLabels = input.labels.filter((_, i) => i !== index);
    const newParameters = input.parameters.filter((_, i) => i !== index);
    onChange({ labels: newLabels, parameters: newParameters });
  };

  const handleValueChange = (paramIndex: number, valueIndex: number, value: string) => {
    const newParameters = [...input.parameters];
    newParameters[paramIndex][valueIndex] = value;
    onChange({ ...input, parameters: newParameters });
  };

  const handleAddValue = (paramIndex: number) => {
    const newParameters = [...input.parameters];
    newParameters[paramIndex].push(`Valor ${newParameters[paramIndex].length + 1}`);
    onChange({ ...input, parameters: newParameters });
  };

  const handleRemoveValue = (paramIndex: number, valueIndex: number) => {
    const newParameters = [...input.parameters];
    newParameters[paramIndex] = newParameters[paramIndex].filter(
      (_, i) => i !== valueIndex
    );
    onChange({ ...input, parameters: newParameters });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Editor de Parámetros
        </h2>
        <button
          onClick={handleAddParameter}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          + Agregar Parámetro
        </button>
      </div>

      {input.labels.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No hay parámetros definidos. Haz clic en &quot;Agregar Parámetro&quot; para comenzar.
          </p>
        </div>
      )}

      {input.labels.map((label, paramIndex) => (
        <div
          key={paramIndex}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Parámetro
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => handleLabelChange(paramIndex, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del parámetro"
              />
            </div>
            <button
              onClick={() => handleRemoveParameter(paramIndex)}
              className="mt-6 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              title="Eliminar parámetro"
            >
              Eliminar
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valores
              </label>
              <button
                onClick={() => handleAddValue(paramIndex)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
              >
                + Agregar Valor
              </button>
            </div>

            {input.parameters[paramIndex].map((value, valueIndex) => (
              <div key={valueIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    handleValueChange(paramIndex, valueIndex, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Valor ${valueIndex + 1}`}
                />
                {input.parameters[paramIndex].length > 1 && (
                  <button
                    onClick={() => handleRemoveValue(paramIndex, valueIndex)}
                    className="px-2 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Eliminar valor"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
