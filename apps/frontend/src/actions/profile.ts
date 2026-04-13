'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(formData: FormData) {
  const supabase = createClient();
  const fullName = (formData.get('full_name') as string)?.trim();
  const bio = (formData.get('bio') as string)?.trim();
  const username = (formData.get('username') as string)?.trim();
  const role = (formData.get('role') as string)?.trim();

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName, bio, username, role },
  });

  if (error) return { error: error.message };

  revalidatePath('/perfil');
  return { success: true };
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const file = formData.get('avatar') as File;
  if (!file || file.size === 0) return { error: 'Archivo requerido' };
  if (file.size > 5 * 1024 * 1024) return { error: 'El archivo debe pesar menos de 5MB' };
  if (!file.type.startsWith('image/')) return { error: 'Solo se permiten imágenes' };

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  if (updateError) return { error: updateError.message };

  revalidatePath('/perfil');
  return { success: true, avatarUrl };
}
