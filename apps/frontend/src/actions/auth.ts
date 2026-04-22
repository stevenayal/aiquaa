'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect('/forum');
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string | null;
  // NOTE: Evitamos enviar `role` en user_metadata porque algunos proyectos
  // tienen triggers/constraints en auth.users que solo aceptan ciertos valores
  // y terminan rompiendo el signup con "Database error saving new user".
  // El rol puede persistirse luego en una tabla de perfil propia.
  const selectedRole = formData.get('role') as string | null;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    ...(phone ? { phone } : {}),
    options: {
      data: {
        full_name: name,
        // Solo enviamos role si es un valor seguro y compatible con triggers comunes
        ...(selectedRole && ['comunidad', 'admin'].includes(selectedRole) ? { role: selectedRole } : {}),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL}/auth/confirm`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('database error saving new user')) {
      return { error: 'No se pudo completar el registro por una regla interna de la base de datos. Contactá soporte o intentá nuevamente en unos minutos.' };
    }
    return { error: error.message };
  }

  return { success: true, message: 'Revisá tu email para confirmar tu cuenta.' };
}

export async function resendConfirmationAction(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL}/auth/confirm`,
    },
  });
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function forgotPasswordAction(email: string) {
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || '';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/auth/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
