'use client';

import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY, JUNG_CONTEXT } from '@/lib/knowledge/glossary';
import styles from './ExplainedText.module.css';

function Term({ code }: { code: string }) {
  const term = GLOSSARY[code];
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const hoverDismissed = useRef(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 16, left: 16 });
  function show(fromHover = false) {
    if (fromHover && hoverDismissed.current) return;
    hoverDismissed.current = false;
    clearTimeout(timer.current);
    const bounds = trigger.current?.getBoundingClientRect();
    if (bounds) setPosition({ left: Math.max(16, Math.min(bounds.left, window.innerWidth - 336)), top: Math.max(16, Math.min(bounds.bottom + 10, window.innerHeight - 320)) });
    setOpen(true);
  }
  function leave() { timer.current = setTimeout(() => setOpen(false), 180); }
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !tip.current?.contains(event.target as Node)) setOpen(false);
    };
    // A tooltip above its trigger can expose the trigger again on dismissal.
    // Escape must remain effective until a fresh intentional interaction.
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { hoverDismissed.current = true; setOpen(false); } };
    const scroll = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', key);
    window.addEventListener('scroll', scroll, true);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key); window.removeEventListener('scroll', scroll, true); clearTimeout(timer.current); };
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <><button ref={trigger} type="button" className={styles.term} aria-label={`Qué significa ${code}`} aria-describedby={open ? id : undefined} aria-expanded={open} onMouseEnter={() => show(true)} onMouseLeave={() => { hoverDismissed.current = false; leave(); }} onFocus={() => show()} onBlur={() => setOpen(false)} onClick={() => show()}>{code}</button>{open && createPortal(<span ref={tip} id={id} role="tooltip" className={styles.tooltip} style={position} onMouseEnter={() => clearTimeout(timer.current)} onMouseLeave={leave}><strong>{code} · {term.name}</strong><span>{term.meaning}</span><span className={styles.example}>Por ejemplo: {term.example}</span><small>{code === 'Big Five' ? 'La estimación de Umbra es experimental y no cuenta con validación individual suficiente en español.' : JUNG_CONTEXT}</small></span>, document.body)}</>;
}

/** Small safe inline renderer; never interprets HTML from generated content. */
export function ExplainedText({ text, document = false }: { text: string; document?: boolean }) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\b(?:Se|Si|Ne|Ni|Te|Ti|Fe|Fi|Big Five|[Aa]rquetipo)\b)/g);
  return <>{parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}><ExplainedText text={part.slice(2, -2)} document={document} /></strong>;
    const code = part === 'Arquetipo' ? 'arquetipo' : part;
    // Avoid turning ordinary Spanish "Se trata..." and "Si querés..." into jargon.
    const ambiguous = ['Se', 'Si', 'Ni', 'Te'].includes(part);
    const next = parts[index + 1] ?? '';
    const previous = parts[index - 1] ?? '';
    const explicitContext = next.trim() === '' || /^\s*(?:[(:/,;.)]|\d|en\s+\d|alt[oa]\b|baj[oa]\b|y\s*$)/i.test(next) || /(?:funci[oó]n|funciones|sigla)\s*[«"(]?$/i.test(previous);
    const ordinary = ambiguous && !explicitContext;
    if (!GLOSSARY[code] || ordinary) return <Fragment key={index}>{part}</Fragment>;
    return document ? <span key={index}>{['Big Five', 'arquetipo'].includes(code) ? part : `${part} (${GLOSSARY[code].name})`}</span> : <Term key={index} code={code} />;
  })}</>;
}
