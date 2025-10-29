'use client';

import { useState } from 'react';
import TestAppLayout from '../components/TestAppLayout';
import { useToast } from '../components/Toast';
import { getCurrentCandidateLog, exportAuditLog } from '../lib/auditLog';
import { getCandidateId } from '../lib/prng';

export default function EvidencePage() {
  const [copied, setCopied] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const candidateId = getCandidateId();
  const auditLog = getCurrentCandidateLog();

  const handleCopy = () => {
    const jsonString = exportAuditLog();
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      showToast('Evidencias copiadas al portapapeles', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const jsonString = exportAuditLog();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidencias-${candidateId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Archivo descargado', 'success');
  };

  return (
    <TestAppLayout>
      {ToastComponent}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evidencias (Audit Log)</h1>
          <p className="text-sm text-gray-600">
            <strong>Objetivo:</strong> Exportar registro de acciones realizadas durante la evaluación
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">
                <strong>Candidate ID:</strong> {candidateId || 'No disponible'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total de eventos:</strong> {auditLog.length}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
              >
                {copied ? '✓ Copiado' : 'Copiar JSON'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Descargar JSON
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-words">
              {exportAuditLog()}
            </pre>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Cómo usar las evidencias:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Copia o descarga el JSON con todas tus acciones registradas</li>
            <li>
              Incluye este archivo junto con tu reporte de bugs como evidencia de las pruebas
              realizadas
            </li>
            <li>
              El log incluye: logins, búsquedas, filtros, agregar al carrito, checkouts, tickets,
              etc.
            </li>
          </ul>
        </div>
      </div>
    </TestAppLayout>
  );
}
