'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Fingerprint } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/providers/auth-context';
import { BFI2S_ATTRIBUTION, BFI2S_CHOICES, BFI2S_ITEMS, BFI2S_SOURCE, BFI2S_VERSION, createSelfReport, extractSelfReport } from '@/lib/assessment/bfi2s';
import type { BigFiveSelfReport } from '@/types';
import { SelfReportSummary } from './SelfReportSummary';
import styles from './SelfReport.module.css';

interface Props { profileId: string; onContinue: () => void; existing?: boolean }
export function SelfReportForm({ profileId, onContinue, existing = false }: Props) {
  const { user } = useAuth();
  const owner = useRef(user?.id);
  const active = useRef(true);
  const abort = useRef<AbortController | null>(null);
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const [page, setPage] = useState(-1);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(30).fill(null));
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BigFiveSelfReport | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; abort.current?.abort(); }; }, []);
  useEffect(() => { if (page >= 0) title.current?.focus(); }, [page]);
  const currentOwner = demo || owner.current === user?.id;
  if (!currentOwner) return <p role="status">La sesión cambió. Volvé a abrir el cuestionario desde tu cuenta.</p>;

  async function save() {
    if (saving || !accepted || answers.some(answer => answer === null)) return;
    setSaving(true); setError(null);
    try {
      if (demo) { setResult(createSelfReport(answers, new Date().toISOString())); return; }
      abort.current = new AbortController();
      const response = await fetch('/api/self-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abort.current.signal, body: JSON.stringify({ profileId, instrument: BFI2S_VERSION, answers, accepted: true }) });
      const body = await response.json();
      if (!active.current) return;
      const report = extractSelfReport({ selfReport: body.data?.selfReport });
      if (!response.ok || !body.ok || !report) {
        setError(body.error === 'session_expired' ? 'Tu sesión venció. Iniciá sesión de nuevo antes de guardar.' : body.error === 'profile_changed' ? 'Tu perfil cambió mientras guardabas. Revisá tu cuenta y reintentá.' : 'No pudimos guardar. Tus respuestas siguen en esta pantalla; podés reintentar.');
        return;
      }
      setResult(report);
    } catch { if (active.current) setError('No pudimos conectar. Tus respuestas siguen acá; probá guardar otra vez.'); }
    finally { if (active.current) setSaving(false); }
  }

  if (result) return <div className={styles.form}>
    <p role="status" className={styles.confirmation}><Check size={22} />{demo ? 'Resultado de esta prueba local. No se guardó en una cuenta.' : 'Tus respuestas quedaron guardadas.'}</p>
    <SelfReportSummary report={result} />
    <Button onClick={onContinue}>Continuar <ArrowRight size={18} /></Button>
  </div>;

  return <section className={styles.form}>
    {page === -1 ? <>
      <Fingerprint size={56} weight="light" aria-hidden="true" />
      <h1>Tu voz también<br />tiene una medida.</h1>
      <p>Respondé 30 afirmaciones sobre cómo te describís habitualmente. Al terminar vas a ver cinco resultados calculados con tus respuestas, con una explicación de cada uno. Esta es la referencia principal de tu resultado en Umbra.</p>
      <p>No hay respuestas correctas. Elegí cuánto estás de acuerdo con cada afirmación. Respetamos las preguntas de la versión española del BFI-2-S; por eso algunas palabras tienen un tono diferente al resto de Umbra.</p>
      <div className={styles.consent}>
        <h2>Vos decidís si sumarlo.</h2>
        <p>Es opcional. Al guardar, las 30 respuestas y sus cinco promedios se agregan a tu perfil en Supabase. Las próximas lecturas, actividades y conversaciones de IA pueden usar los promedios junto con lo que contaste. No se envían las 30 respuestas al generador ni se usan para entrenar el ML o agregar datos de investigación.</p>
        <p>Podés descargar tus respuestas con tus datos de cuenta, reemplazarlas completando otra vez el cuestionario o eliminarlas al borrar tu cuenta. Si salís o recargás antes de guardar, este borrador se pierde.</p>
        {existing && <p>Esto reemplazará tu autoinforme anterior. Las lecturas y actividades anteriores quedarán fuera de la versión actual; las próximas se generarán con esta nueva referencia.</p>}
        <label><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} />Quiero responder y autorizo este uso de mis respuestas.</label>
      </div>
      <p className={styles.note}>No es una evaluación clínica. Completarlo no valida la estimación experimental del modelo.</p>
      {demo && <p role="status" className={styles.note}>Modo de ejemplo: podés responder y ver el cálculo, pero no se guarda ni se envía nada.</p>}
      <div className={styles.actions}><Button disabled={!accepted} onClick={() => setPage(0)}>Empezar las 30 preguntas <ArrowRight size={18} /></Button><Button variant="ghost" onClick={onContinue}>Ahora no</Button></div>
      <details className={styles.source}><summary>Instrumento original y permiso de uso</summary><p>{BFI2S_ATTRIBUTION}</p><a href={BFI2S_SOURCE} target="_blank" rel="noreferrer">Ver el formulario publicado por los autores</a></details>
    </> : <>
      <div className={styles.progress}><span>Bloque {page + 1} de 5</span><span aria-live="polite">{answers.filter(answer => answer !== null).length} de 30 respondidas</span></div>
      <progress value={answers.filter(answer => answer !== null).length} max={30} aria-label="Afirmaciones respondidas" />
      <h1 ref={title} tabIndex={-1}>¿Cuánto estás de acuerdo?</h1>
      <p>Me describo como alguien…</p>
      <form onSubmit={event => { event.preventDefault(); if (page < 4) setPage(page+1); else void save(); }}>
        {BFI2S_ITEMS.slice(page*6, page*6+6).map((item, index) => {
          const position = page*6+index;
          return <fieldset key={position} className={styles.question} disabled={saving}><legend><span>{position+1}.</span> {item}</legend><div className={styles.options}>
            {BFI2S_CHOICES.map((choice, choiceIndex) => <label key={choice}><input type="radio" name={`item-${position+1}`} value={choiceIndex+1} checked={answers[position] === choiceIndex+1} onChange={() => setAnswers(previous => previous.map((value, i) => i === position ? choiceIndex+1 : value))} required /><span><b aria-hidden="true">{choiceIndex+1}</b>{choice}</span></label>)}
          </div></fieldset>;
        })}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.actions}><Button variant="secondary" type="button" disabled={saving} onClick={() => setPage(page-1)}><ArrowLeft size={18} />Volver</Button><Button type="submit" loading={saving} disabled={answers.slice(page*6,page*6+6).some(answer => answer === null)}>{page < 4 ? 'Siguientes 6' : demo ? 'Ver mi resultado local' : 'Guardar y ver mi resultado'}<ArrowRight size={18} /></Button></div>
        <Button variant="ghost" type="button" disabled={saving} onClick={onContinue}>Salir sin guardar</Button>
      </form>
    </>}
  </section>;
}
