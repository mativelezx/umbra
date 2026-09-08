import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { EMAIL_KINDS, renderUmbraEmail } from './templates';
import { sendDeleteConfirmationEmail, sendWelcomeEmail } from './resend';

afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('Umbra email identity and contracts',()=>{
  it.each(EMAIL_KINDS)('%s contains an accessible branded HTML and plain-text message',kind=>{
    const content=renderUmbraEmail({kind,siteUrl:'https://umbra.example',actionUrl:'https://umbra.example/action?token=qa&next=read',code:'123456',expiresAt:new Date(Date.now()+300000).toISOString()});
    expect(content.subject.startsWith('umbra —')).toBe(true);
    expect(content.html).toContain('alt="umbra"');expect(content.html).toContain('lang="es"');
    expect(content.html).not.toMatch(/<script|<svg|data:image|b466ff/);
    expect(content.text).toContain('Umbra no es terapia');
    expect(Buffer.byteLength(content.html)).toBeLessThan(30000);
  });
  it('escapes a verification code and rejects unsafe action URLs',()=>{
    expect(renderUmbraEmail({kind:'reauthentication',siteUrl:'https://umbra.example',code:'<img src=x>'}).html).toContain('&lt;img src=x&gt;');
    expect(()=>renderUmbraEmail({kind:'welcome',siteUrl:'https://umbra.example',actionUrl:'javascript:alert(1)'})).toThrow('Invalid email URL');
  });
  it('notifications do not reference a confirmation variable their provider does not supply',()=>{
    for(const kind of ['password_changed','email_changed']) expect(readFileSync(`supabase/templates/${kind}.html`,'utf8')).not.toContain('{{ .ConfirmationURL }}');
  });
  it('does not expose the deletion token as a fallback in production',async()=>{
    vi.stubEnv('NODE_ENV','production');vi.stubEnv('RESEND_API_KEY','');
    await expect(sendDeleteConfirmationEmail({to:'qa@example.com',magicLink:'https://umbra.example/settings/delete/confirm?token=qa',expiresAt:new Date(Date.now()+300000).toISOString()})).rejects.toThrow('Configure');
  });
  it('sends the welcome with inline brand assets and an idempotency key',async()=>{
    vi.stubEnv('RESEND_API_KEY','synthetic-not-a-real-key');vi.stubEnv('EMAIL_FROM','umbra <onboarding@resend.dev>');
    const fetchMock=vi.fn().mockResolvedValue(new Response('{}',{status:200}));vi.stubGlobal('fetch',fetchMock);
    await sendWelcomeEmail({to:'qa@example.com',siteUrl:'https://umbra.example',idempotencyKey:'qa-only'});
    const init=fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const body=JSON.parse(String(init.body)) as {html:string;attachments:unknown[]};
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe('qa-only');
    expect(body.html).toContain('src="cid:email-lockup"');expect(body.attachments).toHaveLength(2);
  });
  it('reports a timed-out provider instead of claiming email delivery',async()=>{
    vi.stubEnv('RESEND_API_KEY','synthetic-not-a-real-key');vi.stubEnv('EMAIL_FROM','umbra <onboarding@resend.dev>');
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new DOMException('synthetic timeout','TimeoutError')));
    await expect(sendWelcomeEmail({to:'qa@example.com',siteUrl:'https://umbra.example',idempotencyKey:'qa-only'}))
      .rejects.toThrow('Email provider could not be reached.');
  });
});
