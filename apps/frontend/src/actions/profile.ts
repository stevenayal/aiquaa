'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(formData: FormData) {
  const supabase = createClient();
  const fullName = (formData.get('full_name') as string)?.trim();
  const bio = (formData.get('bio') as string)?.trim();
  const username = (formData.get('username') as string)?.trim();
  const role = (formData.get('role') as string)?.trim();
  const country = (formData.get('country') as string)?.trim();
  const githubProfile = (formData.get('github_profile') as string)?.trim();
  const istqbLevel = (formData.get('istqb_level') as string)?.trim();
  const disponibilidadRaw = (formData.get('disponibilidad') as string)?.trim();
  const disponibilidad = (
    ['activo', 'pasivo', 'no_disponible'].includes(disponibilidadRaw)
      ? disponibilidadRaw
      : 'no_disponible'
  ) as 'activo' | 'pasivo' | 'no_disponible';
  const qaSkillsRaw = (formData.get('qa_skills') as string)?.trim();
  const qaSkills = (() => {
    try {
      const parsed = JSON.parse(qaSkillsRaw || '[]');
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  })();
  const openToWork = disponibilidad === 'activo';
  const talentVisibleToEmpresas =
    formData.get('talent_visible_to_empresas') === 'true';

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      bio,
      username,
      role,
      country,
      github_profile: githubProfile,
      istqb_level: istqbLevel,
      disponibilidad,
      qa_skills: qaSkills,
      open_to_work: openToWork,
      talent_visible_to_empresas: talentVisibleToEmpresas,
    },
  });

  if (error) return { error: error.message };

  // Sync to profiles table
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      display_name: fullName || username || null,
      email: user.email,
      role: role || null,
      country: country || null,
      istqb_level: istqbLevel || null,
      github_profile: githubProfile || null,
      disponibilidad,
      qa_skills: qaSkills,
      open_to_work: openToWork,
      talent_visible_to_empresas: talentVisibleToEmpresas,
    },
    { onConflict: 'id' }
  );

  revalidatePath('/perfil');
  return { success: true };
}

export async function changePasswordAction(formData: FormData) {
  const supabase = createClient();
  const newPassword = (formData.get('new_password') as string)?.trim();
  const confirmPassword = (formData.get('confirm_password') as string)?.trim();

  if (!newPassword || newPassword.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  revalidatePath('/perfil');
  return { success: true };
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const file = formData.get('avatar') as File;
  if (!file || file.size === 0) return { error: 'Archivo requerido' };
  if (file.size > 5 * 1024 * 1024)
    return { error: 'El archivo debe pesar menos de 5MB' };
  // Explicit raster-only allowlist (never `startsWith('image/')`): SVG can
  // embed <script>/onload and would pass a prefix check while bypassing the
  // client-side allowlist in perfil/page.tsx, since that check is trivially
  // skippable by posting to this action directly.
  const ALLOWED_AVATAR_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  if (!ALLOWED_AVATAR_TYPES.includes(file.type))
    return { error: 'Solo se permiten imágenes JPG, PNG, WebP o GIF' };

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  if (updateError) return { error: updateError.message };

  revalidatePath('/perfil');
  return { success: true, avatarUrl };
}
