'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert } from '@/components/common';
import { useToolUsage } from '@/hooks/useToolUsage';

interface Risk {
  id: string;
  risk: string;
  cat: string;
  src: string;
  P: number;
  I: number;
  R: number;
  color: string;
  owner: string;
  mit: string;
  cont: string;
  det: string;
  due: string;
  sta: string;
}

export default function RiskMatrixPage() {
  const { isDarkMode } = useTheme();
  const { logUsage } = useToolUsage('risk-matrix');
  const [risks, setRisks] = useState<Risk[]>([]);
  const [riskInput, setRiskInput] = useState('');
  const [category, setCategory] = useState('Téc');
  const [source, setSource] = useState('');
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);
  const [owner, setOwner] = useState('');
  const [mitigation, setMitigation] = useState('');
  const [contingency, setContingency] = useState('');
  const [detection, setDetection] = useState('');
  const [dueDate, setDueDate] = useState('2025-11-30');
  const [status, setStatus] = useState('Open');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const categories = ['Seg', 'Disp', 'Cumpl', 'Fin', 'Op', 'Proy', 'Téc'];
  const statuses = ['Open', 'InProg', 'Mitig', 'Closed'];

  const probabilityLabels = ['', 'Rara', 'Poco', 'Media', 'Alta', 'Muy Alta'];
  const impactLabels = ['', 'Menor', 'Moder.', 'Serio', 'Crítico', 'Severo'];

  const calculateRisk = (p: number, i: number): { value: number; color: string } => {
    const value = p * i;
    let color = 'Verde';
    if (value >= 16) color = 'Rojo';
    else if (value >= 11) color = 'Naranja';
    else if (value >= 6) color = 'Amarillo';
    return { value, color };
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      'Verde': isDarkMode ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800',
      'Amarillo': isDarkMode ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'Naranja': isDarkMode ? 'bg-orange-900/30 border-orange-700 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-800',
      'Rojo': isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[color] || colors['Verde'];
  };

  const addRisk = () => {
    if (!riskInput.trim() || !source.trim()) {
      setAlertMessage('Completa al menos la descripción del riesgo y la fuente');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const { value, color } = calculateRisk(probability, impact);
    const newRisk: Risk = {
      id: `R-${String(risks.length + 1).padStart(3, '0')}`,
      risk: riskInput,
      cat: category,
      src: source,
      P: probability,
      I: impact,
      R: value,
      color,
      owner,
      mit: mitigation,
      cont: contingency,
      det: detection,
      due: dueDate,
      sta: status
    };

    const updatedRisks = [...risks, newRisk].sort((a, b) => {
      if (b.R !== a.R) return b.R - a.R;
      return b.P - a.P;
    });

    setRisks(updatedRisks);
    void logUsage('add-risk');

    // Reset form
    setRiskInput('');
    setSource('');
    setMitigation('');
    setContingency('');
    setDetection('');
    setOwner('');

    setAlertMessage('Riesgo agregado correctamente');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const deleteRisk = (id: string) => {
    setRisks(risks.filter(r => r.id !== id));
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(risks, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'risk-matrix.json');
  };

  const exportCSV = () => {
    const headers = 'id,risk,cat,src,P,I,R,color,owner,mit,cont,det,due,sta\n';
    const rows = risks.map(r =>
      `"${r.id}","${r.risk}","${r.cat}","${r.src}",${r.P},${r.I},${r.R},"${r.color}","${r.owner}","${r.mit}","${r.cont}","${r.det}","${r.due}","${r.sta}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    downloadBlob(blob, 'risk-matrix.csv');
  };

  const exportMarkdown = () => {
    let md = '# Matriz de Riesgos\n\n';
    md += '| ID | Riesgo | Cat | P | I | R | Color | Owner | Mitigación | Due | Estado |\n';
    md += '|---|---|---|---|---|---|---|---|---|---|---|\n';
    risks.forEach(r => {
      md += `| ${r.id} | ${r.risk} | ${r.cat} | ${r.P} | ${r.I} | ${r.R} | ${r.color} | ${r.owner} | ${r.mit} | ${r.due} | ${r.sta} |\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    downloadBlob(blob, 'risk-matrix.md');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setAlertMessage(`Matriz exportada como ${filename}`);
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const clearAll = () => {
    setRisks([]);
    setAlertMessage('Matriz limpiada');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link href="/labs" className={`transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-brand-muted hover:text-brand-text'
            }`}>
              ← Volver a Labs
            </Link>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            🎯 Matriz de Riesgos
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Crea y gestiona matrices de riesgos para proyectos QA/IT. Calcula automáticamente niveles de riesgo y exporta en múltiples formatos.
          </p>
        </div>

        {/* Alerts */}
        {showAlert && (
          <div className="mb-6">
            <Alert
              type={alertType}
              message={alertMessage}
              onClose={() => setShowAlert(false)}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-lg p-6 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Agregar Riesgo</h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    Descripción del Riesgo *
                  </label>
                  <textarea
                    value={riskInput}
                    onChange={(e) => setRiskInput(e.target.value)}
                    placeholder="Ej: Caída de Postgres Railway afecta login"
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-brand-accent`}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-brand-text'
                    }`}>Categoría</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-brand-accent`}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-brand-text'
                    }`}>Estado</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-brand-accent`}
                    >
                      {statuses.map(sta => (
                        <option key={sta} value={sta}>{sta}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    Fuente/Causa *
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Ej: Instancia única sin HA"
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-brand-accent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    Probabilidad (P): {probability} - {probabilityLabels[probability]}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    Impacto (I): {impact} - {impactLabels[impact]}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className={`p-3 rounded-lg border ${getColorClass(calculateRisk(probability, impact).color)}`}>
                  <div className="text-center font-bold">
                    Riesgo (R) = {calculateRisk(probability, impact).value}
                  </div>
                  <div className="text-center text-sm">
                    {calculateRisk(probability, impact).color}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>Responsable</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Ej: Infra, QA, DevOps"
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-brand-accent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>Mitigación</label>
                  <textarea
                    value={mitigation}
                    onChange={(e) => setMitigation(e.target.value)}
                    placeholder="Acción preventiva"
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-brand-accent`}
                    rows={2}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>Contingencia</label>
                  <textarea
                    value={contingency}
                    onChange={(e) => setContingency(e.target.value)}
                    placeholder="Plan B si ocurre"
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-brand-accent`}
                    rows={2}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>Detección/Métrica</label>
                  <input
                    type="text"
                    value={detection}
                    onChange={(e) => setDetection(e.target.value)}
                    placeholder="Ej: uptime>99.5%, error_rate"
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-brand-accent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>Fecha Límite</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-brand-accent`}
                  />
                </div>

                <button
                  onClick={addRisk}
                  className="w-full bg-brand-accent hover:bg-brand-primary text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  ➕ Agregar Riesgo
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Display */}
          <div className="lg:col-span-2">
            <div className={`rounded-lg shadow-lg p-6 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}>
                  Matriz de Riesgos ({risks.length})
                </h2>

                {risks.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={exportJSON}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📥 JSON
                    </button>
                    <button
                      onClick={exportCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📊 CSV
                    </button>
                    <button
                      onClick={exportMarkdown}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📝 MD
                    </button>
                    <button
                      onClick={clearAll}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      🗑️ Limpiar
                    </button>
                  </div>
                )}
              </div>

              {risks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    No hay riesgos agregados
                  </h3>
                  <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                    Usa el formulario de la izquierda para agregar riesgos a la matriz
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {risks.map((risk) => (
                    <div
                      key={risk.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${getColorClass(risk.color)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{risk.id}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isDarkMode ? 'bg-slate-700' : 'bg-white'
                            }`}>
                              {risk.cat}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isDarkMode ? 'bg-slate-700' : 'bg-white'
                            }`}>
                              {risk.sta}
                            </span>
                          </div>
                          <p className="font-semibold text-base mb-2">{risk.risk}</p>
                          <p className="text-sm opacity-90 mb-2">
                            <strong>Fuente:</strong> {risk.src}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <strong>P:</strong> {risk.P} | <strong>I:</strong> {risk.I} | <strong>R:</strong> {risk.R}
                            </div>
                            <div>
                              <strong>Owner:</strong> {risk.owner || 'N/A'}
                            </div>
                            <div>
                              <strong>Due:</strong> {risk.due}
                            </div>
                          </div>
                          {risk.mit && (
                            <p className="text-sm mt-2">
                              <strong>🛡️ Mitigación:</strong> {risk.mit}
                            </p>
                          )}
                          {risk.cont && (
                            <p className="text-sm mt-1">
                              <strong>🔄 Contingencia:</strong> {risk.cont}
                            </p>
                          )}
                          {risk.det && (
                            <p className="text-sm mt-1">
                              <strong>📊 Detección:</strong> {risk.det}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteRisk(risk.id)}
                          className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-red-900/50 hover:bg-red-900 text-red-200'
                              : 'bg-red-100 hover:bg-red-200 text-red-800'
                          }`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            ¿Por qué usar nuestra Matriz de Riesgos?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Cálculo Automático</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Calcula automáticamente el nivel de riesgo (R = P × I) y asigna colores según criticidad
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Múltiples Formatos</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Exporta en JSON, CSV o Markdown para compartir con tu equipo
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Gestión Completa</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Incluye mitigación, contingencia, detección y seguimiento de estado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
