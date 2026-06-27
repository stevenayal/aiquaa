import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';

const INDUSTRY_LABELS: Record<string, string> = {
  tecnologia: 'Tecnología',
  finanzas: 'Finanzas / Banca',
  salud: 'Salud',
  retail: 'Retail / Comercio',
  telecomunicaciones: 'Telecomunicaciones',
  educacion: 'Educación',
  gobierno: 'Gobierno / Público',
  manufactura: 'Manufactura',
  logistica: 'Logística',
  otro: 'Otro',
};

const COUNTRY_LABELS: Record<string, string> = {
  PY: '🇵🇾 Paraguay',
  AR: '🇦🇷 Argentina',
  BO: '🇧🇴 Bolivia',
  BR: '🇧🇷 Brasil',
  CL: '🇨🇱 Chile',
  CO: '🇨🇴 Colombia',
  EC: '🇪🇨 Ecuador',
  MX: '🇲🇽 México',
  PE: '🇵🇪 Perú',
  UY: '🇺🇾 Uruguay',
  VE: '🇻🇪 Venezuela',
};

export const revalidate = 300;

export default async function EmpresasDirectoryPage() {
  const supabase = await createClient();

  const { data: empresas } = await supabase
    .from('empresas')
    .select(
      'id, razon_social, nombre_comercial, logo_url, description, industry, country, team_size, website_url, work_mode'
    )
    .order('razon_social', { ascending: true });

  const list = empresas ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Directorio de empresas
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Empresas que usan AIQUAA para evaluar talento QA en LATAM
          </p>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-medium">Todavía no hay empresas publicadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((empresa) => {
              const name = empresa.nombre_comercial || empresa.razon_social;
              return (
                <Link
                  key={empresa.id}
                  href={`/empresas/${empresa.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative">
                      {empresa.logo_url ? (
                        <Image
                          src={empresa.logo_url}
                          alt={`Logo ${name}`}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-2xl">🏢</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                        {name}
                      </h2>
                      {empresa.description && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {empresa.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {empresa.industry && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                            {INDUSTRY_LABELS[empresa.industry] ?? empresa.industry}
                          </span>
                        )}
                        {empresa.country && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                            {COUNTRY_LABELS[empresa.country] ?? empresa.country}
                          </span>
                        )}
                        {empresa.work_mode && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {empresa.work_mode === 'remoto'
                              ? '🌐 Remoto'
                              : empresa.work_mode === 'hibrido'
                                ? '🏠 Híbrido'
                                : '🏢 Presencial'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-indigo-600 dark:text-indigo-400 font-medium self-center">
                      Ver →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            ← Volver a AIQUAA
          </Link>
        </div>
      </div>
    </div>
  );
}
