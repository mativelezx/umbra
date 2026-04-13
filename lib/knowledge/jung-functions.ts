// ═══════════════════════════════════════════════════════════════
// Funciones cognitivas de Jung
// ═══════════════════════════════════════════════════════════════
// Source: Jung, C.G. (1921) Tipos Psicológicos (Psychological Types).
// Public domain — Spanish translation is out of copyright.
// Umbra uses Jung DIRECTLY, NOT via MBTI. See ADR-002.
// Academic framing: Sauer (2025) "Rehabilitating Jung's Cognitive Function Theory".
// ═══════════════════════════════════════════════════════════════

import { buildKnowledgeBlock } from './build-block';

export interface CognitiveFunction {
  key: 'Se' | 'Si' | 'Ne' | 'Ni' | 'Te' | 'Ti' | 'Fe' | 'Fi';
  name: string;
  nameEs: string;
  attitude: 'extravertida' | 'introvertida';
  category: 'perceiving' | 'judging';
  definition: string;
  manifestations: string[];
  textualIndicators: string[];
  shadowAspect: string;
  developmentPath: string;
}

/**
 * @source Jung (1921) Tipos Psicológicos, cap. X "Descripción general de los tipos"
 * @reference https://archive.org/details/jung-tipos-psicologicos
 * @page_or_section "Tipo perceptivo extravertido"
 * @verbatim false
 */
const Se: CognitiveFunction = {
  key: 'Se',
  name: 'Extraverted Sensing',
  nameEs: 'Sensación Extravertida',
  attitude: 'extravertida',
  category: 'perceiving',
  definition:
    'Atención directa al mundo sensorial presente. Registra lo que está ocurriendo aquí y ahora con viveza y detalle. Contacto inmediato con la realidad concreta.',
  manifestations: [
    'presencia corporal marcada',
    'disfrute de la acción física',
    'atención a texturas, sabores, sonidos, movimientos',
    'capacidad para responder rápido en situaciones cambiantes',
  ],
  textualIndicators: [
    'describe el presente con detalle sensorial vivo',
    'menciona placeres físicos concretos (comer, correr, bailar)',
    'usa lenguaje activo ("agarré", "me moví", "probé")',
    'relata hacer en lugar de pensar',
  ],
  shadowAspect:
    'Dificultad para sostener compromisos a largo plazo o para pensar en consecuencias futuras. Puede caer en impulsividad y búsqueda de estímulos.',
  developmentPath:
    'Integrar reflexión sobre patrones. Hacer espacio para el silencio. No confundir la sensación intensa con el único camino válido.',
};

/**
 * @source Jung (1921) Tipos Psicológicos, cap. X
 * @reference https://archive.org/details/jung-tipos-psicologicos
 * @page_or_section "Tipo perceptivo introvertido"
 * @verbatim false
 */
const Si: CognitiveFunction = {
  key: 'Si',
  name: 'Introverted Sensing',
  nameEs: 'Sensación Introvertida',
  attitude: 'introvertida',
  category: 'perceiving',
  definition:
    'Memoria detallada del pasado sensorial y corporal. Registra experiencias internas y las conserva como un archivo vivo. Sensación filtrada por resonancia personal.',
  manifestations: [
    'memoria autobiográfica rica',
    'apego a tradiciones y rituales',
    'reconocimiento fino del propio cuerpo',
    'comparación del presente con experiencias pasadas similares',
  ],
  textualIndicators: [
    'relata con detalle eventos del pasado, incluso lejanos',
    'menciona rituales, costumbres, tradiciones familiares',
    'describe el cuerpo con vocabulario interno ("me siento pesado", "tengo fatiga")',
    'compara el presente con "antes"',
  ],
  shadowAspect:
    'Resistencia al cambio. Dificultad para aceptar que el pasado no se puede reconstruir. Puede quedar atrapado en nostalgia o en la repetición.',
  developmentPath:
    'Confiar en que los cambios pueden honrar el pasado sin negarlo. Permitir que lo nuevo se integre sin amenazar lo guardado.',
};

/**
 * @source Jung (1921) Tipos Psicológicos, cap. X
 * @reference https://archive.org/details/jung-tipos-psicologicos
 * @page_or_section "Tipo intuitivo extravertido"
 * @verbatim false
 */
const Ne: CognitiveFunction = {
  key: 'Ne',
  name: 'Extraverted Intuition',
  nameEs: 'Intuición Extravertida',
  attitude: 'extravertida',
  category: 'perceiving',
  definition:
    'Percepción de posibilidades y conexiones en el mundo externo. Ve lo que podría ser detrás de lo que es. Generador de ideas, patrones, y combinaciones nuevas.',
  manifestations: [
    'generación constante de ideas y alternativas',
    'conexiones inesperadas entre dominios distintos',
    'entusiasmo por lo nuevo y lo posible',
    'dificultad para limitarse a una sola opción',
  ],
  textualIndicators: [
    'menciona múltiples ideas sin terminar',
    'conecta temas aparentemente distintos ("esto me hace pensar en...")',
    'describe futuros hipotéticos con entusiasmo',
    'usa lenguaje exploratorio ("y si...", "imaginá si...")',
  ],
  shadowAspect:
    'Dificultad para comprometerse con una opción. Dispersión. Tendencia a abandonar proyectos cuando dejan de ser novedosos.',
  developmentPath:
    'Cultivar la disciplina de terminar algo. Aprender a distinguir entre la idea brillante y la idea factible. Honrar también la profundidad, no solo la amplitud.',
};

/**
 * @source Jung (1921) Tipos Psicológicos, cap. X
 * @reference https://archive.org/details/jung-tipos-psicologicos
 * @page_or_section "Tipo intuitivo introvertido"
 * @verbatim false
 */
const Ni: CognitiveFunction = {
  key: 'Ni',
  name: 'Introverted Intuition',
  nameEs: 'Intuición Introvertida',
  attitude: 'introvertida',
  category: 'perceiving',
  definition:
    'Visión interna de patrones profundos y significados ocultos. Accede a imágenes y símbolos que se integran en una comprensión unificada. Orientada a lo que va a ser.',
  manifestations: [
    'sensación de "saber" sin poder explicar',
    'imágenes o símbolos recurrentes',
    'visión de hacia dónde va algo',
    'necesidad de síntesis personal antes de compartir',
  ],
  textualIndicators: [
    'describe intuiciones fuertes sin justificación clara',
    'menciona sueños, símbolos, o imágenes internas',
    'habla del futuro con certeza y dirección ("sé que esto va a pasar")',
    'usa metáforas elaboradas como forma de explicar',
  ],
  shadowAspect:
    'Puede quedar aislado de la realidad concreta. Dificultad para aceptar visiones alternativas. A veces fundamentalista en sus certezas internas.',
  developmentPath:
    'Contrastar las visiones internas con la realidad externa. Valorar los datos y las perspectivas de otros. Aprender a comunicar la visión en lenguaje accesible.',
};

/**
 * @source Jung (1921) Tipos Psicológicos, cap. X
 * @reference https://archive.org/details/jung-tipos-psicologicos
 * @page_or_section "Tipo pensante extravertido"
 * @verbatim false
 */
const Te: CognitiveFunction = {
  key: 'Te',
  name: 'Extraverted Thinking',
  nameEs: 'Pensamiento Extravertido',
  attitude: 'extravertida',
  category: 'judging',
  definition:
    'Lógica aplicada a la organización del mundo externo. Busca eficiencia, sistemas, reglas claras. Orientada a resultados medibles y estructuras funcionales.',
  manifestations: [
    'capacidad para organizar personas y procesos',
    'toma de decisiones rápida basada en hechos',
    'rechazo a lo ineficiente',
    'preferencia por reglas claras',
  ],
  textualIndicators: [
    'describe su trabajo en términos de metas y resultados',
    'menciona sistemas, procesos, estructuras',
    'usa lenguaje directivo ("había que hacer X", "lo más lógico era")',
    'valora la eficiencia por encima del proceso emocional',
  ],
  shadowAspect:
    'Puede aplastar matices emocionales y contextos delicados. Tendencia a ver a las personas como recursos.',
  developmentPath:
    'Escuchar lo que no se puede medir. Dar espacio a procesos lentos. Reconocer que la lógica externa no es el único tipo de verdad.',
};

/**
 * @source Jung (1921) Tipos Psicológicos, cap. X
 * @reference https://archive.org/details/jung-tipos-psicologicos
 * @page_or_section "Tipo pensante introvertido"
 * @verbatim false
 */
const Ti: CognitiveFunction = {
  key: 'Ti',
  name: 'Introverted Thinking',
  nameEs: 'Pensamiento Introvertido',
  attitude: 'introvertida',
  category: 'judging',
  definition:
    'Lógica orientada a la coherencia interna. Busca frameworks internos consistentes, análisis preciso, categorías claras. Orientada a la verdad, no a la utilidad.',
  manifestations: [
    'gusto por el análisis puro',
    'construcción de modelos mentales elaborados',
    'rechazo a simplificaciones imprecisas',
    'necesidad de entender antes de actuar',
  ],
  textualIndicators: [
    'describe su forma de pensar como "desmontar" problemas',
    'distingue entre categorías con precisión',
    'usa condicionales y matices ("depende de", "en el caso de")',
    'prioriza claridad conceptual sobre consenso',
  ],
  shadowAspect:
    'Puede demorar decisiones esperando claridad perfecta. Desconexión de las consecuencias prácticas. Aislamiento intelectual.',
  developmentPath:
    'Aceptar que la acción buena es mejor que la acción perfecta. Confiar en que se puede ajustar en el camino. Compartir la elaboración antes de tenerla completa.',
};

/**
 * @source Jung (1921) Tipos Psicológicos, cap. X
 * @reference https://archive.org/details/jung-tipos-psicologicos
 * @page_or_section "Tipo sentimental extravertido"
 * @verbatim false
 */
const Fe: CognitiveFunction = {
  key: 'Fe',
  name: 'Extraverted Feeling',
  nameEs: 'Sentimiento Extravertido',
  attitude: 'extravertida',
  category: 'judging',
  definition:
    'Sensibilidad al estado emocional colectivo. Evalúa en términos de armonía, relaciones, impacto social. Orientada al bienestar del grupo.',
  manifestations: [
    'lectura fina del clima emocional de otros',
    'capacidad para acomodar y conciliar',
    'compromiso con la armonía del grupo',
    'priorización de la relación sobre la verdad cruda',
  ],
  textualIndicators: [
    'describe relaciones con detalle',
    'menciona cómo están los demás antes que cómo está uno',
    'usa lenguaje de cuidado, conexión, vínculo',
    'busca consensos',
  ],
  shadowAspect:
    'Puede perder su propia voz buscando armonía. Dificultad para soportar la desaprobación de otros. Resentimiento acumulado cuando se posterga a sí mismo.',
  developmentPath:
    'Reconocer el valor de la disonancia. Aprender a decir "no" sin culpa. Confiar en que el vínculo verdadero sobrevive a los desacuerdos.',
};

/**
 * @source Jung (1921) Tipos Psicológicos, cap. X
 * @reference https://archive.org/details/jung-tipos-psicologicos
 * @page_or_section "Tipo sentimental introvertido"
 * @verbatim false
 */
const Fi: CognitiveFunction = {
  key: 'Fi',
  name: 'Introverted Feeling',
  nameEs: 'Sentimiento Introvertido',
  attitude: 'introvertida',
  category: 'judging',
  definition:
    'Sistema de valores internos profundos. Evalúa desde una brújula moral personal no negociable. Orientada a la autenticidad y al sentido propio.',
  manifestations: [
    'convicciones morales claras',
    'fidelidad a valores personales por encima de las expectativas sociales',
    'profundidad emocional que se guarda para pocos',
    'rechazo visceral a lo inauténtico',
  ],
  textualIndicators: [
    'describe valores como "innegociables"',
    'menciona rechazo a situaciones que violan su brújula interna',
    'expresa sensibilidad moral con fuerza',
    'protege su vida interior',
  ],
  shadowAspect:
    'Puede aislarse cuando el mundo no se alinea con sus valores. Dificultad para expresar la profundidad interna. Juicio silencioso sobre los que considera inauténticos.',
  developmentPath:
    'Compartir la brújula interna con quienes la pueden recibir. Reconocer que otros también tienen sistemas valorativos legítimos. No confundir desacuerdo con traición.',
};

export const JUNG_FUNCTIONS: readonly CognitiveFunction[] = [Se, Si, Ne, Ni, Te, Ti, Fe, Fi] as const;

export function buildJungBlock(): string {
  return buildKnowledgeBlock({
    items: JUNG_FUNCTIONS,
    render: (f) =>
      `## ${f.nameEs} (${f.key}) — ${f.attitude}, ${f.category}\n${f.definition}\n\n**Manifestaciones**: ${f.manifestations.join('; ')}\n**Indicadores textuales**: ${f.textualIndicators.join('; ')}\n**Aspecto sombra**: ${f.shadowAspect}\n**Camino de desarrollo**: ${f.developmentPath}`,
  });
}
