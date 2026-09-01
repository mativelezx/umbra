import {
  ArrowRight,
  Compass,
  Heart,
  Lightbulb,
  Wind,
} from '@phosphor-icons/react/dist/ssr';
import {
  quantitativeDimensions,
  RIDGE_V1_STATUS,
} from '@/lib/profile/dimension-display';
import { JUNG_LABELS, BIG_FIVE_LABELS } from '@/lib/dimensions/labels';
import type { JungFunctions } from '@/types';
import type { ChatShellProfile } from './ChatShell';

interface QuickPromptChipsProps {
  profile: ChatShellProfile;
  onPick: (prompt: string) => void;
  /**
   * Compact mode: horizontal scroll strip of small chips, meant to sit
   * above the ChatInput during an active conversation. Non-compact is
   * the hero layout used when the chat is empty. PAIR Feedback + Control:
   * prompts remain accessible mid-conversation so the user never runs out
   * of entry points into the mirror.
   */
  compact?: boolean;
}

interface QuickPrompt {
  /** What the user SEES — plain spanish, zero jargon */
  label: string;
  /** What actually gets sent to Claude — can include the technical hint */
  prompt: string;
  icon: React.ReactNode;
}

/**
 * 4 suggested opening prompts, generated from the profile. The labels the
 * user sees are fully plain-spanish. The prompts we actually send include
 * the technical Jung/Big Five hint so Claude grounds the conversation
 * in the user's real profile.
 */
export function QuickPromptChips({
  profile,
  onPick,
  compact = false,
}: QuickPromptChipsProps) {
  const prompts = buildPrompts(profile);

  if (compact) {
    return (
      <div
        className="mb-3 flex gap-2 overflow-x-auto pb-1"
        aria-label="Sugerencias de prompts basadas en tu perfil"
      >
        {prompts.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(p.prompt)}
            className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-violet-400/15 bg-umbra-shadow/40 px-3 py-1.5 font-body text-xs text-text-2 transition-all duration-200 hover:border-violet-400/40 hover:bg-violet-400/5 hover:text-text-1"
          >
            <span className="text-violet-300 transition-transform duration-200 group-hover:scale-110">
              {p.icon}
            </span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-3">
        Atajos para empezar
      </p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {prompts.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(p.prompt)}
            className="group flex items-center justify-between gap-3 rounded-lg border border-violet-400/10 bg-umbra-shadow/40 px-4 py-3 text-left transition-all duration-200 hover:border-violet-400/40 hover:bg-violet-400/5"
          >
            <span className="flex items-center gap-3">
              <span className="text-violet-300 transition-transform duration-200 group-hover:scale-110">
                {p.icon}
              </span>
              <span className="font-body text-sm text-text-2 group-hover:text-text-1">
                {p.label}
              </span>
            </span>
            <ArrowRight
              size={14}
              weight="bold"
              className="text-text-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-violet-200"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function buildPrompts(profile: ChatShellProfile): QuickPrompt[] {
  const jungSorted = Object.entries(profile.jungFunctions).sort(
    ([, a], [, b]) => b - a,
  );
  const topJungKey = jungSorted[0][0] as keyof JungFunctions;
  const weakJungKey = jungSorted[jungSorted.length - 1][0] as keyof JungFunctions;

  const topJung = JUNG_LABELS[topJungKey];
  const weakJung = JUNG_LABELS[weakJungKey];

  // Solo las dimensiones que el módulo midió con confianza pueden
  // afirmarse (con o sin cifra) en los accesos rápidos del chat.
  const status = profile.perDimensionStatus ?? RIDGE_V1_STATUS;
  const measured = quantitativeDimensions(status);
  const bfSorted = (Object.entries(profile.bigFive) as Array<[keyof typeof profile.bigFive, number]>)
    .filter(([k]) => measured.includes(k))
    .sort(([, a], [, b]) => b - a);
  const topBfKey = bfSorted[0]?.[0] ?? null;
  const topBfLabel = topBfKey ? BIG_FIVE_LABELS[topBfKey] : null;
  const neuroticismMeasured = status.neuroticism === 'ok';
  const maxNeuroticism = profile.bigFive.neuroticism;

  const prompts: QuickPrompt[] = [
    {
      label: `Cómo se ve mi ${topJung.label.toLowerCase()} en el día a día`,
      prompt: `Según mi perfil, mi función dominante es "${topJung.label}" (${topJung.code}, valor ${jungSorted[0][1]}/100). ¿Qué patrones de esa forma de pensar suelen aparecer en el día a día? Dame ejemplos concretos, sin jerga técnica.`,
      icon: <Lightbulb size={16} weight="duotone" />,
    },
    {
      label: `La tensión entre mi ${topJung.label.toLowerCase()} y mi ${weakJung.label.toLowerCase()}`,
      prompt: `Mi función más fuerte es "${topJung.label}" (${topJung.code}) y la más débil es "${weakJung.label}" (${weakJung.code}). ¿Qué tensión interna produce eso en mí y cómo la integro mejor? Respondé con tono cálido, sin terminología académica.`,
      icon: <Wind size={16} weight="duotone" />,
    },
  ];

  if (neuroticismMeasured && maxNeuroticism > 55) {
    prompts.push({
      label: 'Una práctica para bajar la intensidad emocional',
      prompt: 'Mi perfil sugiere una sensibilidad emocional alta. ¿Qué práctica concreta y chica me recomendás para empezar a regularla esta semana? Evitá consejos genéricos.',
      icon: <Heart size={16} weight="duotone" />,
    });
  } else if (topBfKey && topBfLabel) {
    prompts.push({
      label: `Cómo aprovechar mi ${topBfLabel.label.toLowerCase()}`,
      prompt: `Mi ${topBfLabel.label.toLowerCase()} es mi dimensión medida con más señal. ¿Cómo puedo aprovecharla más conscientemente en mi trabajo o relaciones? Dame 2 o 3 movimientos concretos.`,
      icon: <Heart size={16} weight="duotone" />,
    });
  }

  prompts.push({
    label: 'Exploremos una sombra que me cuesta ver',
    prompt:
      'Quiero explorar una sombra de mi perfil: un patrón que repito sin darme cuenta y que ya me cuesta. Hacé una pregunta que me lleve a verla, basándote en mi perfil.',
    icon: <Compass size={16} weight="duotone" />,
  });

  return prompts.slice(0, 4);
}
