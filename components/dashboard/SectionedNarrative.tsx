import {
  Sparkle,
  Wind,
  Mountains,
  Heart,
  Path,
} from '@phosphor-icons/react/dist/ssr';

interface SectionedNarrativeProps {
  content: string;
  streaming?: boolean;
}

interface Section {
  heading: string;
  body: string;
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
        body: currentBody.join('\n').trim(),
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
      body: content.trim(),
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
          className="relative border-l border-violet-400/15 pl-6 md:pl-8"
        >
          <div className="absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-violet-400/40 bg-umbra-void text-violet-300">
            {section.icon}
          </div>
          {section.heading && (
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-3">
              {section.heading}
            </h3>
          )}
          <div
            className={`font-display italic text-text-1 ${
              section.heading ? 'mt-3' : ''
            } text-lg leading-[1.85] md:text-xl md:leading-[1.75]`}
          >
            {section.body.split(/\n{2,}/).map((paragraph, idx) => (
              <p key={idx} className={idx > 0 ? 'mt-4' : ''}>
                {idx === 0 && i === 0 && paragraph.length > 0 ? (
                  <>
                    <span className="float-left mr-2 mt-1 font-display text-5xl leading-none italic text-violet-300 md:text-6xl">
                      {paragraph.charAt(0)}
                    </span>
                    {paragraph.slice(1)}
                  </>
                ) : (
                  paragraph
                )}
              </p>
            ))}
          </div>
        </section>
      ))}
      {streaming && (
        <span className="inline-block h-5 w-0.5 animate-pulse self-start bg-violet-400" />
      )}
    </div>
  );
}
