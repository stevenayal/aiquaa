'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getMyEmpresaAction,
  updateEmpresaAction,
  type Empresa,
} from '@/actions/empresa-admin';
import { createClient } from '@/lib/supabase/client';

const INDUSTRIES = [
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'finanzas', label: 'Finanzas / Banca' },
  { value: 'salud', label: 'Salud' },
  { value: 'retail', label: 'Retail / Comercio' },
  { value: 'telecomunicaciones', label: 'Telecomunicaciones' },
  { value: 'educacion', label: 'Educación' },
  { value: 'gobierno', label: 'Gobierno / Público' },
  { value: 'manufactura', label: 'Manufactura' },
  { value: 'logistica', label: 'Logística' },
  { value: 'otro', label: 'Otro' },
];

const WORK_MODES = [
  { value: 'remoto', label: '🌐 Remoto' },
  { value: 'hibrido', label: '🏠 Híbrido' },
  { value: 'presencial', label: '🏢 Presencial' },
];

const QA_TEAM_SIZES = [
  { value: '1', label: '1 persona' },
  { value: '2-5', label: '2–5 personas' },
  { value: '5-20', label: '5–20 personas' },
  { value: '20+', label: '20+ personas' },
];

const TECH_STACK_SUGGESTIONS = [
  'Selenium',
  'Cypress',
  'Playwright',
  'Jira',
  'Postman',
  'Git',
  'Jenkins',
  'GitHub Actions',
  'TestRail',
  'Appium',
  'k6',
  'JMeter',
  'SQL',
  'Python',
  'Java',
];

const TEAM_SIZES = [
  { value: '1-10', label: '1–10 personas' },
  { value: '11-50', label: '11–50 personas' },
  { value: '51-200', label: '51–200 personas' },
  { value: '201-500', label: '201–500 personas' },
  { value: '500+', label: 'Más de 500' },
];

const COUNTRIES = [
  { value: 'PY', label: 'Paraguay' },
  { value: 'AR', label: 'Argentina' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'BR', label: 'Brasil' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'MX', label: 'México' },
  { value: 'PE', label: 'Perú' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'otro', label: 'Otro' },
];

const PROFILE_FIELDS = [
  { key: 'logo_url', label: 'Logo de la empresa', anchor: '#logo' },
  { key: 'razon_social', label: 'Razón social', anchor: '#razon-social' },
  { key: 'description', label: 'Descripción', anchor: '#descripcion' },
  { key: 'website_url', label: 'Sitio web', anchor: '#website' },
  { key: 'industry', label: 'Industria', anchor: '#industria' },
  { key: 'country', label: 'País', anchor: '#pais' },
  { key: 'team_size', label: 'Tamaño del equipo', anchor: '#team-size' },
  { key: 'work_mode', label: 'Modalidad de trabajo', anchor: '#work-mode' },
] as const;

function completionScore(empresa: Empresa): number {
  return Math.round(
    (PROFILE_FIELDS.filter((f) => empresa[f.key as keyof Empresa]).length /
      PROFILE_FIELDS.length) *
      100
  );
}

function getMissingFields(empresa: Empresa) {
  return PROFILE_FIELDS.filter((f) => !empresa[f.key as keyof Empresa]);
}

export default function EmpresaPerfilPage() {
  const { isDarkMode } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, startSaving] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const [form, setForm] = useState({
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    description: '',
    website_url: '',
    industry: '',
    country: 'PY',
    team_size: '',
    work_mode: '',
    benefits: '',
    linkedin_url: '',
    qa_team_size: '',
  });
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techStackInput, setTechStackInput] = useState('');

  useEffect(() => {
    getMyEmpresaAction().then(({ data }) => {
      if (data) {
        setEmpresa(data);
        setForm({
          razon_social: data.razon_social ?? '',
          nombre_comercial: data.nombre_comercial ?? '',
          ruc: data.ruc ?? '',
          description: data.description ?? '',
          website_url: data.website_url ?? '',
          industry: data.industry ?? '',
          country: data.country ?? 'PY',
          team_size: data.team_size ?? '',
          work_mode: data.work_mode ?? '',
          benefits: data.benefits ?? '',
          linkedin_url: data.linkedin_url ?? '',
          qa_team_size: data.qa_team_size ?? '',
        });
        setTechStack(data.tech_stack ?? []);
      }
      setLoading(false);
    });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !empresa) return;
    if (file.size > 2 * 1024 * 1024) {
      setAlert({ type: 'error', msg: 'El logo no puede superar 2 MB' });
      return;
    }

    setUploading(true);
    setAlert(null);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${empresa.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('empresa-logos')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setAlert({ type: 'error', msg: 'Error al subir el logo' });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('empresa-logos').getPublicUrl(path);

    const logoUrl = `${publicUrl}?t=${Date.now()}`;
    const { error: updateErr } = await updateEmpresaAction({
      logo_url: logoUrl,
    });
    if (updateErr) {
      setAlert({ type: 'error', msg: updateErr });
    } else {
      setEmpresa((prev) => (prev ? { ...prev, logo_url: logoUrl } : prev));
      setAlert({ type: 'success', msg: 'Logo actualizado correctamente' });
    }
    setUploading(false);
  };

  const handleSave = () => {
    setAlert(null);
    // Validate URL
    if (form.website_url && !/^https?:\/\/.+/.test(form.website_url)) {
      setAlert({
        type: 'error',
        msg: 'El sitio web debe comenzar con http:// o https://',
      });
      return;
    }
    // Validate RUC format for Paraguay: digits-digit (e.g. 80012345-6)
    if (
      form.ruc &&
      form.country === 'PY' &&
      !/^\d{6,8}-\d$/.test(form.ruc.trim())
    ) {
      setAlert({
        type: 'error',
        msg: 'El RUC debe tener el formato 80012345-6 (dígitos guión dígito verificador)',
      });
      return;
    }
    startSaving(async () => {
      const { error } = await updateEmpresaAction({ ...form, tech_stack: techStack });
      if (error) {
        setAlert({ type: 'error', msg: error });
      } else {
        setEmpresa((prev) =>
          prev ? { ...prev, ...form, tech_stack: techStack } : prev
        );
        setAlert({ type: 'success', msg: 'Perfil guardado correctamente' });
      }
    });
  };

  const card = isDarkMode
    ? 'bg-dark-secondary border-slate-700'
    : 'bg-white border-gray-200';
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  const score = empresa ? completionScore(empresa) : 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Perfil de empresa
            </h1>
            <p
              className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Esta información es visible para los candidatos QA
            </p>
          </div>
          <Link
            href="/empresa"
            className={`text-sm ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            ← Panel
          </Link>
        </div>

        {/* Completion progress */}
        <div className={`rounded-xl border p-4 ${card}`}>
          <div className="flex items-center justify-between mb-2">
            <p
              className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Completitud del perfil
            </p>
            <span
              className={`text-sm font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'}`}
            >
              {score}%
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
          >
            <div
              className={`h-2 rounded-full transition-all duration-500 ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          {score < 100 && empresa && getMissingFields(empresa).length > 0 && (
            <div className="mt-3 space-y-1">
              <p
                className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Falta completar:
              </p>
              {getMissingFields(empresa).map((f) => (
                <a
                  key={f.key}
                  href={f.anchor}
                  className={`flex items-center gap-1.5 text-xs hover:underline ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}
                >
                  <span aria-hidden="true">•</span> {f.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Alert */}
        {alert && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${
              alert.type === 'success'
                ? isDarkMode
                  ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isDarkMode
                  ? 'bg-red-900/40 text-red-300 border border-red-700'
                  : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <span>
              {alert.type === 'success' ? '✅' : '❌'} {alert.msg}
            </span>
            <button
              onClick={() => setAlert(null)}
              className="ml-4 opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Logo */}
        <div id="logo" className={`rounded-xl border p-6 ${card}`}>
          <h2
            className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Logo de la empresa
          </h2>
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center overflow-hidden shrink-0 relative ${
                isDarkMode
                  ? 'border-slate-600 bg-slate-700'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {empresa?.logo_url ? (
                <Image
                  src={empresa.logo_url}
                  alt="Logo empresa"
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-3xl">🏢</span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
              >
                {uploading
                  ? 'Subiendo...'
                  : empresa?.logo_url
                    ? '🔄 Cambiar logo'
                    : '📷 Subir logo'}
              </button>
              <p
                className={`text-xs mt-1.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                PNG, JPG · Máx 2 MB · Recomendado: 400×400px
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        {/* Datos básicos */}
        <div className={`rounded-xl border p-6 space-y-5 ${card}`}>
          <h2
            className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Datos de la empresa
          </h2>

          <div id="razon-social">
            <label className={labelClass}>Razón social *</label>
            <input
              type="text"
              value={form.razon_social}
              onChange={(e) =>
                setForm((f) => ({ ...f, razon_social: e.target.value }))
              }
              placeholder="Ej: Empresa S.A."
              className={inputClass}
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre comercial</label>
              <input
                type="text"
                value={form.nombre_comercial}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nombre_comercial: e.target.value }))
                }
                placeholder="Ej: MiEmpresa"
                className={inputClass}
                maxLength={80}
              />
            </div>
            <div>
              <label className={labelClass}>
                RUC{' '}
                {form.country === 'PY' && (
                  <span
                    className={`font-normal ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    (formato: 80012345-6)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={form.ruc}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ruc: e.target.value }))
                }
                placeholder="Ej: 80012345-6"
                className={inputClass}
                maxLength={20}
              />
            </div>
          </div>

          <div id="descripcion">
            <label className={labelClass}>Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
              placeholder="¿Qué hace tu empresa? ¿Cuál es su cultura? ¿Qué buscan en un QA?"
              className={`${inputClass} resize-none`}
              maxLength={800}
            />
            <p
              className={`text-xs mt-1 text-right ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              {form.description.length}/800
            </p>
          </div>

          <div id="website">
            <label className={labelClass}>Sitio web</label>
            <input
              type="url"
              value={form.website_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, website_url: e.target.value }))
              }
              placeholder="https://miempresa.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Contexto laboral */}
        <div className={`rounded-xl border p-6 space-y-5 ${card}`}>
          <h2
            className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Contexto laboral
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div id="industria">
              <label className={labelClass}>Industria / rubro</label>
              <select
                value={form.industry}
                onChange={(e) =>
                  setForm((f) => ({ ...f, industry: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">Seleccioná...</option>
                {INDUSTRIES.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
            <div id="pais">
              <label className={labelClass}>País / sede principal</label>
              <select
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({ ...f, country: e.target.value }))
                }
                className={inputClass}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div id="team-size">
            <label className={labelClass}>Tamaño del equipo</label>
            <div className="flex flex-wrap gap-2">
              {TEAM_SIZES.map((ts) => (
                <button
                  key={ts.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, team_size: ts.value }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.team_size === ts.value
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'border-slate-600 text-slate-300 hover:border-indigo-400'
                        : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Employer branding */}
        <div className={`rounded-xl border p-6 space-y-5 ${card}`}>
          <h2
            className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Employer branding QA
          </h2>

          <div id="work-mode">
            <label className={labelClass}>Modalidad de trabajo</label>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((wm) => (
                <button
                  key={wm.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      work_mode: f.work_mode === wm.value ? '' : wm.value,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.work_mode === wm.value
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'border-slate-600 text-slate-300 hover:border-indigo-400'
                        : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {wm.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Tamaño del equipo QA</label>
            <div className="flex flex-wrap gap-2">
              {QA_TEAM_SIZES.map((qs) => (
                <button
                  key={qs.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      qa_team_size: f.qa_team_size === qs.value ? '' : qs.value,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.qa_team_size === qs.value
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'border-slate-600 text-slate-300 hover:border-indigo-400'
                        : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {qs.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Stack tecnológico QA</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {techStack.map((tool) => (
                <span
                  key={tool}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    isDarkMode
                      ? 'bg-indigo-900/50 text-indigo-200'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() =>
                      setTechStack((prev) => prev.filter((t) => t !== tool))
                    }
                    className="opacity-60 hover:opacity-100 leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    (e.key === 'Enter' || e.key === ',') &&
                    techStackInput.trim()
                  ) {
                    e.preventDefault();
                    const tool = techStackInput.trim();
                    if (!techStack.includes(tool)) {
                      setTechStack((prev) => [...prev, tool]);
                    }
                    setTechStackInput('');
                  }
                }}
                placeholder="Ej: Selenium, Cypress, Jira..."
                className={`${inputClass} flex-1`}
                list="tech-suggestions"
              />
              <datalist id="tech-suggestions">
                {TECH_STACK_SUGGESTIONS.filter(
                  (s) => !techStack.includes(s)
                ).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={() => {
                  const tool = techStackInput.trim();
                  if (tool && !techStack.includes(tool)) {
                    setTechStack((prev) => [...prev, tool]);
                  }
                  setTechStackInput('');
                }}
                className="px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                +
              </button>
            </div>
            <p
              className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              Presioná Enter o coma para agregar. Seleccioná de las sugerencias o escribí cualquier herramienta.
            </p>
          </div>

          <div>
            <label className={labelClass}>Beneficios para el equipo QA</label>
            <textarea
              value={form.benefits}
              onChange={(e) =>
                setForm((f) => ({ ...f, benefits: e.target.value }))
              }
              rows={3}
              placeholder="Ej: Obra social, días de home office, capacitaciones pagas, certificaciones ISTQB..."
              className={`${inputClass} resize-none`}
              maxLength={500}
            />
            <p
              className={`text-xs mt-1 text-right ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              {form.benefits.length}/500
            </p>
          </div>

          <div>
            <label className={labelClass}>LinkedIn de la empresa</label>
            <input
              type="url"
              value={form.linkedin_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, linkedin_url: e.target.value }))
              }
              placeholder="https://linkedin.com/company/mi-empresa"
              className={inputClass}
            />
          </div>
        </div>

        {/* Preview link */}
        {empresa && (
          <div
            className={`rounded-xl border p-4 flex items-center justify-between ${card}`}
          >
            <div>
              <p
                className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Vista pública de la empresa
              </p>
              <p
                className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Así ve un candidato QA tu empresa
              </p>
            </div>
            <Link
              href={`/empresas/${empresa.id}`}
              target="_blank"
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-indigo-300 hover:bg-slate-700'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Ver perfil →
            </Link>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : '💾 Guardar cambios'}
        </button>

        <div className="pb-4">
          <Link
            href="/empresa"
            className={`text-sm ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            ← Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
