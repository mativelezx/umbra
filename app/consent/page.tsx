'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/Card';
import { t } from '@/lib/i18n/dict';

const CONSENT_VERSION = '2026-04-13-v1';

export default function ConsentPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [researchOptIn, setResearchOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accepted) return;
    setLoading(true);
    setError(null);

    const res = await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentVersion: CONSENT_VERSION, researchOptIn }),
    });

    if (!res.ok) {
      setError('No pudimos guardar tu consentimiento. Probá de nuevo.');
      setLoading(false);
      return;
    }
    router.push('/onboarding');
    router.refresh();
  }

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 md:px-10">
      <div className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
          Antes de empezar
        </p>
        <h1 className="mt-3 font-display text-5xl italic text-text-1 md:text-6xl">
          {t('consent.title')}
        </h1>
        <p className="mt-4 max-w-2xl font-body text-lg text-text-2">
          {t('consent.subtitle')}
        </p>
      </div>

      <GlassCard className="mb-8 max-h-[60vh] overflow-y-auto">
        <article className="prose-sm prose-invert font-body text-sm leading-relaxed text-text-2">
          <section>
            <h2 className="font-display text-2xl text-text-1 mt-0">¿Qué datos recolectamos?</h2>
            <ul className="mt-2 space-y-1.5">
              <li>Email (para login y recuperación de cuenta)</li>
              <li>Textos introspectivos del onboarding y el chat</li>
              <li>Perfil psicológico generado por el análisis</li>
              <li>Dirección IP (seudonimizada con HMAC, solo para auditoría)</li>
              <li>User agent del navegador (para debugging)</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">¿Dónde se almacenan?</h2>
            <p className="mt-2">
              Supabase PostgreSQL, servidor en US-East. Cifrado en tránsito (TLS) y en reposo.
              Para el análisis con IA usamos Anthropic Claude, que según su política no usa
              contenido de usuarios para entrenar modelos.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">¿Quién accede?</h2>
            <p className="mt-2">
              Vos, a través de tu sesión autenticada. El sistema automatizado de Umbra. El
              responsable del tratamiento (el desarrollador del TFG), únicamente para
              mantenimiento. Nadie más.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">¿Cuánto tiempo se retienen?</h2>
            <p className="mt-2">
              Indefinidamente hasta que solicites el borrado. Algunos payloads técnicos (debug
              de análisis, eventos de seguridad del chat) se purgan automáticamente a los 30 días.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">
              Tus derechos (arts. 13-17 Ley 25.326)
            </h2>
            <ul className="mt-2 space-y-1.5">
              <li>
                <strong className="text-text-1">Acceso</strong>: podés descargar todos tus datos
                desde Configuración.
              </li>
              <li>
                <strong className="text-text-1">Rectificación</strong>: podés editar tu perfil
                en cualquier momento.
              </li>
              <li>
                <strong className="text-text-1">Cancelación</strong>: podés eliminar tu cuenta y
                todos tus datos personales.
              </li>
              <li>
                <strong className="text-text-1">Oposición</strong>: podés retirar el modo
                investigación en cualquier momento.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">Modo investigación (opcional)</h2>
            <p className="mt-2">
              Si activás el modo investigación, tus textos y perfil generado se guardan en un
              dataset <strong className="text-text-1">seudonimizado</strong> (identificados por
              una clave criptográfica). NO es anonimización irreversible: el administrador con
              acceso a la clave secreta y a tu ID original podría técnicamente re-vincularlos.
              En la práctica, ese acceso está limitado al responsable del tratamiento.
            </p>
            <p className="mt-2">
              Si cancelás tu cuenta, tus datos de investigación permanecen salvo que marques
              explícitamente "purgar también mi contribución de investigación" en el flujo de
              borrado. Podés activar o desactivar este modo en cualquier momento desde
              Configuración.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">Umbra no es terapia</h2>
            <p className="mt-2">
              Es una herramienta de autoconocimiento. Si estás en crisis emocional, contactá
              inmediatamente a un profesional de salud mental o llamá al 135 (Centro de
              Asistencia al Suicida, Argentina) o al 911.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-2xl text-text-1">Responsable del tratamiento</h2>
            <p className="mt-2">
              Matías Velez — TFG Ingeniería en Software, Universidad Siglo 21. Podés
              contactarme por email para ejercer tus derechos o hacer una consulta. Para
              reclamos formales tenés derecho a presentarte ante la Agencia de Acceso a la
              Información Pública (AAIP).
            </p>
          </section>
        </article>
      </GlassCard>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            required
            className="mt-1 h-5 w-5 accent-violet-400 cursor-pointer"
          />
          <span className="font-body text-sm text-text-1 group-hover:text-white transition-colors">
            {t('consent.accept_label')}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={researchOptIn}
            onChange={(e) => setResearchOptIn(e.target.checked)}
            className="mt-1 h-5 w-5 accent-violet-400 cursor-pointer"
          />
          <span className="font-body text-sm text-text-2 group-hover:text-text-1 transition-colors">
            {t('consent.research_label')}
          </span>
        </label>

        {error && (
          <div className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} disabled={!accepted} size="lg">
          {t('consent.cta')}
        </Button>
      </form>
    </main>
  );
}
