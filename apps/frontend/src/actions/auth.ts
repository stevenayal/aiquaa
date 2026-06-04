'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  const audience = data.user?.user_metadata?.audience;
  redirect(audience === 'empresa' ? '/empresa' : '/ranking?welcome=1');
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const audience = (formData.get('audience') as string) || 'candidato';
  const companyName = formData.get('companyName') as string | null;
  const ruc = formData.get('ruc') as string | null;
  const selectedRole = formData.get('role') as string | null;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        audience,
        ...(audience === 'empresa' && companyName
          ? { company_name: companyName }
          : {}),
        ...(audience === 'empresa' && ruc ? { ruc: ruc.trim() } : {}),
        ...(selectedRole && ['comunidad', 'admin'].includes(selectedRole)
          ? { role: selectedRole }
          : {}),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL}/auth/confirm`,
    },
  });

  if (error) {
    if (
      error.message.toLowerCase().includes('database error saving new user')
    ) {
      return {
        error:
          'No se pudo completar el registro por una regla interna de la base de datos. Contactá soporte o intentá nuevamente en unos minutos.',
      };
    }
    return { error: error.message };
  }

  return {
    success: true,
    message: 'Revisá tu email para confirmar tu cuenta.',
  };
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
  if (error) return { error: error.message };
  return { success: true };
}

export async function checkEmailTakenAction(email: string): Promise<{ taken: boolean }> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserByEmail(email);
    return { taken: !!data.user };
  } catch {
    return { taken: false };
  }
}

export async function forgotPasswordAction(email: string) {
  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://aiquaa.com';
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
