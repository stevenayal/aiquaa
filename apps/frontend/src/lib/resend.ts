const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? 'AIQUAA <noreply@aiquaa.com>';

  if (!apiKey) {
    const error = 'RESEND_API_KEY not set';
    console.warn(`[resend] ${error} - email not sent`);
    return { error };
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      error: (body as { message?: string }).message ?? `HTTP ${res.status}`,
    };
  }

  return { error: null };
}
