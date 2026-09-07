import type {
  Archetype,
  BigFive,
  JungFunctions,
  PsychologicalProfile,
} from '@/types';

/**
 * Demo seed data — used when NEXT_PUBLIC_DEMO_MODE=true.
 *
 * This lets the developer walk through the full UI without a real Supabase
 * project or Anthropic API key. Every server component and API route that
 * reads user state falls back to this seed when no session is present.
 *
 * Build for a coherent "sage" archetype profile: high Openness, moderate
 * Conscientiousness, introverted (low Extraversion), high Agreeableness,
 * med-high Neuroticism (sensitive). Dominant functions: Ni + Ti.
 */

export const DEMO_USER = {
  id: 'demo-user-0000-0000-000000000001',
  email: 'demo@umbra.local',
  full_name: 'Ana Demo',
  created_at: '2026-03-15T10:00:00Z',
} as const;

export const DEMO_BIG_FIVE: BigFive = {
  openness: 82,
  conscientiousness: 68,
  extraversion: 34,
  agreeableness: 74,
  neuroticism: 61,
};

export const DEMO_JUNG_FUNCTIONS: JungFunctions = {
  Se: 28,
  Si: 52,
  Ne: 64,
  Ni: 86, // dominant
  Te: 45,
  Ti: 78, // dominant
  Fe: 41,
  Fi: 70,
};

export const DEMO_ARCHETYPE: Archetype = 'sage';
export const DEMO_ARCHETYPE_SECONDARY = 'El Creador';

export const DEMO_PROFILE_ID = 'demo-profile-0000-0000-000000000001';

export const DEMO_PROFILE: PsychologicalProfile = {
  id: DEMO_PROFILE_ID,
  userId: DEMO_USER.id,
  bigFive: DEMO_BIG_FIVE,
  jungFunctions: DEMO_JUNG_FUNCTIONS,
  archetype: DEMO_ARCHETYPE,
  archetypeSecondary: DEMO_ARCHETYPE_SECONDARY,
  inputMode: 'dynamic',
  inputTexts: ['demo input text para visualización'],
  createdAt: '2026-04-13T00:00:00Z',
  updatedAt: '2026-04-13T00:00:00Z',
};

export const DEMO_NARRATIVE = `## Apertura

En los textos ficticios de este ejemplo, Ana cuenta que disfruta leer, pensar antes de elegir y compartir tiempo con personas cercanas. Es un punto de partida para reflexionar, no una descripción definitiva de su personalidad.

Esta lectura propone distintas maneras de mirar esas escenas. No hace falta reconocerse en todo: una interpretación también puede servir para descubrir qué no encaja.

## Cómo te movés por el mundo

Una pregunta que surge del ejemplo es qué lugar tiene la pausa antes de una decisión. A veces pensar ayuda a ordenar una idea; otras veces puede resultar útil probar algo pequeño y observar qué sucede.

La lectura inspirada en Jung ofrece palabras para conversar sobre esas preferencias. No permite afirmar cómo funciona la mente de una persona ni asignarle una identidad fija.

## Lo que te cuesta

El ejemplo menciona una tensión cotidiana: querer entender algo y, al mismo tiempo, tener que decidir sin toda la información. Se puede explorar esa tensión sin convertirla en un defecto o en un rasgo medido.

¿Qué situaciones admiten una pausa? ¿Cuáles permiten una prueba sencilla y reversible? Las respuestas pertenecen a quien lee, no al sistema.

## Lo que te mueve

La figura del Sabio se usa aquí como recurso narrativo para hablar de curiosidad y búsqueda de sentido. El Creador aporta otra imagen posible: darle forma a una idea. Ambas son propuestas simbólicas, no resultados psicométricos.

Si ninguna de estas imágenes resulta cercana, se pueden dejar de lado. La utilidad de esta sección está en las preguntas que abre, no en aceptar una etiqueta.

## Lo que queda por explorar

Podés elegir una actividad, conversar sobre una parte de la lectura o terminar acá. Una propuesta pequeña podría ser anotar algo que te llamó la atención durante el día y preguntarte por qué.

No hay un puntaje de autoconocimiento ni una forma correcta de completar este recorrido. Esta lectura termina acá; lo que quieras hacer con ella lo decidís vos.`;

interface DemoPlanArea {
  id: string;
  name: string;
  rationale: string;
  actions: Array<{
    id: string;
    title: string;
    description: string;
    microGoals: Array<{
      id: string;
      text: string;
      completed: boolean;
    }>;
  }>;
}

export const DEMO_PLAN: { areas: DemoPlanArea[] } = {
  areas: [
    {
      id: 'area-0',
      name: 'Prestar atención al presente',
      rationale:
        'El ejemplo propone explorar la atención a lo cotidiano. Es una posibilidad de reflexión, no una conclusión sobre capacidades o funciones cognitivas.',
      actions: [
        {
          id: 'area-0-action-0',
          title: 'Caminata sin destino',
          description:
            'Si te resulta cómodo, elegí un paseo breve y prestá atención a un detalle: una textura, un sonido o la luz.',
          microGoals: [
            { id: 'a0a0g0', text: 'Caminar 3 veces por semana durante 4 semanas', completed: false },
            { id: 'a0a0g1', text: 'Sin auriculares, sin notificaciones', completed: false },
            { id: 'a0a0g2', text: 'Anotar al volver solo una cosa que te sorprendió (1 frase)', completed: false },
          ],
        },
        {
          id: 'area-0-action-1',
          title: 'Comer con atención',
          description:
            'Podés dedicar un momento de una comida a notar su sabor y textura, sin exigirte una forma particular de hacerlo.',
          microGoals: [
            { id: 'a0a1g0', text: 'Al menos 1 comida al día sin pantalla durante 2 semanas', completed: false },
            { id: 'a0a1g1', text: 'Terminar la comida antes de chequear el celular', completed: false },
          ],
        },
      ],
    },
    {
      id: 'area-1',
      name: 'Hacer lugar a una conversación',
      rationale:
        'En el texto ficticio aparecen vínculos cercanos. Esta propuesta invita a elegir si hay algo que te gustaría compartir con una persona de confianza, sin obligación de hacerlo.',
      actions: [
        {
          id: 'area-1-action-0',
          title: 'Una conversación profunda por semana',
          description:
            'Si querés, compartí una pregunta o una idea con alguien de confianza. Elegí el momento y el medio que prefieras.',
          microGoals: [
            { id: 'a1a0g0', text: '1 conversación profunda semanal durante 6 semanas', completed: false },
            { id: 'a1a0g1', text: 'Anotar cómo te sentiste después (1 palabra)', completed: false },
          ],
        },
        {
          id: 'area-1-action-1',
          title: 'Pedir ayuda con una cosa chica',
          description:
            'Si hay algo concreto para lo que te serviría compañía, podés pedir una ayuda pequeña a alguien de confianza.',
          microGoals: [
            { id: 'a1a1g0', text: 'Identificar 1 cosa donde podrías pedir ayuda', completed: false },
            { id: 'a1a1g1', text: 'Pedir la ayuda realmente', completed: false },
            { id: 'a1a1g2', text: 'Notar qué se sintió distinto', completed: false },
          ],
        },
      ],
    },
    {
      id: 'area-2',
      name: 'Dar forma a lo que pensás',
      rationale:
        'La imagen del Creador se usa como invitación simbólica a expresar una idea. Escribir es una opción; no se afirma que necesites hacerlo ni que vaya a producir un efecto determinado.',
      actions: [
        {
          id: 'area-2-action-0',
          title: 'Journal de 10 minutos',
          description:
            'Podés reservar unos minutos para escribir sobre algo que te interesó. El texto es tuyo: elegí cuánto escribir y si querés volver a leerlo.',
          microGoals: [
            { id: 'a2a0g0', text: 'Escribir 5 noches por semana durante 4 semanas', completed: false },
            { id: 'a2a0g1', text: 'No releer nada hasta la semana 5', completed: false },
            { id: 'a2a0g2', text: 'Semana 5: leer todo de corrido y marcar lo que te sorprendió', completed: false },
          ],
        },
      ],
    },
  ],
};

export const DEMO_CARTA_LETTER = {
  id: 'demo-carta-0000-0000-000000000001',
  content:
    'Hola yo. Cuando leas esto van a haber pasado seis meses. Quiero que recuerdes tres cosas. Primero: que la claridad no siempre llega cuando la buscás, a veces llega cuando dejás de buscarla. Segundo: que no estás sola aunque a veces te sientas así. Hay gente que te quiere ver, dejalos. Tercero: que lo que estás aprendiendo ahora sobre habitar el presente no es algo que se termina. Es un músculo. Acordate de ejercitarlo. Te quiero.',
  written_at: '2026-04-13T00:00:00Z',
  unlock_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
};

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}
