import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import AxeBuilder from '@axe-core/playwright';

// Synthetic account, real local Supabase + Mailpit. Never contacts paid AI,
// resets an existing account, or deletes a mailbox. Explicit opt-in required.
test('branded recovery email → new password → actual authentication',async({page,request},info)=>{
  test.skip(process.env.E2E_EMAIL_RECOVERY!=='true','Opt in to a fresh local-only QA account');
  test.setTimeout(120000);
  for(const url of [process.env.PLAYWRIGHT_BASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_URL!])expect(['localhost','127.0.0.1']).toContain(new URL(url).hostname);
  const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
  const email=`umbra-email-qa-${Date.now()}@test.local`;
  const oldPassword='Synthetic-Old-1234!';const newPassword='Synthetic-New-5678!';
  const created=await db.auth.signUp({email,password:oldPassword});expect(created.error).toBeNull();await db.auth.signOut();
  await page.goto('/login');await page.getByRole('link',{name:'Olvidé mi contraseña'}).click();
  await page.getByLabel('Email',{exact:true}).fill(email);
  await page.getByRole('button',{name:'Mandarme el enlace'}).click();
  await expect(page.getByRole('status')).toContainText('Si existe una cuenta');
  let messageId='';
  await expect.poll(async()=>{
    const response=await request.get('http://127.0.0.1:54324/api/v1/messages');
    if(!response.ok())return false;
    const body=await response.json() as {messages:{ID:string;To:{Address:string}[];Subject:string}[]};
    const found=body.messages.find(message=>message.To.some(to=>to.Address===email)&&message.Subject==='umbra — recuperá el acceso a tu cuenta');
    messageId=found?.ID??'';return Boolean(messageId);
  },{timeout:30000}).toBe(true);
  const mail=await(await request.get(`http://127.0.0.1:54324/api/v1/message/${messageId}`)).json() as {HTML:string};
  expect(mail.HTML).toContain('alt="umbra"');expect(mail.HTML).toContain('Tu contraseña actual no cambia');
  const link=mail.HTML.match(/href="([^"]+)"[^>]*>Cambiar mi contraseña<\/a>/)?.[1].replaceAll('&amp;','&');
  expect(link).toBeTruthy();expect(['localhost','127.0.0.1']).toContain(new URL(link!).hostname);
  await page.goto(link!);
  expect(new URL(page.url()).pathname).toBe('/reset-password');
  expect(new URL(page.url()).origin).toBe(new URL(process.env.PLAYWRIGHT_BASE_URL!).origin);
  await info.attach('recovery-origin-check', {body:JSON.stringify({baseOrigin:new URL(process.env.PLAYWRIGHT_BASE_URL!).origin,landedOrigin:new URL(page.url()).origin,landedPath:new URL(page.url()).pathname,cookies:(await page.context().cookies()).map(({name,domain})=>({name,domain}))}),contentType:'application/json'});
  await expect(page.getByRole('button',{name:'Guardar nueva contraseña'})).toBeEnabled({timeout:10000});
  await page.getByLabel('Nueva contraseña',{exact:true}).fill(newPassword);await page.getByLabel('Repetir nueva contraseña').fill(newPassword);
  await page.getByRole('button',{name:'Guardar nueva contraseña'}).click();
  await expect(page.getByRole('status')).toContainText('quedó actualizada');
  expect((await db.auth.signInWithPassword({email,password:oldPassword})).error).not.toBeNull();
  expect((await db.auth.signInWithPassword({email,password:newPassword})).error).toBeNull();await db.auth.signOut();
  // CLI 2.84.2 passes authentication templates to GoTrue, but not notification
  // configuration. Only assert that separate feature on an environment which
  // actually enables it; the ordinary run proves recovery, not notification.
  if (process.env.E2E_AUTH_NOTIFICATIONS === 'true') {
    await expect.poll(async()=>{
      const body=await(await request.get('http://127.0.0.1:54324/api/v1/messages')).json() as {messages:{To:{Address:string}[];Subject:string}[]};
      return body.messages.some(message=>message.To.some(to=>to.Address===email)&&message.Subject==='umbra — cambió tu contraseña');
    },{timeout:30000}).toBe(true);
  } else info.annotations.push({type:'not-verified',description:'Security notification delivery is not enabled by the current local CLI; design templates only.'});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.screenshot({path:info.outputPath('password-reset-success.png'),fullPage:true});
});

test('reset without a session is blocked and links to recovery',async({page})=>{
  test.skip(process.env.E2E_EMAIL_RECOVERY!=='true','Local-only verification');
  await page.goto('/reset-password');await expect(page.getByRole('main').getByRole('alert')).toContainText('El enlace no está activo');
  await expect(page.getByRole('button',{name:'Guardar nueva contraseña'})).toBeDisabled();
  await page.getByRole('link',{name:'Pedir otro enlace'}).click();await expect(page).toHaveURL(/\/forgot-password$/);
});
