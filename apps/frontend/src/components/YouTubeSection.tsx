'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  chapter?: number;
  isNew?: boolean;
  thumbnail?: string;
}

// Lista de videos del canal AIQUAA
const videos: YouTubeVideo[] = [
  {
    id: 'cap1',
    title: 'Capítulo 1 - El Mundo de las Pruebas de Software',
    description: 'Introducción al mundo del testing: qué es, por qué es importante y los fundamentos del ISTQB CTFL v4.0.',
    videoId: 'q7I42B9douk',
    duration: '',
    chapter: 1,
    thumbnail: 'https://img.youtube.com/vi/q7I42B9douk/maxresdefault.jpg'
  },
  {
    id: 'cap2',
    title: 'Capítulo 2 - El Arte de Probar Software',
    description: 'Técnicas de prueba estática y dinámica, niveles de testing y cómo diseñar casos de prueba efectivos.',
    videoId: 'wWlP2-8uzv0',
    duration: '',
    chapter: 2,
    thumbnail: 'https://img.youtube.com/vi/wWlP2-8uzv0/maxresdefault.jpg'
  },
  {
    id: 'cap3',
    title: 'Capítulo 3 - Pruebas Estáticas',
    description: 'Revisiones, inspecciones y análisis estático de código. Técnicas para encontrar defectos sin ejecutar el software.',
    videoId: 'tF61cMWLlF0',
    duration: '',
    chapter: 3,
    thumbnail: 'https://img.youtube.com/vi/tF61cMWLlF0/maxresdefault.jpg'
  },
  {
    id: 'cap4',
    title: 'Capítulo 4 - La Vida Secreta del Testing',
    description: 'Técnicas de diseño de pruebas: caja negra, caja blanca y basadas en experiencia.',
    videoId: 'h3uVKefxuhk',
    duration: '',
    chapter: 4,
    thumbnail: 'https://img.youtube.com/vi/h3uVKefxuhk/maxresdefault.jpg'
  },
  {
    id: 'cap5',
    title: 'Capítulo 5 - Gestión de Pruebas',
    description: 'Planificación, estimación, monitoreo y control de actividades de testing en proyectos reales.',
    videoId: 'dZ0GaiBm8wM',
    duration: '',
    chapter: 5,
    thumbnail: 'https://img.youtube.com/vi/dZ0GaiBm8wM/maxresdefault.jpg'
  },
  {
    id: 'cap6',
    title: 'Capítulo 6 - Herramientas del Tester',
    description: 'Herramientas esenciales para el testing moderno: gestión de pruebas, automatización y performance.',
    videoId: 'lnf-zlxqu3E',
    duration: '',
    chapter: 6,
    isNew: true,
    thumbnail: 'https://img.youtube.com/vi/lnf-zlxqu3E/maxresdefault.jpg'
  },
];

export default function YouTubeSection() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  return (
    <section className={`py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            📺 {t('youtube.title')}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto mb-6 ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            {t('youtube.subtitle')}
          </p>
          <a
            href="https://www.youtube.com/@aiquaa/videos"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isDarkMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            {t('youtube.subscribe')}
          </a>
        </div>

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-gray-50 hover:shadow-xl'
              }`}
            >
              {/* Video Thumbnail */}
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative group"
              >
                <div className={`aspect-video relative ${
                  isDarkMode ? 'bg-slate-600' : 'bg-gray-200'
                }`}>
                  {/* YouTube thumbnail */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`; }}
                  />

                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {video.isNew && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {t('youtube.new')}
                      </span>
                    )}
                    {video.chapter && (
                      <span className={`text-white text-xs px-2 py-1 rounded-full font-semibold ${
                        isDarkMode ? 'bg-slate-800/90' : 'bg-gray-900/90'
                      }`}>
                        {t('youtube.chapter')} {video.chapter}
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2">
                      <span className="bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                  )}
                </div>
              </a>

              {/* Video Info */}
              <div className="p-4">
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block mb-2 hover:underline`}
                >
                  <h3 className={`font-bold line-clamp-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    {video.title}
                  </h3>
                </a>
                <p className={`text-sm line-clamp-2 ${
                  isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                }`}>
                  {video.description}
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 mt-3 text-sm font-semibold transition-colors ${
                    isDarkMode
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  {t('youtube.watch')} →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Full Playlist */}
        <div className="text-center mt-10">
          <a
            href="https://www.youtube.com/@aiquaa/videos"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-brand-dark hover:bg-brand-dark/90 text-white'
            }`}
          >
            {t('youtube.playlist')} →
          </a>
        </div>
      </div>
    </section>
  );
}
