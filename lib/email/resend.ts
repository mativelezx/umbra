import { renderUmbraEmail } from './templates';
import type { UmbraEmailContent } from '@/types';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type EmailResult = { sent: true; provider: 'resend' } | { sent: false; reason: 'dev_fallback'; devLink: string };
export class EmailConfigError extends Error {
  constructor(message: string) { super(message); this.name = 'EmailConfigError'; }
}
export class EmailSendError extends Error {
  constructor(message: string, public readonly status?: number) { super(message); this.name = 'EmailSendError'; }
}

async function deliver(to: string, content: UmbraEmailContent, idempotencyKey?: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) throw new EmailConfigError('Configure RESEND_API_KEY and EMAIL_FROM privately.');
  const attachments = await Promise.all(['email-lockup','email-aperture'].map(async name => ({
    filename:`${name}.png`, content_type:'image/png', content_id:name,
    content:(await readFile(join(process.cwd(),'public','brand',`${name}.png`))).toString('base64'),
  })));
  const html=content.html.replace(/src="[^"]*\/brand\/(email-lockup|email-aperture)\.png"/g,'src="cid:$1"');
  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ Authorization:`Bearer ${apiKey}`, 'Content-Type':'application/json', ...(idempotencyKey ? {'Idempotency-Key':idempotencyKey} : {}) },
      body:JSON.stringify({from,to,...content,html,attachments}),
    });
  } catch { throw new EmailSendError('Email provider could not be reached.'); }
  // Never log provider bodies: they can repeat recipient addresses or URLs.
  if (!response.ok) throw new EmailSendError(`Email provider returned ${response.status}.`, response.status);
}

/** Production never leaks a deletion token as an inline development fallback. */
export async function sendDeleteConfirmationEmail(params: {to:string; magicLink:string; expiresAt:string}): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY?.trim() && process.env.NODE_ENV !== 'production') {
    return {sent:false,reason:'dev_fallback',devLink:params.magicLink};
  }
  const content = renderUmbraEmail({kind:'delete_confirmation',siteUrl:new URL(params.magicLink).origin,actionUrl:params.magicLink,expiresAt:params.expiresAt});
  await deliver(params.to,content);
  return {sent:true,provider:'resend'};
}

/** Only the fresh-account endpoint calls this; retries share one provider key. */
export async function sendWelcomeEmail(params: {to:string; siteUrl:string; idempotencyKey:string}): Promise<void> {
  const content=renderUmbraEmail({kind:'welcome',siteUrl:params.siteUrl,actionUrl:`${params.siteUrl}/onboarding`});
  await deliver(params.to,content,params.idempotencyKey);
}
