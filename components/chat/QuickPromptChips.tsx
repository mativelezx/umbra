import {
  ArrowRight,
  Compass,
  Heart,
  Lightbulb,
  Wind,
} from '@phosphor-icons/react/dist/ssr';
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
 * Plain-language entry points. The server supplies the saved personal context;
 * these buttons must not smuggle unvalidated scores into the user's message.
 */
export function QuickPromptChips({
  onPick,
  compact = false,
}: QuickPromptChipsProps) {
  const prompts = buildPrompts();

  if (compact) {
    return (
      <div
        className="mb-3 flex gap-2 overflow-x-auto pb-1"
        aria-label="Ideas para empezar la conversación"
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
      <p className="font-body text-sm normal-case tracking-normal text-text-3">
        Si no sabés por dónde empezar
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

function buildPrompts(): QuickPrompt[] {
  return [
    {
      label: 'Quiero entender una decisión',
      prompt: 'Quiero pensar una decisión que me cuesta. Haceme una pregunta para empezar por una situación concreta, sin asumir qué me pasa.',
      icon: <Lightbulb size={16} weight="duotone" />,
    },
    {
      label: 'Algo que repito y quiero cambiar',
      prompt: 'Quiero explorar algo que repito y me gustaría cambiar. Pedime un ejemplo cotidiano antes de proponer una interpretación.',
      icon: <Wind size={16} weight="duotone" />,
    },
    {
      label: 'Elegir una actividad para hoy',
      prompt: 'A partir de lo que conté, ayudame a elegir una actividad pequeña para hoy. Explicá qué respuesta mía tomás como referencia y preguntame si la propuesta me sirve.',
      icon: <Heart size={16} weight="duotone" />,
    },
    {
      label: 'Entender mi resultado',
      prompt: 'Explicame mi resultado con palabras simples. Separá lo que conté, lo que respondí en el cuestionario si lo completé y las interpretaciones de IA que puedo cuestionar.',
      icon: <Compass size={16} weight="duotone" />,
    },
  ];
}
