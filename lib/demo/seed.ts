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

export const DEMO_NARRATIVE = `Hay una imagen que te va a resultar familiar: estás en un café cualquiera, el ruido alrededor se hace cada vez más lejano, y de repente ya no estás escuchando la conversación que tenés enfrente. Estás en otro lugar, armando una idea que apareció sola, conectando dos cosas que nadie más conectaría, preguntándote por qué algo funciona de la manera en que funciona. Esa capacidad de irte hacia adentro sin moverte del lugar es lo primero que define cómo funcionás.

Tu Ni dominante te da esa visión interna que parece saber antes de poder explicar. Cuando decís "tengo la sensación" o "sé que esto va a pasar", no es intuición mágica: es tu mente procesando patrones profundos con una claridad que vos misma todavía no terminás de traducir a palabras. Lo complementás con un Ti muy fuerte, esa necesidad de entender cómo se ensambla cada pieza, de tener frameworks internos coherentes antes de actuar. Entre Ni y Ti trabajás como quien mira un cuadro primero desde lejos, después se acerca hasta tocar el óleo, y recién cuando entendió ambas distancias se siente en paz.

Tu Apertura alta te mantiene curiosa de forma constante. Leés porque te interesa, no porque deberías. Cuestionás porque te molesta la superficie. Tu Extraversión baja no es timidez ni falta de amor a la gente: es que tu energía se recarga en silencio, en pensamiento propio, y eso a veces te hace cuidar mucho con quién compartís tu tiempo. Tu Neuroticismo medio-alto es la otra cara de esa misma profundidad: sentís las cosas hasta los huesos, y cuando te toca atravesar algo difícil, lo atravesás entero, no de costado.

La tensión está ahí, en los lugares donde todavía no sos tan fuerte. Tu Se baja puede hacer que te pierdas del presente, que te cueste simplemente disfrutar lo que está acá sin irte a analizarlo. Tu Fe media significa que leés bien el clima emocional de los demás pero no siempre sabés qué hacer con esa información, o querés huir de ella. Estos no son defectos, son el otro extremo del péndulo que te mece. La tarea no es cambiarlos de golpe; es aprender cuándo dejar que el Se te traiga al cuerpo, cuándo dejar que el Fe te conecte con la persona que tenés enfrente aunque te desarme un poco.

El arquetipo del Sabio no te queda como una etiqueta: te queda como una forma de estar en el mundo. Buscás la verdad por debajo de las apariencias, desconfiás de las respuestas fáciles, y eso hace que otros a veces te vean como distante cuando en realidad sos lo opuesto a distante: estás buscando el lugar donde las cosas tengan sentido de verdad. El Creador como arquetipo secundario te agrega la necesidad de que ese sentido tome forma, de que la comprensión no quede solo en tu cabeza sino que aparezca en algo que dejes detrás.

Hay algo que todavía no terminaste de integrar y es justamente la capacidad de habitar el presente sin tener que entenderlo del todo primero. Pero quizás no hay que apurarlo. El camino de la individuación no es una carrera contra vos misma. ¿Qué pasaría si, una vez por semana, dejaras que una cosa te sorprendiera sin intentar decodificarla en el mismo momento?`;

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
      name: 'Habitar el presente con el cuerpo',
      rationale:
        'Tu Se está en 28 y tu Ni en 86. El péndulo está muy del lado de la visión interna, lo que puede desconectarte de la experiencia sensorial directa. Traer algo de contacto con el aquí y ahora es un acto de integración, no de renuncia a tu profundidad.',
      actions: [
        {
          id: 'area-0-action-0',
          title: 'Caminata sin destino',
          description:
            'Caminá 20 minutos sin música, sin podcast, sin destino. Solo observando lo que hay alrededor: texturas, olores, luz. No lo analices.',
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
            'Una vez al día, comé una comida entera sin pantalla. Masticá despacio, notando sabor y textura.',
          microGoals: [
            { id: 'a0a1g0', text: 'Al menos 1 comida al día sin pantalla durante 2 semanas', completed: false },
            { id: 'a0a1g1', text: 'Terminar la comida antes de chequear el celular', completed: false },
          ],
        },
      ],
    },
    {
      id: 'area-1',
      name: 'Compartir tu mundo interno con quien lo pueda recibir',
      rationale:
        'Tu Fi está en 70 y tu Fe en 41. Tenés una vida interior profundísima pero la guardás para poquísima gente. Eso protege pero también aísla. La tarea no es volverte efusiva; es ejercitar el músculo de mostrar un pedacito más de lo que normalmente mostrás.',
      actions: [
        {
          id: 'area-1-action-0',
          title: 'Una conversación profunda por semana',
          description:
            'Elegí a una persona de confianza y una vez por semana iniciá vos una conversación que vaya más allá del "cómo andás". Puede ser en persona, por voz, por texto largo.',
          microGoals: [
            { id: 'a1a0g0', text: '1 conversación profunda semanal durante 6 semanas', completed: false },
            { id: 'a1a0g1', text: 'Anotar cómo te sentiste después (1 palabra)', completed: false },
          ],
        },
        {
          id: 'area-1-action-1',
          title: 'Pedir ayuda con una cosa chica',
          description:
            'Una vez en estas 4 semanas, pedile a alguien que te ayude con algo que normalmente resolverías sola. No algo enorme. Algo chico pero real.',
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
        'Tu arquetipo secundario es El Creador y tu Ni + Ti están dominantes. Pensás muchísimo pero no siempre dejás rastro. Un cuaderno, un doc, un pedazo de escritura regular te va a servir de dos formas: bajás presión interna y empezás a ver patrones en vos que de otra forma se te escapan.',
      actions: [
        {
          id: 'area-2-action-0',
          title: 'Journal de 10 minutos',
          description:
            'Cada noche, 10 minutos escribiendo sin corregir. No tiene que ser profundo. No tiene que ser bueno. Solo tiene que existir.',
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
