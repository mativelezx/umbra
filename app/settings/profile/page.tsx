'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

export default function SettingsProfilePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        if (data) {
          setFullName(data.full_name ?? '');
          setEmail(data.email ?? user.email ?? '');
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (err) {
      setError('No pudimos guardar.');
    } else {
      setMessage('Guardado.');
    }
    setSaving(false);
  }

  return (
    <LayoutShell>
      <div className="flex flex-col gap-8 max-w-2xl">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Configuración
          </p>
          <h1 className="mt-2 font-display text-4xl italic text-text-1 md:text-5xl">
            Tu perfil
          </h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          <Link
            href="/settings/profile"
            className="rounded-md border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 font-heading text-xs text-violet-200"
          >
            Perfil
          </Link>
          <Link
            href="/settings/export"
            className="rounded-md border border-violet-400/10 px-3 py-1.5 font-heading text-xs text-text-2 hover:text-text-1 hover:bg-violet-400/5"
          >
            Exportar datos
          </Link>
          <Link
            href="/settings/research-opt-out"
            className="rounded-md border border-violet-400/10 px-3 py-1.5 font-heading text-xs text-text-2 hover:text-text-1 hover:bg-violet-400/5"
          >
            Investigación
          </Link>
          <Link
            href="/settings/delete"
            className="rounded-md border border-accent-rose/20 px-3 py-1.5 font-heading text-xs text-accent-rose/80 hover:bg-accent-rose/5"
          >
            Eliminar cuenta
          </Link>
        </nav>

        <Card>
          {loading ? (
            <p className="font-body text-text-3">Cargando...</p>
          ) : (
            <form onSubmit={onSave} className="flex flex-col gap-5">
              <Input
                type="text"
                label="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input type="email" label="Email" value={email} disabled />
              <p className="font-mono text-[10px] text-text-4">
                Para cambiar tu email contactanos por email.
              </p>
              {error && (
                <div className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-md border border-accent-emerald/30 bg-accent-emerald/10 px-4 py-3 font-body text-sm text-accent-emerald">
                  {message}
                </div>
              )}
              <Button type="submit" loading={saving}>
                Guardar cambios
              </Button>
            </form>
          )}
        </Card>
      </div>
    </LayoutShell>
  );
}
