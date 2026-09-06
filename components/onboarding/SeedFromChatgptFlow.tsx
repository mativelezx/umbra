'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChatCircleText,
  Check,
  Copy,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Card, GlassCard } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { DisclaimerCard } from './DisclaimerCard';
import { CHATGPT_SEED_PROMPT } from '@/lib/prompts/chatgpt-seed-prompt';

type Step = 'copy' | 'paste' | 'seeding';

type SeedError =
  | { kind: 'rate_limited' }
  | { kind: 'crisis' }
  | { kind: 'consent' }
  | { kind: 'generic'; message: string };

interface SeedFromChatgptFlowProps {
  onSeeded: (sessionId: string) => void;
  onBack: () => void;
}

const MIN_PASTE_LENGTH = 300;
const MAX_PASTE_LENGTH = 14000;

export function SeedFromChatgptFlow({
  onSeeded,
  onBack,
}: SeedFromChatgptFlowProps) {
  const [step, setStep] = useState<Step>('copy');
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<SeedError | null>(null);

  const pastedLength = pasted.trim().length;
  const canAnalyze = pastedLength >= MIN_PASTE_LENGTH;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CHATGPT_SEED_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard API blocked — silent fall-through. The textarea is
      // selectable so the user can still copy manually.
    }
  }

  async function handleSeed() {
    setError(null);
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      onSeeded('demo-session');
      return;
    }
    setStep('seeding');

    try {
      const res = await fetch('/api/onboarding/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: pasted.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const code = data.error ?? 'generic';
        if (code === 'rate_limited') setError({ kind: 'rate_limited' });
        else if (code === 'crisis') setError({ kind: 'crisis' });
        else if (code === 'consent_required') setError({ kind: 'consent' });
        else setError({ kind: 'generic', message: code });
        setStep('paste');
        return;
      }

      onSeeded(data.data.sessionId);
    } catch (e) {
      setError({
        kind: 'generic',
        message: e instanceof Error ? e.message : 'network',
      });
      setStep('paste');
    }
  }

  return (
    <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10 md:px-10">
      <DisclaimerCard />

      <BackButton onClick={onBack} disabled={step === 'seeding'} />

      <header className="flex flex-col gap-2">
        <h1 className="font-heading font-semibold text-4xl not-italic text-text-1 md:text-5xl">
          {step === 'copy' && 'Copiá este prompt'}
          {step === 'paste' && 'Pegá la respuesta acá'}
          {step === 'seeding' && 'Leyendo el retrato...'}
        </h1>
        {step === 'copy' && (
          <p className="max-w-2xl font-body text-base text-text-2">
            Llevate este prompt a ChatGPT (idealmente con memoria activada o
            historial largo), esperá la respuesta completa, y volvé con ella.
          </p>
        )}
        {step === 'paste' && (
          <p className="max-w-2xl font-body text-base text-text-2">
            Pegá TODO lo que ChatGPT te devolvió. Umbra va a leerlo y después
            te va a hacer 2 o 3 preguntas cortas para verificar lo que vio.
          </p>
        )}
      </header>
      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p className="rounded-md bg-umbra-shadow/50 p-4 text-sm text-text-2">Ejemplo local: tu texto no se envía ni se analiza. Continuar abre preguntas preparadas con datos ficticios.</p>}

      {error && <ErrorBanner error={error} />}

      {step === 'copy' && <CopyStep copied={copied} onCopy={handleCopy} onNext={() => setStep('paste')} />}

      {step === 'paste' && (
        <PasteStep
          value={pasted}
          onChange={setPasted}
          canAnalyze={canAnalyze}
          length={pastedLength}
          onSeed={handleSeed}
        />
      )}

      {step === 'seeding' && <SeedingReveal />}
    </div>
  );
}

function CopyStep({
  copied,
  onCopy,
  onNext,
}: {
  copied: boolean;
  onCopy: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <GlassCard className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <p className="font-body text-sm normal-case tracking-normal text-text-3">
            Prompt para ChatGPT
          </p>
          <Button
            variant={copied ? 'ghost' : 'secondary'}
            size="sm"
            onClick={onCopy}
            type="button"
          >
            {copied ? (
              <>
                <Check size={14} weight="bold" />
                Copiado
              </>
            ) : (
              <>
                <Copy size={14} weight="bold" />
                Copiar prompt
              </>
            )}
          </Button>
        </div>
        <textarea
          aria-label="Prompt para copiar en ChatGPT"
          readOnly
          value={CHATGPT_SEED_PROMPT}
          rows={14}
          className="w-full resize-none rounded-md border border-violet-400/15 bg-umbra-shadow/40 p-4 font-body text-sm leading-relaxed text-text-2 focus:outline-none focus:ring-1 focus:ring-violet-400/40"
        />
      </GlassCard>

      <Card className="flex flex-col gap-3 p-5">
        <p className="font-body text-sm normal-case tracking-normal text-text-3">
          Pasos
        </p>
        <ol className="flex flex-col gap-2 font-body text-sm text-text-2">
          <li>
            <span className="mr-2 font-body text-text-3">1.</span>
            Copiá el prompt y pegalo en una conversación nueva de ChatGPT.
          </li>
          <li>
            <span className="mr-2 font-body text-text-3">2.</span>
            Funciona mejor si venís charlando con ChatGPT hace tiempo o tenés
            memoria persistente activada.
          </li>
          <li>
            <span className="mr-2 font-body text-text-3">3.</span>
            Esperá a que termine de escribir toda la respuesta (prosa + JSON).
          </li>
          <li>
            <span className="mr-2 font-body text-text-3">4.</span>
            Volvé acá, tocá <em className="not-italic text-text-1">Pegué la respuesta</em>, y pegala
            completa.
          </li>
        </ol>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" size="lg" onClick={onNext} type="button">
          Ya lo pegué, continuar
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    </>
  );
}

function PasteStep({
  value,
  onChange,
  canAnalyze,
  length,
  onSeed,
}: {
  value: string;
  onChange: (v: string) => void;
  canAnalyze: boolean;
  length: number;
  onSeed: () => void;
}) {
  const helperText = useMemo(() => {
    if (length === 0) return `Pegá la respuesta de ChatGPT (mínimo ${MIN_PASTE_LENGTH} caracteres).`;
    if (length < MIN_PASTE_LENGTH)
      return `${length}/${MIN_PASTE_LENGTH} caracteres — parece corto, ¿pegaste la respuesta completa?`;
    if (length > MAX_PASTE_LENGTH)
      return `${length}/${MAX_PASTE_LENGTH} caracteres — se pasó del máximo. Recortá un poco.`;
    return `${length} caracteres — listo.`;
  }, [length]);

  const helperTone =
    length === 0
      ? 'text-text-3'
      : length < MIN_PASTE_LENGTH || length > MAX_PASTE_LENGTH
        ? 'text-accent-rose'
        : 'text-violet-300';

  return (
    <>
      <GlassCard className="flex flex-col gap-4 p-6">
        <Textarea
          label="Respuesta de ChatGPT"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pegá acá la respuesta completa de ChatGPT..."
          rows={16}
          maxLength={MAX_PASTE_LENGTH}
          aria-label="Respuesta de ChatGPT"
          className="min-h-[320px] font-body text-xs leading-relaxed"
        />
        <p className={`font-body text-sm ${helperTone}`}>{helperText}</p>
      </GlassCard>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={onSeed}
          disabled={!canAnalyze}
          type="button"
        >
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'Continuar con el ejemplo' : 'Continuar con verificación'}
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    </>
  );
}

function SeedingReveal() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-6">
      <ChatCircleText size={40} weight="duotone" className="text-violet-300" />
      <p className="font-body text-sm normal-case tracking-normal text-text-3">
        Leyendo el retrato
      </p>
      <h2 className="max-w-xl text-center font-heading font-semibold text-3xl not-italic text-text-1 md:text-4xl">
        Extrayendo los ejes y preparando 2 o 3 preguntas de verificación...
      </h2>
      <div className="flex items-center gap-1.5">
        <span className="thinking-dot h-2 w-2 rounded-full bg-violet-300" />
        <span className="thinking-dot h-2 w-2 rounded-full bg-violet-300" />
        <span className="thinking-dot h-2 w-2 rounded-full bg-violet-300" />
      </div>
    </div>
  );
}

function ErrorBanner({ error }: { error: SeedError }) {
  const message =
    error.kind === 'rate_limited'
      ? 'Ya usamos lo del día. Probá mañana para continuar.'
      : error.kind === 'crisis'
        ? 'Detectamos señales que nos preocupan. Buscá apoyo profesional o llamá a una línea de escucha.'
        : error.kind === 'consent'
          ? 'Necesitamos que aceptes los términos antes de empezar.'
          : `Algo falló: ${error.message}. Probá de nuevo.`;

  return (
    <Card className="border-accent-rose/30 bg-accent-rose/10">
      <p className="font-body text-sm text-accent-rose">{message}</p>
    </Card>
  );
}

function BackButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-fit items-center gap-2 font-body text-sm normal-case tracking-normal text-text-3 transition-colors hover:text-violet-300 disabled:opacity-40"
    >
      <ArrowLeft size={14} weight="bold" />
      Volver
    </button>
  );
}
