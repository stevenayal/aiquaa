'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

/**
 * Sends a confirmation email via Resend.
 * Uses a plain fetch so we don't need to add the resend package to the frontend.
 */
async function sendConfirmationEmail(
  email: string,
  name: string,
  confirmationLink: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL || 'AIQUAA <noreply@aiquaa.com>';

  if (!apiKey) {
    // Fallback: if Resend is not configured we can't do anything here — log and continue.
    // The user can still receive the link via the Supabase dashboard resend feature.
    console.error('[registerAction] RESEND_API_KEY not set — confirmation email not sent');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family:sans-serif;background:#f9fafb;padding:32px;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <h1 style="margin:0 0 8px;font-size:24px;color:#1e293b;">Hola, ${name} 👋</h1>
          <p style="color:#475569;margin:0 0 24px;">
            Gracias por registrarte en <strong>AIQUAA</strong>. Hacé click en el botón para confirmar tu cuenta.
          </p>
          <a href="${confirmationLink}"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
            Confirmar mi cuenta
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
            Si no creaste esta cuenta podés ignorar este correo.<br/>
            El enlace expira en 24 horas.
          </p>
        </div>
      </body>
    </html>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Confirmá tu cuenta de AIQUAA',
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[registerAction] Resend error:', res.status, body);
    throw new Error('No se pudo enviar el email de confirmación. Intentá de nuevo.');
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    'https://aiquaa.com';

  const adminClient = createAdminClient();

  // Generate a confirmation link via the admin API.
  // This creates the user WITHOUT triggering Supabase's own email sending,
  // so we never hit the Supabase email rate limit.
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: { full_name: name, role },
      redirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  const confirmationLink = data.properties?.action_link;
  if (!confirmationLink) {
    return { error: 'No se pudo generar el link de confirmación. Intentá de nuevo.' };
  }

  try {
    await sendConfirmationEmail(email, name, confirmationLink);
  } catch (emailError) {
    // User was created but email failed — clean up the Supabase user so they can retry.
    await adminClient.auth.admin.deleteUser(data.user.id).catch(() => {});
    return {
      error:
        emailError instanceof Error
          ? emailError.message
          : 'Error al enviar el email de confirmación.',
    };
  }

  return { success: true, message: 'Revisá tu email para confirmar tu cuenta.' };
}

export async function resendConfirmationAction(email: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    'https://aiquaa.com';

  const adminClient = createAdminClient();

  // Look up the existing unconfirmed user and regenerate the link.
  const { data: listData, error: listError } =
    await adminClient.auth.admin.listUsers();

  if (listError) {
    return { error: listError.message };
  }

  const existingUser = listData.users.find(
    (u) => u.email === email && !u.email_confirmed_at
  );

  if (!existingUser) {
    // Already confirmed or doesn't exist — silently succeed to avoid enumeration.
    return { success: true };
  }

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'signup',
    email,
    // generateLink for an existing user requires the password — use a dummy
    // value here; Supabase only updates the link, not the password, when
    // the user already exists.
    password: crypto.randomUUID(),
    options: {
      redirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  const confirmationLink = data.properties?.action_link;
  if (!confirmationLink) {
    return { error: 'No se pudo generar el link de confirmación.' };
  }

  try {
    await sendConfirmationEmail(email, existingUser.user_metadata?.full_name ?? email, confirmationLink);
  } catch {
    return { error: 'Error al reenviar el email.' };
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
