import type { UmbraEmailContent, UmbraEmailKind, UmbraEmailOptions } from '@/types';

// Shared by actual Resend messages and the generated Supabase Auth templates.
// No questionnaire answers, profiles or model outputs belong in an email.
const COPY: Record<UmbraEmailKind, { subject: string; title: string; body: string; action?: string; note: string }> = {
  welcome: { subject:'umbra — tu cuenta está lista', title:'Tu cabeza,\nen palabras.', body:'Tu cuenta ya está creada. Podés empezar con una situación que te esté dando vueltas, responder las preguntas y elegir una actividad para llevarte a tu día.', action:'Empezar en umbra', note:'Podés ir a tu ritmo. El cuestionario adicional es opcional y vos elegís qué compartir.' },
  confirmation: { subject:'umbra — confirmá tu email y empezamos', title:'Un clic\ny empezamos.', body:'Te damos la bienvenida a umbra. Confirmá que este email es tuyo para entrar a tu cuenta y empezar con lo que te está pasando.', action:'Confirmar mi email', note:'Si no creaste esta cuenta, podés ignorar el mensaje. No hace falta que hagas nada.' },
  invite: { subject:'umbra — te invitaron a entrar', title:'Tenés una\ninvitación.', body:'Te invitaron a crear una cuenta en umbra: un lugar para poner en palabras lo que te pasa, leer otra perspectiva y elegir algo concreto para probar.', action:'Aceptar invitación', note:'Aceptar la invitación no implica aceptar el uso de tus datos para investigación. Esa decisión es aparte y siempre opcional.' },
  recovery: { subject:'umbra — recuperá el acceso a tu cuenta', title:'Creá una nueva\ncontraseña.', body:'Recibimos un pedido para restablecer la contraseña de tu cuenta. Este enlace te permite elegir una nueva y volver a entrar.', action:'Cambiar mi contraseña', note:'Si no lo pediste vos, ignorá este mensaje. Tu contraseña actual no cambia por recibirlo.' },
  magic_link: { subject:'umbra — tu enlace para entrar', title:'Volvé a\ntu espacio.', body:'Este es el enlace que pediste para entrar a umbra sin escribir tu contraseña. Usalo solamente vos y no lo reenvíes.', action:'Entrar a umbra', note:'El enlace es de un solo uso. Si vence, pedí uno nuevo desde la pantalla donde solicitaste el acceso.' },
  email_change: { subject:'umbra — confirmá el cambio de email', title:'Confirmemos\neste cambio.', body:'Se solicitó cambiar el email de tu cuenta. Confirmá la solicitud con el botón de abajo. Por seguridad, puede ser necesario confirmar desde ambas direcciones.', action:'Confirmar cambio de email', note:'Si no pediste este cambio, no lo confirmes. Revisá el acceso a tu cuenta.' },
  reauthentication: { subject:'umbra — tu código de verificación', title:'Un paso más\npor seguridad.', body:'Usá este código para confirmar que sos vos antes de continuar con la operación que solicitaste.', note:'No compartas este código. Umbra no te lo va a pedir por chat. Si no lo solicitaste, ignorá este mensaje.' },
  password_changed: { subject:'umbra — cambió tu contraseña', title:'Tu contraseña\nfue actualizada.', body:'La contraseña de tu cuenta acaba de cambiar. Si lo hiciste vos, no necesitás hacer nada más.', action:'Revisar el acceso a mi cuenta', note:'Si no reconocés este cambio, restablecé la contraseña desde la pantalla de acceso.' },
  email_changed: { subject:'umbra — cambió el email de tu cuenta', title:'Tu email\nfue actualizado.', body:'Se completó un cambio de email en tu cuenta de umbra. Este mensaje te permite revisar que haya sido una decisión tuya.', action:'Revisar el acceso a mi cuenta', note:'Si no reconocés este cambio, revisá de inmediato el acceso a tu cuenta. No respondas con contraseñas ni códigos.' },
  delete_confirmation: { subject:'umbra — confirmá la eliminación de tu cuenta', title:'Antes de\ndespedirnos.', body:'Pediste eliminar tu cuenta. Al confirmar se borrarán tu perfil, lectura, conversaciones, actividades y carta al futuro. Esta acción no se puede deshacer.', action:'Revisar y confirmar eliminación', note:'Si no pediste eliminar tu cuenta, ignorá el mensaje. Abrir el enlace muestra una pantalla de confirmación; no borra nada por sí solo.' },
};

export const EMAIL_KINDS = Object.keys(COPY) as UmbraEmailKind[];
export const emailSubject = (kind: UmbraEmailKind): string => COPY[kind].subject;
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]!));

function checkedUrl(value: string): string {
  // Exact Go-template variables only; never interpolate arbitrary template code.
  if (['{{ .ConfirmationURL }}','{{ .SiteURL }}','{{ .SiteURL }}/login','{{ .SiteURL }}/forgot-password'].includes(value)) return value;
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Invalid email URL');
  return value.replace(/\/$/, '');
}

export function renderUmbraEmail(options: UmbraEmailOptions): UmbraEmailContent {
  const copy = COPY[options.kind];
  const site = checkedUrl(options.siteUrl);
  const action = options.actionUrl ? checkedUrl(options.actionUrl) : `${site}/login`;
  const logo = `${site}/brand/email-lockup.png`;
  const stamp = `${site}/brand/email-aperture.png`;
  const isWelcome = options.kind === 'welcome' || options.kind === 'confirmation';
  let expiry = '';
  if (options.expiresAt) {
    const remaining = new Date(options.expiresAt).getTime() - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) throw new Error('Email link already expired');
    expiry = `El enlace vence en ${Math.max(1, Math.ceil(remaining/60000))} minutos y se puede usar una sola vez.`;
  }
  const code = options.kind === 'reauthentication' ? options.code : undefined;
  if (options.kind === 'reauthentication' && !code) throw new Error('Verification code required');
  const preview = options.preview ? '<p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#53534f">Vista de diseño con datos ficticios. Los botones no realizan operaciones sobre una cuenta.</p>' : '';
  const codeBlock = code ? `<div style="margin:28px 0;padding:24px;background:#f0f0eb;text-align:center;font-size:34px;font-weight:700;letter-spacing:6px;color:#242424">${escapeHtml(code)}</div>` : '';
  const cta = copy.action ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;width:100%"><tr><td align="left"><a href="${escapeHtml(action)}" style="display:inline-block;background:#242424;color:#ffffff;border:1px solid #242424;border-radius:8px;padding:17px 24px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;font-weight:700;text-align:center">${escapeHtml(copy.action)}</a></td></tr></table>` : '';
  const steps = isWelcome ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 8px;border-top:1px solid #deded8">${[
    ['1','Contá una situación.','Podés responder preguntas o escribir con tus palabras.'],
    ['2','Leé otra perspectiva.','Una lectura orientativa, con sus fuentes y límites a la vista.'],
    ['3','Elegí qué probar.','Guardá una actividad y volvé cuando quieras.'],
  ].map(([n,title,body])=>`<tr><td width="34" valign="top" style="padding:20px 0 0;color:#53534f;font-family:Georgia,serif;font-size:24px">${n}</td><td style="padding:20px 0 0"><strong style="font-size:16px;color:#242424">${title}</strong><p style="margin:5px 0 0;color:#53534f;font-size:14px;line-height:1.6">${body}</p></td></tr>`).join('')}</table>` : '';
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(copy.subject)}</title><style>@media(max-width:620px){.outer{padding:12px!important}.pad{padding:28px 24px!important}.headline{font-size:36px!important}.brand{width:156px!important;height:auto!important}.stamp{width:58px!important;height:58px!important}}a:focus-visible{outline:3px solid #805720;outline-offset:4px}</style></head><body style="margin:0;padding:0;background:#f0f0eb;color:#242424;font-family:Arial,Helvetica,sans-serif">
<!-- THESIS: Umbra account mail, one clear action. OWN-WORLD: original aperture and outlined lowercase logo, graphite and paper. STORY: understand the event and act safely. FIRST VIEWPORT: 600px letter, black brand field, large headline, readable body and action. FORM: incumbent identity extension, no new visual world. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${escapeHtml(copy.body)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="outer" align="center" style="padding:32px 16px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff">
<tr><td class="pad" bgcolor="#171a18" style="padding:36px 40px;background:#171a18;color:#f7f7f4"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td><img class="brand" src="${escapeHtml(logo)}" alt="umbra" width="180" height="42" style="display:block;border:0;color:#fff;font-family:Georgia,serif;font-size:32px"></td><td align="right"><img class="stamp" src="${escapeHtml(stamp)}" width="72" height="72" alt="" style="display:block;border:0"></td></tr></table><h1 class="headline" style="margin:36px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:44px;font-weight:400;line-height:1.13;letter-spacing:-1px;color:#f7f7f4">${escapeHtml(copy.title).replace(/\n/g,'<br>')}</h1></td></tr>
<tr><td class="pad" style="padding:34px 40px 36px">${preview}<p style="margin:0;font-size:17px;line-height:1.75;color:#242424">${escapeHtml(copy.body)}</p>${codeBlock}${cta}${expiry ? `<p style="margin:0 0 20px;color:#53534f;font-size:14px;line-height:1.6">${escapeHtml(expiry)}</p>`:''}<p style="margin:0;color:#53534f;font-size:14px;line-height:1.7">${escapeHtml(copy.note)}</p>${steps}${copy.action ? `<p style="margin:28px 0 0;padding-top:22px;border-top:1px solid #deded8;font-size:12px;line-height:1.7;color:#62625c">Si el botón no abre, copiá este enlace en el navegador:<br><a href="${escapeHtml(action)}" style="color:#53534f;word-break:break-all;overflow-wrap:anywhere;text-decoration:underline">${escapeHtml(action)}</a></p>`:''}</td></tr>
<tr><td class="pad" style="padding:26px 40px;background:#f7f7f4;color:#53534f"><p style="margin:0 0 10px;font-size:13px;line-height:1.7">Autoconocimiento, con tus propias palabras.<br>Umbra no es terapia ni ofrece diagnósticos.</p><p style="margin:0;font-size:12px;line-height:1.8"><a href="${escapeHtml(site)}/privacy" style="color:#53534f;text-decoration:underline">Privacidad</a> &nbsp;·&nbsp; <a href="${escapeHtml(site)}/terms" style="color:#53534f;text-decoration:underline">Términos de uso</a></p></td></tr>
</table></td></tr></table></body></html>`;
  const text = [options.preview ? 'VISTA DE DISEÑO. Datos ficticios; no realiza operaciones.' : '', 'umbra', copy.title.replace('\n',' '), copy.body, code ? `Código: ${code}` : '', copy.action ? `${copy.action}: ${action}` : '', expiry, copy.note, isWelcome ? '1. Contá una situación.\n2. Leé otra perspectiva.\n3. Elegí qué probar.' : '', 'Umbra no es terapia ni ofrece diagnósticos.', `Privacidad: ${site}/privacy`, `Términos: ${site}/terms`].filter(Boolean).join('\n\n');
  return {subject:copy.subject,html,text};
}
