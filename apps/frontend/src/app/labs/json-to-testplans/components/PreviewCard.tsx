'use client';

import React, { useState } from 'react';
import { ProcessedData } from '../lib/schema';

interface PreviewCardProps {
  data: ProcessedData;
  onExportPlans: () => void;
  onExportSteps: () => void;
  onExportPreconditions: () => void;
  onExportTestData: () => void;
  onCopyToClipboard: (type: 'plans' | 'steps' | 'preconditions' | 'testdata') => void;
  joinSteps: boolean;
  joinPreconditions: boolean;
}

type TabType = 'plans' | 'steps' | 'preconditions' | 'testdata';

export default function PreviewCard({
  data,
  onExportPlans,
  onExportSteps,
  onExportPreconditions,
  onExportTestData,
  onCopyToClipboard,
  joinSteps,
  joinPreconditions,
}: PreviewCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('plans');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const getCurrentData = () => {
    switch (activeTab) {
      case 'plans':
        return data.plans;
      case 'steps':
        return data.steps;
      case 'preconditions':
        return data.preconditions;
      case 'testdata':
        return data.testdata;
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);

  const handleExport = () => {
    switch (activeTab) {
      case 'plans':
        onExportPlans();
        break;
      case 'steps':
        onExportSteps();
        break;
      case 'preconditions':
        onExportPreconditions();
        break;
      case 'testdata':
        onExportTestData();
        break;
    }
  };

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: 'plans', label: 'Planes', count: data.plans.length },
    {
      id: 'steps',
      label: 'Pasos',
      count: data.steps.length,
    },
    {
      id: 'preconditions',
      label: 'Precondiciones',
      count: data.preconditions.length,
    },
    { id: 'testdata', label: 'Datos de prueba', count: data.testdata.length },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Preview de datos
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onCopyToClipboard(activeTab)}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Copiar al portapapeles
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Exportar {activeTab}.csv
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="flex -mb-px">
          {tabs.map((tab) => {
            const isDisabled =
              (tab.id === 'steps' && joinSteps) ||
              (tab.id === 'preconditions' && joinPreconditions);

            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : isDisabled
                      ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </nav>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {paginatedData.length > 0 &&
                Object.keys(paginatedData[0]).map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {Object.values(row).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                  >
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(endIndex, currentData.length)}{' '}
            de {currentData.length} registros
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {currentData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay datos para mostrar en esta sección
        </div>
      )}
    </div>
  );
}
