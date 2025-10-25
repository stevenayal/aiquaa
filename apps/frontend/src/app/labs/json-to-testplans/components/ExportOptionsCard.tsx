'use client';

import React from 'react';
import { ExportOptions } from '../lib/schema';

interface ExportOptionsCardProps {
  options: ExportOptions;
  onChange: (options: ExportOptions) => void;
}

export default function ExportOptionsCard({
  options,
  onChange,
}: ExportOptionsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Opciones de Exportación
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delimiter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Delimitador
          </label>
          <select
            value={options.delimiter}
            onChange={(e) =>
              onChange({ ...options, delimiter: e.target.value as ',' | ';' })
            }
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          >
            <option value=",">Coma (,)</option>
            <option value=";">Punto y coma (;)</option>
          </select>
        </div>

        {/* Header Case */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Formato de encabezados
          </label>
          <select
            value={options.headerCase}
            onChange={(e) =>
              onChange({
                ...options,
                headerCase: e.target.value as
                  | 'snake_case'
                  | 'camelCase'
                  | 'Title Case',
              })
            }
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          >
            <option value="snake_case">snake_case</option>
            <option value="camelCase">camelCase</option>
            <option value="Title Case">Title Case</option>
          </select>
        </div>

        {/* Multiline Join */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salto de línea en campos multilínea
          </label>
          <select
            value={options.multilineJoin}
            onChange={(e) =>
              onChange({
                ...options,
                multilineJoin: e.target.value as '\\n' | '||',
              })
            }
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          >
            <option value="\\n">\n (salto de línea)</option>
            <option value="||">|| (pipe doble)</option>
          </select>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="mt-6 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeOptionalColumns}
            onChange={(e) =>
              onChange({ ...options, includeOptionalColumns: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-900 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Incluir columnas opcionales (Jira status, assignee, timestamps)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.joinSteps}
            onChange={(e) =>
              onChange({ ...options, joinSteps: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-900 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Unir pasos en el CSV de planes (no exportar steps.csv separado)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.joinPreconditions}
            onChange={(e) =>
              onChange({ ...options, joinPreconditions: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-900 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Unir precondiciones en el CSV de planes (no exportar
            preconditions.csv separado)
          </span>
        </label>
      </div>
    </div>
  );
}
