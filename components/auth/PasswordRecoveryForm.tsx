'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Brand } from '@/components/layout/Brand';
import { AccessPrelude } from '@/components/layout/AccessPrelude';
import { GlassCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function PasswordRecoveryForm({ mode }: {mode:'request'|'reset'}) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirmation,setConfirmation]=useState('');
  const [loading,setLoading]=useState(false);
  const [ready,setReady]=useState(mode==='request');
  const [done,setDone]=useState(false);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    if(mode!=='reset') return;
    let active=true;
    void createClient().auth.getUser().then(({data:{user}})=>{
      if(!active)return;
      setReady(Boolean(user));
      if(!user)setError('El enlace no está activo. Pedí uno nuevo para cambiar tu contraseña.');
    }).catch(()=>{if(active)setError('No pudimos comprobar el enlace. Volvé a solicitarlo.');});
    return()=>{active=false;};
  },[mode]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null);
    if(mode==='reset' && (password.length<8 || password!==confirmation)){
      setError(password.length<8?'Usá una contraseña de al menos 8 caracteres.':'Las contraseñas no coinciden.'); return;
    }
    setLoading(true);
    try {
      const db=createClient();
      const result=mode==='request'
        ? await db.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/auth/callback?next=/reset-password`})
        : await db.auth.updateUser({password});
      if(result.error) {setError(mode==='request'?'No pudimos enviar el enlace. Esperá un momento y volvé a intentar.':'No pudimos actualizar la contraseña. Probá con otra o pedí un nuevo enlace.');return;}
      setDone(true);setPassword('');setConfirmation('');
    } catch {setError('No pudimos conectarnos. Revisá tu conexión y volvé a intentar.');}
    finally {setLoading(false);}
  }
  return <div className="focus-backdrop access-layout"><AccessPrelude/><main className="auth-entry relative mx-auto flex min-h-screen max-w-lg items-center justify-center px-5 py-12"><GlassCard className="w-full"><Brand/>
    <h1 className="mt-8 text-balance text-3xl font-bold text-text-1">{mode==='request'?'Volvé a entrar.':'Elegí tu nueva contraseña.'}</h1>
    <p className="mt-3 mb-7 text-pretty text-text-3">{mode==='request'?'Te mandamos un enlace para recuperar el acceso a tu cuenta.':'Guardá una contraseña que no uses en otros servicios.'}</p>
    {done ? <div role="status" className="space-y-4 text-text-1"><p>{mode==='request'?'Si existe una cuenta con ese email, vas a recibir un enlace. Revisá también la carpeta de correo no deseado.':'Tu contraseña quedó actualizada. Ya podés seguir usando umbra.'}</p><Link href={mode==='request'?'/login':'/dashboard'} className="inline-flex min-h-11 items-center underline underline-offset-4">{mode==='request'?'Volver a entrar':'Ir a mi resultado'}</Link></div>
    : <form onSubmit={submit} className="flex flex-col gap-5">{mode==='request'?<Input type="email" label="Email" required autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)}/>:<><Input type="password" label="Nueva contraseña" required autoComplete="new-password" minLength={8} value={password} onChange={event=>setPassword(event.target.value)}/><Input type="password" label="Repetir nueva contraseña" required autoComplete="new-password" minLength={8} value={confirmation} onChange={event=>setConfirmation(event.target.value)}/></>}
    {error&&<p role="alert" className="text-sm text-accent-rose">{error}</p>}<Button type="submit" loading={loading} disabled={!ready} size="lg">{mode==='request'?'Mandarme el enlace':'Guardar nueva contraseña'}</Button>
    {mode==='reset'&&!ready&&<Link href="/forgot-password" className="inline-flex min-h-11 items-center underline underline-offset-4">Pedir otro enlace</Link>}</form>}
    <Link href="/login" className="mt-6 inline-flex min-h-11 items-center text-sm text-text-3 underline underline-offset-4">Volver a la pantalla de acceso</Link>
  </GlassCard></main></div>;
}
