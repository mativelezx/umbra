import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EMAIL_KINDS, renderUmbraEmail } from '../lib/email/templates';
import type { UmbraEmailKind } from '../types';

const check=process.argv.includes('--check');
const previewRoot=resolve('artifacts/email-preview');
const templateRoot=resolve('supabase/templates');
const authKinds=EMAIL_KINDS.filter(kind=>kind!=='welcome' && kind!=='delete_confirmation');
const options=(kind:UmbraEmailKind,preview=false)=>({kind,siteUrl:preview?'http://127.0.0.1:3044':'{{ .SiteURL }}',actionUrl:preview?'http://127.0.0.1:3044/preview-action.html':kind==='password_changed'?'{{ .SiteURL }}/forgot-password':kind==='email_changed'?'{{ .SiteURL }}/login':'{{ .ConfirmationURL }}',code:preview?'482 163':'{{ .Token }}',preview,...(kind==='delete_confirmation'?{expiresAt:new Date(Date.now()+300000).toISOString()}: {})});
if(!check){mkdirSync(templateRoot,{recursive:true});mkdirSync(`${previewRoot}/brand`,{recursive:true});}
for(const kind of authKinds){
  const html=renderUmbraEmail(options(kind)).html;
  const path=`${templateRoot}/${kind}.html`;
  if(check){if(readFileSync(path,'utf8')!==html) throw Error(`Regenerate ${kind} email`);}else{writeFileSync(path,html);}
}
if(check){console.info('All Supabase templates match the shared Umbra renderer.');process.exit(0);}
for(const kind of EMAIL_KINDS){const message=renderUmbraEmail(options(kind,true));writeFileSync(`${previewRoot}/${kind}.html`,message.html);writeFileSync(`${previewRoot}/${kind}.txt`,message.text);}
for(const name of ['email-lockup.png','email-aperture.png']) copyFileSync(`public/brand/${name}`,`${previewRoot}/brand/${name}`);
writeFileSync(`${previewRoot}/preview-action.html`,'<!doctype html><html lang="es"><meta charset="utf-8"><title>Vista de diseño</title><body style="font:18px Arial;padding:40px"><h1>Esto es una vista de diseño.</h1><p>No se cambió ni eliminó ninguna cuenta. Los enlaces reales los genera cada servicio al realizar la operación.</p></body></html>');
writeFileSync(`${previewRoot}/index.html`,`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Correos de umbra</title><style>*{box-sizing:border-box}body{margin:0;background:#f0f0eb;color:#242424;font:16px Arial}header{padding:26px 32px;background:#171a18;color:#f7f7f4}h1{margin:0;font:34px Georgia}p{line-height:1.6}.layout{display:grid;grid-template-columns:240px 1fr;gap:28px;padding:28px}nav a{display:block;padding:12px;color:#242424;border-bottom:1px solid #deded8;text-decoration:none}nav a:hover,nav a:focus{background:white}iframe{width:100%;height:1200px;border:0;background:#f0f0eb}a:focus{outline:2px solid #805720;outline-offset:2px}@media(max-width:760px){.layout{display:block;padding:12px}nav{display:flex;overflow:auto;gap:8px}nav a{white-space:nowrap}iframe{height:1380px}}</style></head><body><header><h1>Los correos de umbra.</h1><p>Diez mensajes, una misma identidad. Vista local con datos ficticios; no se ejecutan operaciones.</p></header><div class="layout"><nav aria-label="Plantillas de correo">${EMAIL_KINDS.map(kind=>`<a target="email" href="${kind}.html">${{welcome:'Bienvenida',confirmation:'Confirmar cuenta',invite:'Invitación',recovery:'Recuperar contraseña',magic_link:'Enlace de acceso',email_change:'Confirmar nuevo email',reauthentication:'Código de seguridad',password_changed:'Contraseña actualizada',email_changed:'Email actualizado',delete_confirmation:'Eliminar cuenta'}[kind]}</a>`).join('')}</nav><main><iframe title="Vista de correo de umbra" name="email" src="welcome.html"></iframe></main></div></body></html>`);
console.info('Generated 8 Supabase Auth templates and 10 local email previews.');
