'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getExamUserDefaults } from '@/lib/exam-user-defaults';
import { getCurrentUser } from '../lib/storage';
import { getCandidateId, setCandidateId } from '../lib/prng';
import type { TechnicalReport, BugReport, CandidateInfo, TestSession, ImageEvidence } from './types';
import {
  calculateScore,
  generatePDF,
  exportToJSON,
  fileToBase64,
  validateImageFile,
  formatFileSize,
  saveReportToCache,
  loadReportFromCache,
  clearReportCache,
  formatLastSaved,
} from './utils';

export default function TechnicalReportPage() {
  const { isDarkMode } = useTheme();
  const { user } = useSupabaseAuth();

  // Candidate Info
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({
    fullName: '',
    email: '',
    githubProfile: '',
    linkedinProfile: '',
    candidateId: '',
    testDate: new Date(),
  });

  // Test Session
  const [testSession, setTestSession] = useState<TestSession>({
    startTime: new Date(),
    endTime: new Date(),
    duration: 30,
    exploredSections: [],
  });

  // Bugs
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [currentBug, setCurrentBug] = useState<Partial<BugReport>>({
    id: `bug-${Date.now()}`,
    title: '',
    description: '',
    stepsToReproduce: [''],
    expectedResult: '',
    actualResult: '',
    severity: 'Medium',
    category: '',
    evidence: '',
    images: [],
    foundAt: new Date(),
  });

  // Audit Log
  const [auditLog, setAuditLog] = useState<any[]>([]);

  // UI State
  const [showBugForm, setShowBugForm] = useState(false);
  const [editingBugId, setEditingBugId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Load audit log and cached report from localStorage on mount
  useEffect(() => {
    try {
      // Load audit log
      const storedLog = localStorage.getItem('testAppAuditLog');
      if (storedLog) {
        const log = JSON.parse(storedLog);
        setAuditLog(log);

        // Extract explored sections
        const sections = new Set<string>();
        log.forEach((entry: any) => {
          if (entry.page) {
            sections.add(entry.page);
          }
        });
        setTestSession((prev: TestSession) => ({ ...prev, exploredSections: Array.from(sections) }));
      }

      // Load cached report
      const cachedReport = loadReportFromCache();
      if (cachedReport) {
        setCandidateInfo(cachedReport.candidateInfo);
        setTestSession((prev: TestSession) => ({
          ...prev,
          ...cachedReport.testSession,
        }));
        setBugs(cachedReport.bugs);
        setLastSaved(cachedReport.lastSaved);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setIsLoadingCache(false);
    }
  }, []);

  useEffect(() => {
    if (isLoadingCache) return;

    const defaults = getExamUserDefaults(user);
    const currentTestAppUser = getCurrentUser();
    const storedCandidateId = getCandidateId();
    const nextCandidateId =
      storedCandidateId ||
      defaults.candidateId ||
      currentTestAppUser?.id ||
      '';

    setCandidateInfo((prev) => ({
      ...prev,
      fullName: prev.fullName || defaults.fullName || currentTestAppUser?.name || '',
      email: prev.email || defaults.email || currentTestAppUser?.email || '',
      githubProfile: prev.githubProfile || defaults.githubProfile,
      linkedinProfile: prev.linkedinProfile || defaults.linkedinProfile,
      candidateId: prev.candidateId || nextCandidateId,
    }));

    if (nextCandidateId && storedCandidateId !== nextCandidateId) {
      setCandidateId(nextCandidateId);
    }
  }, [user, isLoadingCache]);

  // Auto-save to cache when state changes
  useEffect(() => {
    if (!isLoadingCache) {
      saveReportToCache(candidateInfo, testSession, bugs);
      setLastSaved(new Date().toISOString());
    }
  }, [candidateInfo, testSession, bugs, isLoadingCache]);

  const handleAddStep = () => {
    setCurrentBug((prev: Partial<BugReport>) => ({
      ...prev,
      stepsToReproduce: [...(prev.stepsToReproduce || ['']), ''],
    }));
  };

  const handleRemoveStep = (index: number) => {
    setCurrentBug((prev: Partial<BugReport>) => ({
      ...prev,
      stepsToReproduce: prev.stepsToReproduce?.filter((_: string, i: number) => i !== index) || [''],
    }));
  };

  const handleUpdateStep = (index: number, value: string) => {
    setCurrentBug((prev: Partial<BugReport>) => ({
      ...prev,
      stepsToReproduce: prev.stepsToReproduce?.map((step: string, i: number) => (i === index ? value : step)) || [''],
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageEvidence[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(`Error en ${file.name}: ${validation.error}`);
        continue;
      }

      try {
        // Convert to base64
        const base64Data = await fileToBase64(file);

        const imageEvidence: ImageEvidence = {
          id: `img-${Date.now()}-${i}`,
          fileName: file.name,
          base64Data,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date(),
        };

        newImages.push(imageEvidence);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        alert(`Error al cargar ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      setCurrentBug((prev: Partial<BugReport>) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
    }

    // Reset file input
    event.target.value = '';
  };

  const handleRemoveImage = (imageId: string) => {
    setCurrentBug((prev: Partial<BugReport>) => ({
      ...prev,
      images: prev.images?.filter((img: ImageEvidence) => img.id !== imageId) || [],
    }));
  };

  const handleSaveBug = () => {
    if (!currentBug.title || !currentBug.expectedResult || !currentBug.actualResult) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const bugToSave: BugReport = {
      id: currentBug.id || `bug-${Date.now()}`,
      title: currentBug.title || '',
      description: currentBug.description || '',
      stepsToReproduce: (currentBug.stepsToReproduce || ['']).filter((step: string) => step.trim() !== ''),
      expectedResult: currentBug.expectedResult || '',
      actualResult: currentBug.actualResult || '',
      severity: currentBug.severity || 'Medium',
      category: currentBug.category || 'General',
      evidence: currentBug.evidence || '',
      images: currentBug.images || [],
      foundAt: currentBug.foundAt || new Date(),
    };

    if (editingBugId) {
      setBugs((prev: BugReport[]) => prev.map((bug: BugReport) => (bug.id === editingBugId ? bugToSave : bug)));
      setEditingBugId(null);
    } else {
      setBugs((prev: BugReport[]) => [...prev, bugToSave]);
    }

    // Reset form
    setCurrentBug({
      id: `bug-${Date.now()}`,
      title: '',
      description: '',
      stepsToReproduce: [''],
      expectedResult: '',
      actualResult: '',
      severity: 'Medium',
      category: '',
      evidence: '',
      images: [],
      foundAt: new Date(),
    });
    setShowBugForm(false);
  };

  const handleEditBug = (bug: BugReport) => {
    setCurrentBug(bug);
    setEditingBugId(bug.id);
    setShowBugForm(true);
  };

  const handleDeleteBug = (bugId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este bug?')) {
      setBugs((prev: BugReport[]) => prev.filter((bug: BugReport) => bug.id !== bugId));
    }
  };

  const handleGeneratePDF = async () => {
    if (!candidateInfo.fullName || !candidateInfo.email || !candidateInfo.candidateId) {
      alert('Por favor, completa la información del candidato');
      return;
    }

    const report: TechnicalReport = {
      candidateInfo,
      testSession,
      bugsFound: bugs,
      auditLog,
      score: calculateScore({ candidateInfo, testSession, bugsFound: bugs, auditLog, score: {} as any }),
    };

    await generatePDF(report);
  };

  const handleExportJSON = () => {
    const report: TechnicalReport = {
      candidateInfo,
      testSession,
      bugsFound: bugs,
      auditLog,
      score: calculateScore({ candidateInfo, testSession, bugsFound: bugs, auditLog, score: {} as any }),
    };

    exportToJSON(report);
  };

  const handleClearCache = () => {
    if (
      confirm(
        '¿Estás seguro de que deseas limpiar todos los datos guardados? Esta acción no se puede deshacer.',
      )
    ) {
      clearReportCache();
      const defaults = getExamUserDefaults(user);
      const currentTestAppUser = getCurrentUser();
      const nextCandidateId =
        getCandidateId() ||
        defaults.candidateId ||
        currentTestAppUser?.id ||
        '';
      setCandidateInfo({
        fullName: defaults.fullName || currentTestAppUser?.name || '',
        email: defaults.email || currentTestAppUser?.email || '',
        githubProfile: defaults.githubProfile,
        linkedinProfile: defaults.linkedinProfile,
        candidateId: nextCandidateId,
        testDate: new Date(),
      });
      setTestSession({
        startTime: new Date(),
        endTime: new Date(),
        duration: 30,
        exploredSections: [],
      });
      setBugs([]);
      setLastSaved(null);
      setEmailSent(false);
      setCurrentBug({
        id: `bug-${Date.now()}`,
        title: '',
        description: '',
        stepsToReproduce: [''],
        expectedResult: '',
        actualResult: '',
        severity: 'Medium',
        category: '',
        evidence: '',
        images: [],
        foundAt: new Date(),
      });
      setShowBugForm(false);
      setEditingBugId(null);
    }
  };

  const handleSendEmail = async () => {
    if (!candidateInfo.fullName || !candidateInfo.email || !candidateInfo.candidateId) {
      alert('Por favor, completa la información del candidato antes de enviar');
      return;
    }

    setIsSendingEmail(true);
    try {
      const report: TechnicalReport = {
        candidateInfo,
        testSession,
        bugsFound: bugs,
        auditLog,
        score: calculateScore({ candidateInfo, testSession, bugsFound: bugs, auditLog, score: {} as any }),
      };

      const response = await fetch('/api/v1/labs/test-app/send-bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el informe');
      }

      const result = await response.json();
      alert(result.message || 'Informe enviado exitosamente');
      setEmailSent(true);
    } catch (error) {
      console.error('Error al enviar el informe:', error);
      alert('Error al enviar el informe. Por favor, intenta nuevamente.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const score = calculateScore({
    candidateInfo,
    testSession,
    bugsFound: bugs,
    auditLog,
    score: {} as any,
  });

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🎯 Generador de Informe Técnico
              </h1>
              <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                Prueba Técnica: Exploratory Testing & Bug Hunt
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Auto-save indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'} animate-pulse`}></div>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {formatLastSaved(lastSaved)}
                </span>
              </div>
              {/* Clear cache button */}
              <button
                onClick={handleClearCache}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${isDarkMode
                  ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                title="Limpiar todos los datos guardados"
              >
                🗑️ Limpiar Caché
              </button>
            </div>
          </div>
        </div>

        {/* Score Overview */}
        <div className={`rounded-lg shadow-lg mb-6 p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Puntuación Actual
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Bugs Encontrados</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {score.bugsFoundPoints}/15
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Calidad del Reporte</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {score.reportQualityPoints}/10
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Cobertura</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {score.coveragePoints}/5
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>Total</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                {score.totalPoints}/30
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                ({score.percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Info */}
        <div className={`rounded-lg shadow-lg mb-6 p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            👤 Información del Candidato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Nombre Completo *
              </label>
              <input
                type="text"
                value={candidateInfo.fullName}
                onChange={(e) => setCandidateInfo((prev) => ({ ...prev, fullName: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Email *
              </label>
              <input
                type="email"
                value={candidateInfo.email}
                onChange={(e) => setCandidateInfo((prev) => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                placeholder="juan@example.com"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                GitHub Profile
              </label>
              <input
                type="text"
                value={candidateInfo.githubProfile}
                onChange={(e) => setCandidateInfo((prev) => ({ ...prev, githubProfile: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Candidate ID *
              </label>
              <input
                type="text"
                value={candidateInfo.candidateId}
                onChange={(e) => setCandidateInfo((prev) => ({ ...prev, candidateId: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                placeholder="candidate-123"
              />
            </div>
          </div>
        </div>

        {/* Test Session */}
        <div className={`rounded-lg shadow-lg mb-6 p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ⏱️ Sesión de Prueba
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Duración (minutos)
              </label>
              <input
                type="number"
                value={testSession.duration}
                onChange={(e) => setTestSession((prev) => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                placeholder="30"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Secciones Exploradas
              </label>
              <input
                type="text"
                value={testSession.exploredSections.length}
                disabled
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-400'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Auto-detectado desde audit log
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Eventos en Audit Log
              </label>
              <input
                type="text"
                value={auditLog.length}
                disabled
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-400'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Bugs List */}
        <div className={`rounded-lg shadow-lg mb-6 p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🐛 Bugs Encontrados ({bugs.length})
            </h2>
            <button
              onClick={() => setShowBugForm(!showBugForm)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              {showBugForm ? '✕ Cancelar' : '➕ Agregar Bug'}
            </button>
          </div>

          {/* Bug Form */}
          {showBugForm && (
            <div className={`mb-6 p-4 rounded-lg border-2 border-amber-500 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingBugId ? 'Editar Bug' : 'Nuevo Bug'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Título *
                  </label>
                  <input
                    type="text"
                    value={currentBug.title}
                    onChange={(e) => setCurrentBug((prev) => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="Ej: Total del carrito no recalcula impuestos"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Severidad *
                    </label>
                    <select
                      value={currentBug.severity}
                      onChange={(e) =>
                        setCurrentBug((prev) => ({
                          ...prev,
                          severity: e.target.value as BugReport['severity'],
                        }))
                      }
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'bg-slate-600 border-slate-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={currentBug.category}
                      onChange={(e) => setCurrentBug((prev) => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'bg-slate-600 border-slate-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="Ej: Carrito, Checkout, UI"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Pasos para Reproducir *
                  </label>
                  {currentBug.stepsToReproduce?.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <span className={`pt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{index + 1}.</span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => handleUpdateStep(index, e.target.value)}
                        className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode
                          ? 'bg-slate-600 border-slate-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                        placeholder="Describe el paso..."
                      />
                      {(currentBug.stepsToReproduce?.length || 0) > 1 && (
                        <button
                          onClick={() => handleRemoveStep(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddStep}
                    className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-600'} hover:underline`}
                  >
                    + Agregar paso
                  </button>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Resultado Esperado *
                  </label>
                  <textarea
                    value={currentBug.expectedResult}
                    onChange={(e) => setCurrentBug((prev) => ({ ...prev, expectedResult: e.target.value }))}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="¿Qué debería pasar?"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Resultado Real *
                  </label>
                  <textarea
                    value={currentBug.actualResult}
                    onChange={(e) => setCurrentBug((prev) => ({ ...prev, actualResult: e.target.value }))}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="¿Qué pasa actualmente?"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Evidencia (opcional)
                  </label>
                  <textarea
                    value={currentBug.evidence}
                    onChange={(e) => setCurrentBug((prev) => ({ ...prev, evidence: e.target.value }))}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="Screenshots, logs, referencias al audit log, etc."
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Capturas de Pantalla (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Formatos: JPG, PNG, GIF, WebP. Máximo: 5MB por imagen
                  </p>

                  {/* Image Previews */}
                  {currentBug.images && currentBug.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {currentBug.images.map((image) => (
                        <div
                          key={image.id}
                          className={`relative rounded-lg overflow-hidden border-2 ${isDarkMode ? 'border-slate-500' : 'border-gray-300'
                            }`}
                        >
                          <img
                            src={image.base64Data}
                            alt={image.fileName}
                            className="w-full h-32 object-cover"
                          />
                          <div className={`p-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                            <p className={`text-xs truncate ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              {image.fileName}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                              {formatFileSize(image.size)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveImage(image.id)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBug}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingBugId ? '💾 Guardar Cambios' : '➕ Agregar Bug'}
                  </button>
                  <button
                    onClick={() => {
                      setShowBugForm(false);
                      setEditingBugId(null);
                      setCurrentBug({
                        id: `bug-${Date.now()}`,
                        title: '',
                        description: '',
                        stepsToReproduce: [''],
                        expectedResult: '',
                        actualResult: '',
                        severity: 'Medium',
                        category: '',
                        evidence: '',
                        images: [],
                        foundAt: new Date(),
                      });
                    }}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDarkMode
                      ? 'bg-slate-600 hover:bg-slate-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bugs List */}
          {bugs.length === 0 ? (
            <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              No se han agregado bugs aún. Haz clic en &quot;Agregar Bug&quot; para comenzar.
            </p>
          ) : (
            <div className="space-y-4">
              {bugs.map((bug, index) => (
                <div
                  key={bug.id}
                  className={`p-4 rounded-lg border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Bug #{index + 1}: {bug.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBug(bug)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteBug(bug.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold`}
                      style={{
                        backgroundColor: bug.severity === 'Critical' || bug.severity === 'High' ? '#FEE2E2' : bug.severity === 'Medium' ? '#FEF3C7' : '#DBEAFE',
                        color: bug.severity === 'Critical' || bug.severity === 'High' ? '#991B1B' : bug.severity === 'Medium' ? '#92400E' : '#1E40AF',
                      }}
                    >
                      {bug.severity}
                    </span>
                    {bug.category && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-slate-600 text-slate-200' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {bug.category}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    <strong>Pasos:</strong> {bug.stepsToReproduce.length} paso(s) documentado(s)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📄 Generar Informe
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleGeneratePDF}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              📄 Generar PDF
            </button>
            <button
              onClick={handleExportJSON}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              💾 Exportar JSON
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail || emailSent}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                emailSent
                  ? isDarkMode
                    ? 'bg-green-900/50 text-green-300 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 cursor-not-allowed'
                  : isSendingEmail
                  ? 'bg-purple-400 text-white cursor-wait'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isSendingEmail ? '📧 Enviando...' : emailSent ? '✅ Enviado' : '📧 Enviar por Correo'}
            </button>
            <a
              href="/labs/test-app"
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
            >
              ← Volver al Test App
            </a>
          </div>
          {emailSent && (
            <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-300'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                ✅ Informe enviado exitosamente a admin@aiquaa.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
