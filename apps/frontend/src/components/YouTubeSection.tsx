'use client';

import Link from 'next/link';
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
    id: 'istqb-intro',
    title: 'ISTQB Foundation Level - Introducción',
    description: 'Introducción completa al ISTQB CTFL v4.0. Aprende los conceptos fundamentales del testing de software.',
    videoId: 'YOUR_VIDEO_ID_1', // Reemplazar con ID real del video
    duration: '15:30',
    chapter: 1,
    isNew: true,
    thumbnail: 'https://img.youtube.com/vi/YOUR_VIDEO_ID_1/maxresdefault.jpg'
  },
  {
    id: 'jmeter-basics',
    title: 'Apache JMeter - Primeros Pasos',
    description: 'Aprende a crear tu primer test de performance con JMeter. Configuración básica y elementos principales.',
    videoId: 'YOUR_VIDEO_ID_2',
    duration: '22:45',
    chapter: 2,
    isNew: true,
    thumbnail: 'https://img.youtube.com/vi/YOUR_VIDEO_ID_2/maxresdefault.jpg'
  },
  {
    id: 'testing-fundamentals',
    title: 'Fundamentos de Testing de Software',
    description: 'Los 7 principios del testing, niveles de prueba y técnicas fundamentales que todo tester debe conocer.',
    videoId: 'YOUR_VIDEO_ID_3',
    duration: '18:20',
    chapter: 3,
    thumbnail: 'https://img.youtube.com/vi/YOUR_VIDEO_ID_3/maxresdefault.jpg'
  },
  {
    id: 'automation-intro',
    title: 'Introducción a la Automatización de Pruebas',
    description: 'Cuándo automatizar, qué automatizar y herramientas esenciales para comenzar en la automatización.',
    videoId: 'YOUR_VIDEO_ID_4',
    duration: '20:15',
    chapter: 4,
    thumbnail: 'https://img.youtube.com/vi/YOUR_VIDEO_ID_4/maxresdefault.jpg'
  }
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  {/* Placeholder for thumbnail - replace with actual YouTube thumbnail */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className={`w-16 h-16 ${
                      isDarkMode ? 'text-slate-500' : 'text-gray-400'
                    }`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>

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
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </span>
                  </div>
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
