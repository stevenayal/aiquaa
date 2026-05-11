import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    ruc: string | null;
    razon_social: string;
    nombre_comercial: string | null;
    created_at: string;
  };
  old_record: null | Record<string, unknown>;
}

serve(async (req: Request) => {
  // Verificar webhook secret para evitar llamadas no autorizadas
  const secret = Deno.env.get('WEBHOOK_SECRET');
  if (secret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${secret}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const payload: WebhookPayload = await req.json();

  if (payload.type !== 'INSERT' || payload.table !== 'empresas') {
    return new Response('Ignored', { status: 200 });
  }

  const { ruc, razon_social, nombre_comercial, created_at } = payload.record;
  const companyName = nombre_comercial || razon_social;

  const registeredAt = new Date(created_at).toLocaleString('es-PY', {
    timeZone: 'America/Asuncion',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'admin@aiquaa.com';
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    console.error('RESEND_API_KEY no configurada');
    return new Response('Missing RESEND_API_KEY', { status: 500 });
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nueva empresa — AIQUAA</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10B981); color: white; padding: 28px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #fff; padding: 36px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,.08); }
        .field { margin-bottom: 14px; padding: 12px 16px; background: #F9FAFB; border-radius: 8px; border-left: 4px solid #10B981; }
        .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #6B7280; margin-bottom: 2px; }
        .value { font-size: 15px; font-weight: 500; color: #111827; }
        .footer { text-align: center; margin-top: 28px; color: #9CA3AF; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;font-size:22px;">🏢 Nueva empresa registrada</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:.9;">AIQUAA — notificación automática</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Empresa</div>
            <div class="value">${companyName}</div>
          </div>
          ${ruc ? `<div class="field"><div class="label">RUC</div><div class="value">${ruc}</div></div>` : ''}
          <div class="field">
            <div class="label">Fecha de registro</div>
            <div class="value">${registeredAt}</div>
          </div>
        </div>
        <div class="footer">
          <p>Notificación automática · AIQUAA</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AIQUAA <noreply@aiquaa.com>',
      to: [adminEmail],
      subject: `🏢 Nueva empresa: ${companyName}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Error Resend:', err);
    return new Response('Email error', { status: 500 });
  }

  console.log(`Alerta enviada a ${adminEmail} — empresa: ${companyName}`);
  return new Response('OK', { status: 200 });
});
