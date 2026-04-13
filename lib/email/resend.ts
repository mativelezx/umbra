export type EmailResult =
  | { sent: true; provider: 'resend' }
  | { sent: false; reason: 'dev_fallback'; devLink: string };

export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailConfigError';
  }
}

export class EmailSendError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'EmailSendError';
  }
}

interface DeleteConfirmationParams {
  to: string;
  magicLink: string;
  expiresAt: string;
}

function ttlMinutes(expiresAt: string): number {
  return Math.max(
    1,
    Math.round((new Date(expiresAt).getTime() - Date.now()) / 60_000),
  );
}

function renderDeleteConfirmationHtml({ magicLink, expiresAt }: DeleteConfirmationParams): string {
  return `<!DOCTYPE html>
<html lang="es">
  <body style="font-family: -apple-system, Segoe UI, Arial, sans-serif; background: #0c0a1a; color: #e8e6f0; padding: 32px; margin: 0;">
    <div style="max-width: 560px; margin: 0 auto; background: #13102a; border: 1px solid #2a234a; border-radius: 12px; padding: 32px;">
      <h1 style="font-family: Georgia, serif; font-style: italic; font-size: 28px; margin: 0 0 8px;">Umbra</h1>
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a82a8; margin: 0 0 24px;">Confirmación de eliminación</p>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">Pediste eliminar tu cuenta de Umbra. Esta acción es irreversible: borra tu perfil psicológico, narrativa, conversaciones, plan y carta al futuro.</p>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Si confirmás, hacé click en el siguiente link. Vence en ${ttlMinutes(expiresAt)} minutos y solo se puede usar una vez.</p>
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
  return `Umbra — confirmación de eliminación

Pediste eliminar tu cuenta de Umbra. Esta acción es irreversible: borra tu perfil, narrativa, conversaciones, plan y carta al futuro.

Confirmá haciendo click acá (vence en ${ttlMinutes(expiresAt)} min, un solo uso):
${magicLink}

Si no pediste esto, ignorá este mensaje.

Umbra no es terapia. Si estás en crisis: 135 (Argentina) · 911
`;
}

/**
 * Send the delete-confirmation magic link.
 *
 * Three paths:
 *  1. prod + RESEND_API_KEY set + EMAIL_FROM set → real Resend call, 2xx = sent.
 *  2. dev (NODE_ENV !== 'production') + no RESEND_API_KEY → dev fallback,
 *     returns the magic link inline so the developer can complete the flow.
 *  3. prod + missing RESEND_API_KEY or EMAIL_FROM → EmailConfigError (hard fail).
 *     We refuse to silently fake success in production, and we refuse to leak
 *     tokens via inline UI in production.
 *
 * Callers should translate EmailConfigError → 503 "email_not_configured"
 * and EmailSendError → 502 "email_send_failed" so the user can retry
 * without the token being burned.
 */
export async function sendDeleteConfirmationEmail(
  params: DeleteConfirmationParams,
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (!apiKey) {
    if (isProd) {
      throw new EmailConfigError(
        'RESEND_API_KEY is not configured. Set RESEND_API_KEY (and EMAIL_FROM) in production so delete confirmation emails can be delivered.',
      );
    }
    return { sent: false, reason: 'dev_fallback', devLink: params.magicLink };
  }

  if (!from) {
    throw new EmailConfigError(
      'EMAIL_FROM is not configured. Resend requires a verified sender address. Set EMAIL_FROM to an address on a domain verified in Resend.',
    );
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
    throw new EmailSendError(`Resend returned ${res.status}: ${body}`, res.status);
  }

  return { sent: true, provider: 'resend' };
}
