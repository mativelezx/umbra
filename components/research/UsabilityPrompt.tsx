// components/research/UsabilityPrompt.tsx

'use client';

import { type FormEvent, useState } from 'react';
import { GlassCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  getUsabilityDefinition,
  LIKERT_7_LABELS,
} from '@/lib/research/instruments';
import type { UsabilityInstrument } from '@/types/research';

interface UsabilityPromptProps {
  instrument: UsabilityInstrument;
  onDismiss: () => void;
}

type SubmissionState = 'idle' | 'submitting' | 'success';

interface ApiSuccessResponse {
  ok: true;
  inserted: number;
}

interface ApiFailureResponse {
  ok: false;
  error: string;
  retry_after?: number;
}

const LIKERT_VALUES = [1, 2, 3, 4, 5, 6, 7] as const;

function getFriendlyError(payload: ApiFailureResponse | null): string {
  switch (payload?.error) {
    case 'consent_required':
      return 'Para responder esta encuesta primero tenés que activar el modo investigación.';
    case 'session_expired':
      return 'Tu sesión venció. Volvé a entrar y probá de nuevo.';
    case 'rate_limited':
      return 'Ya respondiste esta encuesta hace poco. Te la volvemos a mostrar más adelante.';
    case 'validation':
      return 'No pudimos validar tus respuestas. Revisá que todos los ítems tengan puntaje.';
    default:
      return 'No pudimos guardar tus respuestas por ahora. Intentá de nuevo en un rato.';
  }
}

export function UsabilityPrompt({ instrument, onDismiss }: UsabilityPromptProps) {
  const definition = getUsabilityDefinition(instrument);
  const [shownAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmissionState>('idle');
  const [error, setError] = useState<string | null>(null);

  const answeredCount = definition.items.filter(
    (item) => answers[item.itemKey] !== undefined,
  ).length;
  const canSubmit = answeredCount === definition.items.length && status !== 'submitting';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError('Respondé todos los ítems antes de enviar.');
      return;
    }

    setStatus('submitting');
    setError(null);

    const payload = {
      instrument,
      shown_at: shownAt,
      answered_at: new Date().toISOString(),
      responses: definition.items.map((item) => ({
        item_key: item.itemKey,
        score: answers[item.itemKey],
        free_text: notes[item.itemKey]?.trim() || undefined,
      })),
    };

    try {
      const response = await fetch('/api/research/usability', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as ApiSuccessResponse | ApiFailureResponse;

      if (!response.ok || !json.ok) {
        setStatus('idle');
        setError(getFriendlyError(json.ok ? null : json));
        return;
      }

      setStatus('success');
    } catch {
      setStatus('idle');
      setError('No pudimos conectarnos para guardar tus respuestas.');
    }
  }

  if (status === 'success') {
    return (
      <GlassCard className="relative overflow-hidden border border-violet-400/20 bg-umbra-abyss/70">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4">
          <div>
            <p className="font-heading text-[11px] uppercase tracking-[0.24em] text-violet-200/80">
              Investigación opt-in
            </p>
            <h3 className="mt-2 font-display text-2xl italic text-text-1">
              Gracias por sumar tu mirada
            </h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-text-2">
              Tus respuestas quedaron guardadas dentro del modo investigación de
              Umbra. Esto nos ayuda a detectar fricciones reales sin interrumpirte.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onDismiss}>Cerrar</Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="relative overflow-hidden border border-violet-400/20 bg-umbra-abyss/70">
      <div className="absolute -left-12 top-8 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-36 w-36 rounded-full bg-violet-300/10 blur-3xl" />

      <form onSubmit={handleSubmit} className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-[11px] uppercase tracking-[0.24em] text-violet-200/80">
              Investigación opt-in
            </p>
            <h3 className="mt-2 font-display text-2xl italic text-text-1">
              {definition.title}
            </h3>
            <p className="mt-2 font-body text-sm text-text-2">{definition.subtitle}</p>
            <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-text-2">
              {definition.description}
            </p>
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
            Ahora no
          </Button>
        </div>

        <div className="rounded-lg border border-violet-400/15 bg-umbra-shadow/30 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-body text-xs text-text-2">
              Escala de 1 a 7: <span className="text-text-1">{LIKERT_7_LABELS.min}</span>{' '}
              a <span className="text-text-1">{LIKERT_7_LABELS.max}</span>
            </p>
            <p className="font-mono text-[11px] text-violet-200/80">
              {answeredCount}/{definition.items.length} respondidos
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {definition.items.map((item, index) => {
            const selected = answers[item.itemKey];

            return (
              <div
                key={item.itemKey}
                className="rounded-xl border border-violet-400/15 bg-umbra-shadow/25 p-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-violet-400/10 font-heading text-xs text-violet-200">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm leading-relaxed text-text-1">
                        {item.prompt}
                      </p>
                      {item.dimension && (
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
                          {item.dimension}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {LIKERT_VALUES.map((value) => {
                      const active = selected === value;

                      return (
                        <button
                          key={`${item.itemKey}-${value}`}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            setAnswers((current) => ({
                              ...current,
                              [item.itemKey]: value,
                            }))
                          }
                          className={[
                            'rounded-md border px-0 py-2 font-heading text-sm transition-all duration-200',
                            active
                              ? 'border-violet-300 bg-violet-400/20 text-violet-100 shadow-[0_0_32px_rgba(167,139,250,0.12)]'
                              : 'border-violet-400/15 bg-umbra-shadow/40 text-text-2 hover:border-violet-400/35 hover:bg-violet-400/5 hover:text-text-1',
                          ].join(' ')}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-body text-[11px] text-text-3">
                      {LIKERT_7_LABELS.min}
                    </span>
                    <span className="font-body text-[11px] text-text-3">
                      {LIKERT_7_LABELS.max}
                    </span>
                  </div>

                  {selected !== undefined && (
                    <Input
                      value={notes[item.itemKey] ?? ''}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [item.itemKey]: event.target.value,
                        }))
                      }
                      label="Comentario opcional"
                      maxLength={500}
                      placeholder="Si querés, dejá un comentario breve sobre este punto."
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            aria-live="polite"
            className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose"
          >
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-400/10 pt-2">
          <p className="max-w-xl font-body text-xs leading-relaxed text-text-3">
            Esto es voluntario. Se guarda solo si elegiste participar del modo
            investigación y podés salir cuando quieras.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="ghost" onClick={onDismiss}>
              Cerrar
            </Button>
            <Button type="submit" loading={status === 'submitting'} disabled={!canSubmit}>
              Enviar respuestas
            </Button>
          </div>
        </div>
      </form>
    </GlassCard>
  );
}
