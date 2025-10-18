'use client';

import { useState } from 'react';
import { PairwiseResult } from '@aiquaa/allpairs-core';

interface ResultsTableProps {
  result: PairwiseResult;
  onExport: (includeCounter: boolean) => void;
  onCopy: (includeCounter: boolean) => void;
}

export default function ResultsTable({ result, onExport, onCopy }: ResultsTableProps) {
  const [includeCounter, setIncludeCounter] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const totalPages = Math.ceil(result.rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, result.rows.length);
  const visibleRows = result.rows.slice(startIndex, endIndex);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generated Test Cases
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {result.rows.length} test cases covering all parameter pairs
            </p>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={includeCounter}
                onChange={(e) => setIncludeCounter(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Include counter
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onExport(includeCounter)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={() => onCopy(includeCounter)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {includeCounter && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
              )}
              {result.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {visibleRows.map((row, rowIndex) => (
              <tr
                key={startIndex + rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {includeCounter && (
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {startIndex + rowIndex + 1}
                  </td>
                )}
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-white"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {endIndex} of {result.rows.length} rows
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
