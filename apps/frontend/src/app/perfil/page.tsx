'use client';

import React, { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { updateProfileAction, uploadAvatarAction } from '@/actions/profile';
import Avatar from '@/components/ui/Avatar';

export default function PerfilPage() {
  const { user, isLoading } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
  });
  const [initialized, setInitialized] = useState(false);

  // Initialize form from user metadata once loaded
  React.useEffect(() => {
    if (!isLoading && user && !initialized) {
      setFormData({
        full_name: user.user_metadata?.full_name || '',
        username: user.user_metadata?.username || '',
        bio: user.user_metadata?.bio || '',
      });
      setInitialized(true);
    }
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, initialized, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', msg: 'El archivo debe pesar menos de 5MB' });
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setAlert(null);
    const fd = new FormData();
    fd.set('avatar', file);
    const result = await uploadAvatarAction(fd);
    setIsUploading(false);
    if (result.error) {
      setAlert({ type: 'error', msg: result.error });
      setPreviewUrl(null);
    } else {
      setAlert({ type: 'success', msg: 'Foto actualizada correctamente' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    const fd = new FormData();
    fd.set('full_name', formData.full_name);
    fd.set('username', formData.username);
    fd.set('bio', formData.bio);
    startTransition(async () => {
      const result = await updateProfileAction(fd);
      if (result.error) {
        setAlert({ type: 'error', msg: result.error });
      } else {
        setAlert({ type: 'success', msg: 'Perfil guardado correctamente' });
      }
    });
  };

  const card = isDarkMode
    ? 'bg-slate-800 border border-slate-700'
    : 'bg-white border border-gray-200 shadow-sm';
  const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const currentAvatarUrl = previewUrl || user?.user_metadata?.avatar_url || null;

  if (isLoading || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-10 px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mi Perfil</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Completá tu información para que la comunidad te conozca
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${
            alert.type === 'success'
              ? isDarkMode ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isDarkMode ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span>{alert.type === 'success' ? '✅' : '❌'} {alert.msg}</span>
            <button onClick={() => setAlert(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Avatar Card */}
        <div className={`${card} rounded-xl p-6`}>
          <h2 className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Foto de perfil
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                name={formData.full_name || user.user_metadata?.full_name}
                email={user.email}
                avatarUrl={currentAvatarUrl}
                size="xl"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Subiendo...' : '📷 Cambiar foto'}
              </button>
              <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                JPG, PNG o GIF · Máx 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className={`${card} rounded-xl p-6 space-y-5`}>
          <h2 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Información personal
          </h2>

          {/* Email (read-only) */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="text"
              value={user.email || ''}
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              El email no se puede cambiar desde aquí
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Tu nombre completo"
              className={inputClass}
              maxLength={60}
            />
          </div>

          {/* Username */}
          <div>
            <label className={labelClass}>Nombre de usuario</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                @
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                placeholder="tu_usuario"
                className={`${inputClass} pl-7`}
                maxLength={30}
              />
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              Solo letras, números y guión bajo
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
              placeholder="Contale a la comunidad sobre vos — tu experiencia en QA, herramientas favoritas..."
              rows={3}
              maxLength={200}
              className={`${inputClass} resize-none`}
            />
            <p className={`text-xs mt-1 text-right ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              {formData.bio.length}/200
            </p>
          </div>

          {/* Member since */}
          <div className={`text-xs pt-2 border-t ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-100 text-gray-400'}`}>
            Miembro desde{' '}
            {new Date(user.created_at).toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </form>

      </div>
    </div>
  );
}
