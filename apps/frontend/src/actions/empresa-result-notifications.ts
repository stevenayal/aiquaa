'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/resend';

type ResultNotificationInput = {
  processCode?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  examType: string;
  percentage: number;
  passed: boolean;
};

function formatExamType(examType: string) {
  return examType
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function notifyEmpresaExamCompleted(
  input: ResultNotificationInput
) {
  if (!input.processCode?.trim()) return;

  try {
    const supabase = createAdminClient();
    const { data: processRow } = await supabase
      .from('hiring_processes')
      .select(
        'id, empresa_id, position_name, code, empresas(razon_social, nombre_comercial)'
      )
      .ilike('code', input.processCode.trim())
      .maybeSingle();

    if (!processRow?.empresa_id) return;

    const { data: members } = await supabase
      .from('empresa_miembros')
      .select('profiles(email, display_name)')
      .eq('empresa_id', processRow.empresa_id)
      .eq('status', 'active')
      .in('role', ['owner', 'admin']);

    const recipients = (members ?? [])
      .map((member: any) => member.profiles?.email)
      .filter((email: unknown): email is string => typeof email === 'string');

    if (recipients.length === 0) return;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiquaa.com';
    const processUrl = `${siteUrl}/empresa/procesos/${processRow.id}`;
    const empresa = processRow.empresas as {
      razon_social?: string | null;
      nombre_comercial?: string | null;
    } | null;
    const empresaName =
      empresa?.nombre_comercial || empresa?.razon_social || 'AIQUAA';
    const candidateName =
      input.candidateName || input.candidateEmail || 'Un candidato';
    const resultLabel = input.passed ? 'aprobado' : 'no aprobado';
    const subject = `${candidateName} completo ${formatExamType(input.examType)} (${Math.round(input.percentage)}%)`;
    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
    <p style="color:#6b7280;font-size:13px;margin:0 0 8px">${empresaName}</p>
    <h2 style="margin:0 0 12px;font-size:20px;color:#111827">Nuevo resultado disponible</h2>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px">
      <strong>${candidateName}</strong> completo <strong>${formatExamType(input.examType)}</strong>
      para el proceso <strong>${processRow.position_name}</strong>.
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px">
      Resultado: <strong>${Math.round(input.percentage)}%</strong> (${resultLabel}).
    </p>
    <a href="${processUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px">
      Ver proceso
    </a>
  </div>
</body>
</html>`;

    await Promise.all(
      Array.from(new Set(recipients)).map((recipient) =>
        sendEmail(recipient, subject, html)
      )
    );
  } catch (error) {
    console.warn('[empresa-result-notifications] email failed', error);
  }
}
