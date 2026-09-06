import {
  Sparkle,
  Wind,
  Mountains,
  Heart,
  Path,
} from '@phosphor-icons/react/dist/ssr';
import { slugFromHeading } from '@/lib/dimensions/narrative-sections';

interface SectionedNarrativeProps {
  content: string;
  streaming?: boolean;
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
    if (currentHeading !== null) {
      sections.push({
        heading: currentHeading,
        blocks: parseBlocks(currentBody.join('\n')),
        icon: iconForHeading(currentHeading),
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
    if (currentHeading !== null) {
      currentBody.push(line);
    }
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
}: SectionedNarrativeProps) {
  const sections = parseSections(content);

  return (
    <div className="flex flex-col gap-10">
      {sections.map((section, i) => (
        <section
          key={`${i}-${section.heading}`}
          id={section.heading ? slugFromHeading(section.heading) : undefined}
          className="scroll-mt-24"
        >
          {section.heading && (
            <h3 className="text-xl font-semibold text-text-1">
              {section.heading}
            </h3>
          )}
          <div
            className={`font-body font-normal text-text-2 ${
              section.heading ? 'mt-3' : ''
            } max-w-[70ch] text-base leading-[1.85] md:text-lg md:leading-[1.8]`}
          >
            {section.blocks.map((block, idx) => {
              if (block.kind === 'quote') {
                return (
                  <blockquote
                    key={idx}
                    className="my-6 border-l border-violet-400/40 pl-5 text-lg font-medium text-text-1"
                  >
                    <span className="not-italic">{block.text}</span>
                  </blockquote>
                );
              }
              return (
                <p key={idx} className={idx > 0 ? 'mt-4' : ''}>
                  {block.text}
                </p>
              );
            })}
          </div>
        </section>
      ))}
      {streaming && (
        <span className="inline-block h-5 w-0.5 animate-pulse self-start bg-violet-400" />
      )}
    </div>
  );
}
