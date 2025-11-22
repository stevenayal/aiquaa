'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Resource {
  id: string;
  title: string;
  description: string;
  filename: string;
  pages: number;
  lastUpdated: string;
  featured?: boolean;
  isNew?: boolean;
  category: 'git' | 'performance' | 'testing' | 'automation';
}

const resources: Resource[] = [
  {
    id: 'git-intro',
    title: 'Introducción a GIT',
    description: 'Guía completa para principiantes sobre control de versiones con Git. Incluye comandos básicos, flujos de trabajo y buenas prácticas.',
    filename: 'Introduccion-a-GIT.pdf',
    pages: 45,
    lastUpdated: '2025-01-15',
    featured: true,
    category: 'git'
  },
  {
    id: 'jmeter-exam',
    title: 'Examen Técnico JMeter',
    description: 'Evaluación completa basada en la documentación oficial de JMeter y el syllabus PtU CPTJM. 35 preguntas que cubren teoría y práctica.',
    filename: 'examen_jmeter.json',
    pages: 15,
    lastUpdated: '2025-01-22',
    isNew: true,
    featured: true,
    category: 'performance'
  }
];

export default function RecursosPage() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  const getCategoryResources = (category: string) => {
    return resources.filter(r => r.category === category);
  };

  const categories = [
    { id: 'git', icon: '🔀', color: 'from-orange-500 to-red-500' },
    { id: 'performance', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
    { id: 'testing', icon: '🧪', color: 'from-green-500 to-emerald-500' },
    { id: 'automation', icon: '🤖', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            📚 {t('resources.title')}
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            {t('resources.subtitle')}
          </p>
        </div>

        {/* Categories */}
        {categories.map(category => {
          const categoryResources = getCategoryResources(category.id);

          if (categoryResources.length === 0) return null;

          return (
            <div key={category.id} className="mb-16">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`text-3xl bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                  {category.icon}
                </div>
                <h2 className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}>
                  {t(`resources.category.${category.id}`)}
                </h2>
              </div>

              {/* Resources Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryResources.map(resource => (
                  <div
                    key={resource.id}
                    className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700'
                        : 'bg-white hover:shadow-xl'
                    }`}
                  >
                    {/* Badges */}
                    <div className="flex gap-2 mb-4">
                      {resource.featured && (
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          isDarkMode
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          ⭐ {t('resources.featured')}
                        </span>
                      )}
                      {resource.isNew && (
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          isDarkMode
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          ✨ {t('resources.new')}
                        </span>
                      )}
                    </div>

                    {/* Document Icon */}
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-slate-700' : 'bg-brand-light'
                      }`}>
                        <span className="text-5xl">📄</span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className={`text-xl font-bold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-brand-text'
                    }`}>
                      {resource.title}
                    </h3>
                    <p className={`text-sm mb-4 ${
                      isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                    }`}>
                      {resource.description}
                    </p>

                    {/* Metadata */}
                    <div className={`flex items-center gap-4 text-sm mb-4 ${
                      isDarkMode ? 'text-slate-500' : 'text-brand-muted'
                    }`}>
                      <div className="flex items-center gap-1">
                        <span>📄</span>
                        <span>{resource.pages} {t('resources.pages')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{t('resources.updated')}: {new Date(resource.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <a
                        href={`/${resource.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          isDarkMode
                            ? 'bg-brand-primary hover:bg-brand-primary/90 text-white'
                            : 'bg-brand-primary hover:bg-brand-primary/90 text-white'
                        }`}
                      >
                        <span>👁️</span>
                        {t('resources.view')}
                      </a>
                      <a
                        href={`/${resource.filename}`}
                        download
                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          isDarkMode
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-brand-dark hover:bg-brand-dark/90 text-white'
                        }`}
                      >
                        <span>⬇️</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty State for categories without resources */}
        {categories.filter(cat => getCategoryResources(cat.id).length === 0).length > 0 && (
          <div className={`text-center py-12 rounded-lg ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-6xl mb-4">📚</div>
            <p className={`text-lg ${
              isDarkMode ? 'text-slate-400' : 'text-brand-muted'
            }`}>
              Más recursos próximamente...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
