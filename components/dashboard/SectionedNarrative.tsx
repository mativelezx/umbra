'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CaretDown } from '@phosphor-icons/react';
import {
  Sparkle,
  Wind,
  Mountains,
  Heart,
  Path,
} from '@phosphor-icons/react/dist/ssr';
import { slugFromHeading } from '@/lib/dimensions/narrative-sections';
import { ExplainedText } from '@/components/ui/ExplainedText';
import { ReadingPosition } from './ReadingPosition';
import { ReadingArt } from './ReadingArt';

interface SectionedNarrativeProps {
  content: string;
  streaming?: boolean;
  presentation?: 'reader' | 'document';
}

type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'quote'; text: string };

interface Section {
  heading: string;
  blocks: Block[];
  icon: React.ReactNode;
}

const ICON_BY_HEADING: Array<{ match: RegExp; icon: React.ReactNode }> = [
  { match: /apertura/i, icon: <Sparkle size={22} weight="duotone" /> },
  { match: /cómo te mov|movés|movimient/i, icon: <Wind size={22} weight="duotone" /> },
  { match: /cuesta|tens|sombra/i, icon: <Mountains size={22} weight="duotone" /> },
  { match: /mueve|arquet|valores/i, icon: <Heart size={22} weight="duotone" /> },
  { match: /explorar|camino|queda/i, icon: <Path size={22} weight="duotone" /> },
];

function iconForHeading(heading: string): React.ReactNode {
  for (const { match, icon } of ICON_BY_HEADING) {
    if (match.test(heading)) return icon;
  }
  return <Sparkle size={22} weight="duotone" />;
}

/**
 * Splits a section body into blocks: regular paragraphs and blockquote
 * "pull quotes" (lines prefixed with `> ` in the source markdown). Pull
 * quotes are rendered as large visual callouts that break the prose flow.
 */
function parseBlocks(body: string): Block[] {
  const trimmed = body.trim();
  if (trimmed.length === 0) return [];

  // Split on double newlines to get logical paragraphs; each chunk is
  // either a blockquote (every line starts with `> `) or a paragraph.
  const chunks = trimmed.split(/\n{2,}/);
  const blocks: Block[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const allQuote = lines.every((line) => /^>\s*/.test(line));
    if (allQuote) {
      const text = lines
        .map((line) => line.replace(/^>\s?/, ''))
        .join(' ')
        .trim();
      if (text.length > 0) {
        blocks.push({ kind: 'quote', text });
      }
      continue;
    }
    // Mixed or pure paragraph — join contiguous non-quote lines as a single
    // paragraph. Any embedded quote line within a paragraph-looking chunk
    // is unusual; for robustness, we strip the leading `> ` and keep it as
    // part of the paragraph.
    const text = lines
      .map((line) => (line.startsWith('> ') ? line.replace(/^>\s?/, '') : line))
      .join(' ')
      .trim();
    if (text.length > 0) {
      blocks.push({ kind: 'paragraph', text });
    }
  }

  return blocks;
}

/**
 * Parses narrative markdown into sections. Expects the narrative to start
 * with `## Heading` lines. If the narrative has no markdown headers (legacy
 * format or streaming partial), falls back to rendering the whole thing as
 * one section without an icon.
 */
function parseSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentHeading: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (currentHeading !== null || currentBody.join('').trim()) {
      sections.push({
        heading: currentHeading ?? '',
        blocks: parseBlocks(currentBody.join('\n')),
        icon: iconForHeading(currentHeading ?? ''),
      });
    }
    currentHeading = null;
    currentBody = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+?)\s*$/);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[1];
      continue;
    }
    currentBody.push(line);
  }
  flush();

  // Fallback: no sections found, treat the whole thing as one untitled section
  if (sections.length === 0 && content.trim().length > 0) {
    sections.push({
      heading: '',
      blocks: parseBlocks(content),
      icon: <Sparkle size={22} weight="duotone" />,
    });
  }

  return sections;
}

export function SectionedNarrative({
  content,
  streaming = false,
  presentation = 'reader',
}: SectionedNarrativeProps) {
  const sections = parseSections(content);
  const [selected, setSelected] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [copyState, setCopyState] = useState('');
  const passageRef = useRef<HTMLDivElement>(null);
  const focusPending = useRef(false);
  const current = Math.min(selected, Math.max(0, sections.length - 1));
  const guided = presentation === 'reader' && sections.length > 1 && !streaming && !showAll;
  const visibleSections = guided ? [sections[current]] : sections;

  function goTo(index: number) {
    focusPending.current = true;
    setSelected(index);
    setCopyState('');
  }
  useLayoutEffect(() => {
      if (!focusPending.current) return;
      focusPending.current = false;
      const passage = passageRef.current;
      if (!passage) return;
      passage.focus({ preventScroll: true });
      const heading = passage.querySelector('h3') ?? passage;
      const bounds = heading.getBoundingClientRect();
      if (bounds.top < 24 || bounds.bottom > window.innerHeight - 96) {
        passage.scrollIntoView?.({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
  }, [current, showAll]);

  const renderBlock = (block: Block, index: number) => block.kind === 'quote'
    ? <blockquote key={index} className="reading-quote"><span className="not-italic"><ExplainedText text={block.text} document={presentation === 'document'} /></span></blockquote>
    : <p key={index} className={index > 0 ? 'mt-4' : ''}><ExplainedText text={block.text} document={presentation === 'document'} /></p>;

  return (
    <div className={presentation === 'document' ? 'reading-document' : 'reading-journey'}>
      {presentation === 'reader' && sections.length > 1 && !streaming && <details className="chapter-index"><summary>Explorá los capítulos <span>{sections.length} miradas</span><CaretDown size={20} aria-hidden="true" /></summary><nav aria-label="Capítulos de tu lectura">{sections.map((section, index) => <button key={`${section.heading}-${index}`} type="button" aria-current={index === current && !showAll ? 'step' : undefined} onClick={() => { setShowAll(false); goTo(index); }}>{section.icon}<span>{section.heading || 'Tu lectura'}</span><ArrowRight size={18} aria-hidden="true" /></button>)}</nav></details>}
      {presentation === 'reader' && sections.length > 1 && !streaming && <div className="reading-controls">
        <p className="text-sm text-text-3" aria-live="polite">{showAll ? 'Lectura completa' : `Sección ${current + 1} de ${sections.length}`}</p>
        <button className="quiet-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Leer por secciones' : 'Ver lectura completa'}</button>
      </div>}
      {presentation === 'reader' && !streaming && <ReadingPosition revision={`${guided ? current : 'all'}-${content.length}`} />}
      <div ref={passageRef} tabIndex={-1} className="reading-passage" key={guided ? current : 'all'}>
      {visibleSections.map((section, i) => (
        <section
          key={`${i}-${section.heading}`}
          id={section.heading ? slugFromHeading(section.heading) : undefined}
          className="narrative-chapter scroll-mt-24"
        >
          <div className={presentation === 'document' ? 'chapter-lead' : undefined}>
          <div className="chapter-opening"><div>{section.heading && <h3 className="reading-heading">{section.heading}</h3>}<p className="chapter-invitation">{['Una primera mirada, no una etiqueta.', 'Observá qué te resulta cercano.', 'Una posibilidad para mirar con curiosidad.', 'Qué vale la pena para vos.', 'De la lectura a un paso posible.'][(guided ? current : i) % 5]}</p></div><ReadingArt chapter={guided ? current : i} /></div>
          {presentation === 'document' && section.blocks[0] && <div className="reading-copy">{renderBlock(section.blocks[0], 0)}</div>}
          </div>
          <div
            className={`reading-copy ${
              section.heading ? 'mt-3' : ''
            }`}
          >
            {(presentation === 'document' ? section.blocks.slice(1) : section.blocks).map(renderBlock)}
          </div>
        </section>
      ))}
      </div>
      {presentation === 'reader' && !streaming && <div className="reading-takeaway"><p>No hace falta que todo encaje con vos.<br /><strong>¿Qué idea te gustaría seguir pensando?</strong></p><button type="button" className="quiet-button" onClick={async () => {
        try { await navigator.clipboard.writeText(visibleSections.map(section => [section.heading, ...section.blocks.map(block => block.text)].join('\n\n')).join('\n\n')); setCopyState('Texto copiado. Podés pegarlo en tus notas.'); }
        catch { setCopyState('No se pudo copiar. Podés seleccionar el texto y copiarlo manualmente.'); }
      }}>Copiar esta lectura</button><p role="status" className="text-sm">{copyState}</p></div>}
      {guided && <div className="reading-navigation">
        <button type="button" className="quiet-button" disabled={current === 0} onClick={() => goTo(current - 1)} aria-label="Sección anterior"><ArrowLeft size={20} /> Anterior</button>
        {current < sections.length - 1 ? <button type="button" className="focus-button" onClick={() => goTo(current + 1)} aria-label="Siguiente sección">Seguir leyendo <ArrowRight size={20} /></button> : <p className="text-sm text-text-2">La lectura termina acá. Podés volver cuando quieras.</p>}
      </div>}
      {streaming && (
        <span className="inline-block h-5 w-0.5 animate-pulse self-start bg-violet-400" />
      )}
    </div>
  );
}
