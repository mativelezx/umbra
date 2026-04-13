export type EmailResult =
  | { sent: true; provider: 'resend' }
  | { sent: false; reason: 'no_api_key'; devLink?: string };

interface DeleteConfirmationParams {
  to: string;
  magicLink: string;
  expiresAt: string;
}

function renderDeleteConfirmationHtml({ magicLink, expiresAt }: DeleteConfirmationParams): string {
  const ttlMinutes = Math.max(
    1,
    Math.round((new Date(expiresAt).getTime() - Date.now()) / 60_000),
  );
  return `<!DOCTYPE html>
<html lang="es">
  <body style="font-family: -apple-system, Segoe UI, Arial, sans-serif; background: #0c0a1a; color: #e8e6f0; padding: 32px; margin: 0;">
    <div style="max-width: 560px; margin: 0 auto; background: #13102a; border: 1px solid #2a234a; border-radius: 12px; padding: 32px;">
      <h1 style="font-family: Georgia, serif; font-style: italic; font-size: 28px; margin: 0 0 8px;">Umbra</h1>
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a82a8; margin: 0 0 24px;">Confirmación de eliminación</p>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">Pediste eliminar tu cuenta de Umbra. Esta acción es irreversible: borra tu perfil psicológico, narrativa, conversaciones, plan y carta al futuro.</p>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Si confirmás, hacé click en el siguiente link. Vence en ${ttlMinutes} minutos y solo se puede usar una vez.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${magicLink}" style="display: inline-block; background: #b466ff; color: #0c0a1a; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">Confirmar eliminación</a>
      </div>
      <p style="font-size: 13px; color: #8a82a8; line-height: 1.6; margin: 24px 0 0;">Si no pediste esto, ignorá este mensaje. Nada se borra sin que toques el link.</p>
      <hr style="border: none; border-top: 1px solid #2a234a; margin: 24px 0;" />
      <p style="font-size: 11px; color: #6b6490; margin: 0;">Umbra no es terapia. Si estás en crisis: 135 (Argentina) · 911</p>
    </div>
  </body>
</html>`;
}

function renderDeleteConfirmationText({ magicLink, expiresAt }: DeleteConfirmationParams): string {
  const ttlMinutes = Math.max(
    1,
    Math.round((new Date(expiresAt).getTime() - Date.now()) / 60_000),
  );
  return `Umbra — confirmación de eliminación

Pediste eliminar tu cuenta de Umbra. Esta acción es irreversible: borra tu perfil, narrativa, conversaciones, plan y carta al futuro.

Confirmá haciendo click acá (vence en ${ttlMinutes} min, un solo uso):
${magicLink}

Si no pediste esto, ignorá este mensaje.

Umbra no es terapia. Si estás en crisis: 135 (Argentina) · 911
`;
}

export async function sendDeleteConfirmationEmail(
  params: DeleteConfirmationParams,
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'umbra@localhost';

  if (!apiKey) {
    return {
      sent: false,
      reason: 'no_api_key',
      devLink: process.env.NODE_ENV !== 'production' ? params.magicLink : undefined,
    };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: 'Umbra — confirmá la eliminación de tu cuenta',
      html: renderDeleteConfirmationHtml(params),
      text: renderDeleteConfirmationText(params),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend failed: ${res.status} ${body}`);
  }

  return { sent: true, provider: 'resend' };
}
