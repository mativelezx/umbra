/**
 * Single source of truth for plain-spanish labels, descriptions, and
 * everyday examples for every psychological dimension Umbra surfaces.
 *
 * Design rule: users don't know what "Ni" or "Ti" means. Every public
 * component should import from here and show `.label` (plain spanish)
 * rather than the enum key. The technical code (Ni, Te, etc.) may
 * appear as a small secondary tag but never as the primary label.
 *
 * Sources kept deliberately short — long academic blocks live in
 * `lib/knowledge/` and feed the analyzer prompt, not the UI.
 */

import type { BigFive, JungFunctions, Archetype } from '@/types';

// ─── Big Five ─────────────────────────────────────────────────

export interface BigFiveLabel {
  /** Label shown prominently in UI */
  label: string;
  /** One-line description, everyday language */
  short: string;
  /** 2-3 sentence explanation for popovers */
  long: string;
  /** Concrete example moments (for tooltips / examples) */
  highExample: string;
  lowExample: string;
}

export const BIG_FIVE_LABELS: Record<keyof BigFive, BigFiveLabel> = {
  openness: {
    label: 'Apertura a lo nuevo',
    short: 'qué tan curioso y abierto estás a ideas, arte, experiencias raras',
    long: 'Indica cuánto te atraen las ideas nuevas, el arte, las preguntas sin respuesta y los caminos que nadie todavía anduvo. No tiene que ver con ser inteligente, sino con preferir lo nuevo por sobre lo ya conocido.',
    highExample:
      'Leés tres libros a la vez, cambiás de género musical cada semana, preguntás por qué pasan las cosas.',
    lowExample:
      'Confías en lo que ya funciona, valorás las rutinas probadas, y no necesitás novedad para disfrutar.',
  },
  conscientiousness: {
    label: 'Responsabilidad',
    short: 'qué tan organizado, disciplinado y orientado a metas sos',
    long: 'Mide cuánto te importa cumplir lo que te proponés, planificar antes de actuar y mantener orden. Alta te hace confiable; muy alta puede rigidizarte. Baja te hace flexible; muy baja te dispersa.',
    highExample:
      'Tenés listas, respetás deadlines, y cuando decís que vas a hacer algo lo hacés.',
    lowExample:
      'Te movés por impulso y contexto, las listas te cargan más que te ordenan.',
  },
  extraversion: {
    label: 'Cuánto salís al mundo',
    short: 'si la energía social te recarga o te cansa',
    long: 'No es ser tímido o extrovertido: es dónde recargás batería. Alta: te cargás con gente y acción. Baja: necesitás silencio y tiempo a solas para volver a vos mismo.',
    highExample:
      'Después de una reunión grande salís con más energía que cuando entraste.',
    lowExample:
      'Después de un día social necesitás un rato a solas, un libro o una caminata sin objetivo.',
  },
  agreeableness: {
    label: 'Calidez con los demás',
    short: 'qué tan cálido, cooperativo y empático sos con el otro',
    long: 'Medís cuánto priorizás la armonía y la conexión con otros por sobre imponer tu punto de vista. Alta: leés el clima emocional del grupo. Baja: decís lo que pensás aunque incomode.',
    highExample:
      'Cuando alguien está mal lo notás antes de que hable y te ofrecés sin preguntar.',
    lowExample:
      'Priorizás la verdad directa aunque sea incómoda por sobre la cordialidad.',
  },
  neuroticism: {
    label: 'Sensibilidad emocional',
    short: 'qué tan intensa es tu experiencia emocional interna',
    long: 'No es debilidad: es el volumen con el que vivís las emociones. Alta: sentís todo fuerte, lo lindo y lo feo. Baja: tu centro es estable incluso cuando todo se mueve.',
    highExample:
      'Una canción te puede hacer llorar y una crítica te puede doler tres días.',
    lowExample:
      'Cuando todo el mundo se está volviendo loco, vos seguís respirando tranquilo.',
  },
};

// ─── Jung cognitive functions ─────────────────────────────────

export interface JungLabel {
  /** The canonical Jung code (Ni, Te, etc.) — used only as a sidebar badge */
  code: keyof JungFunctions;
  /** Primary plain-spanish label shown in UI */
  label: string;
  /** One-line vibe */
  short: string;
  /** 2-3 sentence explanation */
  long: string;
  /** Everyday example for tooltips */
  example: string;
  /** Which axis this function belongs to */
  axis: 'sensorial' | 'intuitivo' | 'pensamiento' | 'sentimiento';
  /** Direction on the axis */
  direction: 'hacia afuera' | 'hacia adentro';
}

export const JUNG_LABELS: Record<keyof JungFunctions, JungLabel> = {
  Se: {
    code: 'Se',
    label: 'Presente en vivo',
    short: 'atención al estímulo concreto del momento',
    long: 'Te hacés presente en lo que está pasando acá y ahora. El cuerpo, el aroma, el color, el detalle concreto. Preferís la experiencia directa por sobre la teoría.',
    example:
      'Alguien que cocina por instinto, que sabe si una fruta está madura por cómo la toca.',
    axis: 'sensorial',
    direction: 'hacia afuera',
  },
  Si: {
    code: 'Si',
    label: 'Memoria del cuerpo',
    short: 'rutinas, tradiciones, lo que tu cuerpo ya sabe',
    long: 'Tu cuerpo se acuerda de lo que te hizo bien y lo que no. Valorás las rutinas probadas, las tradiciones, lo familiar. Construís estabilidad con pequeños rituales.',
    example:
      'Volver al mismo café cada mañana porque ya sabés exactamente cómo te va a caer.',
    axis: 'sensorial',
    direction: 'hacia adentro',
  },
  Ne: {
    code: 'Ne',
    label: 'Chispa de posibilidades',
    short: 'asociaciones, ideas nuevas, "y si...?"',
    long: 'Tu mente salta de una cosa a otra encontrando conexiones que nadie vio. Vivís en modo "¿y si...?". A veces demasiadas ideas al mismo tiempo.',
    example:
      'Ver un cuadro y pensar en cinco proyectos diferentes que podrías empezar.',
    axis: 'intuitivo',
    direction: 'hacia afuera',
  },
  Ni: {
    code: 'Ni',
    label: 'Visión interna',
    short: 'síntesis, patrones ocultos, "sé cómo va a terminar esto"',
    long: 'Ves patrones que otros todavía no notan. Una imagen interna se va formando sola y cuando aparece, parece obvia aunque nadie más la tenga. Te adelantás al futuro por ver el presente profundo.',
    example:
      'Saber dos meses antes que una relación va a terminar sin poder explicar bien por qué.',
    axis: 'intuitivo',
    direction: 'hacia adentro',
  },
  Te: {
    code: 'Te',
    label: 'Motor de eficiencia',
    short: 'lógica aplicada, "hagamos que esto funcione"',
    long: 'Mirás lo que hay afuera y decís "¿cómo lo hacemos andar?". Estructuras sistemas, delegás, medís resultados. Te importa que algo funcione más que que sea perfecto por dentro.',
    example:
      'Reorganizar el workflow de un equipo entero porque viste que se repetían pasos.',
    axis: 'pensamiento',
    direction: 'hacia afuera',
  },
  Ti: {
    code: 'Ti',
    label: 'Lógica interna',
    short: 'coherencia propia, "¿esto tiene sentido por dentro?"',
    long: 'Tenés un sistema interno de principios donde cada pieza tiene que encajar. Preferís entender una cosa del todo antes que moverte a la siguiente. La verdad por sobre el resultado.',
    example:
      'Quedarte despierto hasta tarde porque encontraste un bug que rompía tu modelo mental.',
    axis: 'pensamiento',
    direction: 'hacia adentro',
  },
  Fe: {
    code: 'Fe',
    label: 'Empatía grupal',
    short: 'leer y ajustar el clima emocional del grupo',
    long: 'Sentís cuando alguien está incómodo antes de que lo diga. Ajustás tu tono al clima emocional del grupo. Cuidás que todos estén bien aunque nadie te lo pida.',
    example:
      'En una cena, darte cuenta que alguien se está sintiendo de más y hacerlo parte de la conversación.',
    axis: 'sentimiento',
    direction: 'hacia afuera',
  },
  Fi: {
    code: 'Fi',
    label: 'Brújula de valores',
    short: 'ética privada, "¿esto va con quién soy yo?"',
    long: 'Tenés una ética interna muy fuerte que no siempre explicás. Si algo va contra tus valores, lo vetás sin poder articular del todo por qué. Autenticidad por sobre aprobación.',
    example:
      'Renunciar a una oportunidad importante porque no encaja con lo que sos.',
    axis: 'sentimiento',
    direction: 'hacia adentro',
  },
};

/** Plain-spanish name for each Jung axis (shown in the dashboard) */
export const JUNG_AXIS_LABEL: Record<JungLabel['axis'], string> = {
  sensorial: 'Modo sensorial',
  intuitivo: 'Modo intuitivo',
  pensamiento: 'Modo pensamiento',
  sentimiento: 'Modo sentimiento',
};

/** 1-line explanation of each axis, for tooltip */
export const JUNG_AXIS_DESCRIPTION: Record<JungLabel['axis'], string> = {
  sensorial: 'Cómo captás lo concreto: el momento presente vs la memoria del cuerpo',
  intuitivo: 'Cómo captás lo abstracto: posibilidades externas vs visión interna',
  pensamiento: 'Cómo decidís con lógica: eficiencia aplicada vs coherencia propia',
  sentimiento: 'Cómo decidís con valores: armonía grupal vs ética privada',
};

// ─── Big Five positioning bucket ──────────────────────────────

/**
 * Convert a 0-100 score into a contextual phrase. Lets us say "en el
 * 15% más alto" instead of just "78/100". Calibrated loosely against
 * the distribution we expect from IPIP-NEO passes.
 */
export function bigFivePosition(
  key: keyof BigFive,
  value: number,
): { bucket: 'high' | 'mid' | 'low'; phrase: string } {
  if (value >= 70) {
    const phrases: Record<keyof BigFive, string> = {
      openness: 'Entre los más curiosos',
      conscientiousness: 'Muy disciplinado',
      extraversion: 'Vas al mundo con fuerza',
      agreeableness: 'Cálido y cooperativo',
      neuroticism: 'Sensibilidad intensa',
    };
    return { bucket: 'high', phrase: phrases[key] };
  }
  if (value <= 30) {
    const phrases: Record<keyof BigFive, string> = {
      openness: 'Preferís lo probado',
      conscientiousness: 'Espontáneo, sin listas',
      extraversion: 'Necesitás tu silencio',
      agreeableness: 'Directo, sin edulcorar',
      neuroticism: 'Centro estable',
    };
    return { bucket: 'low', phrase: phrases[key] };
  }
  return { bucket: 'mid', phrase: 'En el medio' };
}

// ─── Archetype UI labels already live in types/index.ts ──────
// (ARCHETYPE_INFO there has name + description + icon). Keeping
// the re-export here so all dimension labels come from one place.

export type { Archetype };
export { ARCHETYPE_INFO } from '@/types';
