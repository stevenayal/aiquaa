'use client';

import { useState } from 'react';
import type { AnalysisResult, Issue, Severity } from '@/lib/req-lint/schemas';

type RequirementLinterProps = {
  result: AnalysisResult | null;
  onCopyJson: () => void;
  onDownloadJson: () => void;
};

type SeverityFilter = Severity | 'All';
type TypeFilter = Issue['type'] | 'All';

export default function RequirementLinter({
  result,
  onCopyJson,
  onDownloadJson,
}: RequirementLinterProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [showRewrites, setShowRewrites] = useState(false);

  if (!result) {
    return null;
  }

  const filteredIssues = result.issues.filter((issue) => {
    if (severityFilter !== 'All' && issue.severity !== severityFilter) return false;
    if (typeFilter !== 'All' && issue.type !== typeFilter) return false;
    return true;
  });

  const severityCounts = {
    Critical: result.issues.filter((i) => i.severity === 'Critical').length,
    High: result.issues.filter((i) => i.severity === 'High').length,
    Medium: result.issues.filter((i) => i.severity === 'Medium').length,
    Low: result.issues.filter((i) => i.severity === 'Low').length,
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Resultados del Análisis
        </h2>

        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
        </div>

        {/* Quality Scores */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(result.quality_score).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(value)}`}>
                {value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {key === 'overall' ? 'General' : key}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    value >= 80
                      ? 'bg-green-500'
                      : value >= 60
                      ? 'bg-yellow-500'
                      : value >= 40
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCopyJson}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📋 Copiar JSON
          </button>
          <button
            onClick={onDownloadJson}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            💾 Descargar JSON
          </button>
        </div>
      </div>

      {/* Coverage Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Cobertura del Requisito
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className={result.coverage.inputs_defined ? 'text-green-500' : 'text-red-500'}>
              {result.coverage.inputs_defined ? '✓' : '✗'}
            </span>
            <span className="text-gray-700 dark:text-gray-300">Entradas definidas</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={result.coverage.outputs_defined ? 'text-green-500' : 'text-red-500'}>
              {result.coverage.outputs_defined ? '✓' : '✗'}
            </span>
            <span className="text-gray-700 dark:text-gray-300">Salidas definidas</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={
                result.coverage.error_handling_defined ? 'text-green-500' : 'text-red-500'
              }
            >
              {result.coverage.error_handling_defined ? '✓' : '✗'}
            </span>
            <span className="text-gray-700 dark:text-gray-300">Manejo de errores definido</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={
                result.coverage.roles_responsibilities_defined ? 'text-green-500' : 'text-red-500'
              }
            >
              {result.coverage.roles_responsibilities_defined ? '✓' : '✗'}
            </span>
            <span className="text-gray-700 dark:text-gray-300">Roles y responsabilidades</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={
                result.coverage.data_contracts_defined ? 'text-green-500' : 'text-red-500'
              }
            >
              {result.coverage.data_contracts_defined ? '✓' : '✗'}
            </span>
            <span className="text-gray-700 dark:text-gray-300">Contratos de datos</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={result.coverage.business_rules.length > 0 ? 'text-green-500' : 'text-gray-400'}
            >
              {result.coverage.business_rules.length > 0 ? '✓' : '○'}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              Reglas de negocio ({result.coverage.business_rules.length})
            </span>
          </div>
        </div>

        {result.coverage.nfr_defined.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Requisitos No Funcionales Detectados:
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.coverage.nfr_defined.map((nfr) => (
                <span
                  key={nfr}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                >
                  {nfr}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Issues Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Problemas Detectados ({filteredIssues.length})
          </h3>

          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showRewrites}
                onChange={(e) => setShowRewrites(e.target.checked)}
                className="rounded"
              />
              Mostrar reescrituras
            </label>
          </div>
        </div>

        {/* Severity Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSeverityFilter('All')}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              severityFilter === 'All'
                ? 'bg-gray-700 text-white border-gray-700'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
            }`}
          >
            Todos ({result.issues.length})
          </button>
          {(['Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                severityFilter === sev
                  ? getSeverityColor(sev)
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
              }`}
            >
              {sev} ({severityCounts[sev]})
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 dark:text-gray-300 mr-2">Tipo:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="All">Todos</option>
            <option value="Ambiguity">Ambigüedad</option>
            <option value="Omission">Omisión</option>
            <option value="Inconsistency">Inconsistencia</option>
            <option value="NFRGap">Gap NFR</option>
            <option value="DataSpecGap">Gap Spec Datos</option>
            <option value="ResponsibilityGap">Gap Responsabilidad</option>
            <option value="RuleConflict">Conflicto de Reglas</option>
          </select>
        </div>

        {/* Issues Table */}
        {filteredIssues.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay problemas que coincidan con los filtros seleccionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ID
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tipo
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Heurística
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Severidad
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    RPN
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Extracto
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Explicación
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Sugerencia
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">
                      {issue.id}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">
                      {issue.type}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">
                      {issue.heuristic}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                          issue.severity
                        )}`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {issue.rpn}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                      {issue.excerpt && (
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {issue.excerpt}
                        </code>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                      {issue.explanation}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                      <div>{issue.fix_suggestion}</div>
                      {showRewrites && issue.proposed_rewrite && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
                          <strong>Reescritura:</strong>
                          <div className="mt-1 font-mono">{issue.proposed_rewrite}</div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acceptance Criteria Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Criterios de Aceptación Generados
        </h3>

        <div className="space-y-3">
          {result.acceptance_criteria.map((ac) => (
            <div
              key={ac.id}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {ac.id}
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">{ac.criterion}</p>
                  {ac.test_oracle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <strong>Oracle:</strong> {ac.test_oracle}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded text-xs">
                      {ac.format}
                    </span>
                    {ac.measurable && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded text-xs">
                        Medible
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
