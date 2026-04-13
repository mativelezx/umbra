// ═══════════════════════════════════════════════════════════════
// Arquetipos — Pearson applied system
// ═══════════════════════════════════════════════════════════════
// Source: Pearson, C. S. (1986) The Hero Within + (1991) Awakening
// the Heroes Within. Pearson's "applied archetypes" (not Jung's
// structural archetypes). See ADR-007 for the rationale.
// ═══════════════════════════════════════════════════════════════

import { buildKnowledgeBlock } from './build-block';

export interface ArchetypeDefinition {
  key: 'hero' | 'sage' | 'explorer' | 'creator' | 'caregiver' | 'rebel';
  name: string;
  nameEs: string;
  source: string;
  definition: string;
  coreMotivation: string;
  coreFear: string;
  associatedFunctions: {
    primary: string[];
    secondary: string[];
  };
  bigFiveCorrelations: {
    high: string[];
    low: string[];
  };
  assignmentCriteria: string;
  icon: string;
}

/**
 * @source Pearson (1991) Awakening the Heroes Within
 * @reference ISBN 978-0062506788
 * @page_or_section "The Hero archetype — ch. 5"
 * @verbatim false
 */
const hero: ArchetypeDefinition = {
  key: 'hero',
  name: 'The Hero',
  nameEs: 'El Héroe',
  source: 'Pearson (1991) Awakening the Heroes Within',
  definition:
    'El Héroe se define por enfrentar desafíos, probar su valor a través de la acción, y proteger a otros. Su identidad se forja en la lucha contra lo que considera injusto o peligroso.',
  coreMotivation:
    'Probar su valor a través del desafío. Lograr dominio. Defender lo que cree justo. Dejar una marca.',
  coreFear:
    'Ser débil, cobarde, o insignificante. Fallar en el momento de la prueba. Pasar desapercibido.',
  associatedFunctions: {
    primary: ['Te', 'Se'],
    secondary: ['Ni'],
  },
  bigFiveCorrelations: {
    high: ['conscientiousness', 'extraversion'],
    low: ['neuroticism'],
  },
  assignmentCriteria:
    'Alta Conscientiousness + alta Extraversion + funciones dominantes Te o Se. Relatos centrados en retos superados, metas, esfuerzo físico o competitivo.',
  icon: 'ShieldStar',
};

/**
 * @source Pearson (1991) Awakening the Heroes Within
 * @reference ISBN 978-0062506788
 * @page_or_section "The Sage archetype — ch. 7"
 * @verbatim false
 */
const sage: ArchetypeDefinition = {
  key: 'sage',
  name: 'The Sage',
  nameEs: 'El Sabio',
  source: 'Pearson (1991) Awakening the Heroes Within',
  definition:
    'El Sabio busca la verdad, el conocimiento, y la comprensión profunda. Se orienta por la pregunta y desconfía de las respuestas simples. Su herramienta es el análisis.',
  coreMotivation:
    'Entender. Ver claro. Encontrar la verdad debajo de las apariencias. Enseñar a otros a ver.',
  coreFear: 'Ser engañado. Tener certezas falsas. Pasar la vida creyendo una mentira.',
  associatedFunctions: {
    primary: ['Ni', 'Ti'],
    secondary: ['Fi'],
  },
  bigFiveCorrelations: {
    high: ['openness'],
    low: ['extraversion'],
  },
  assignmentCriteria:
    'Alta Openness + baja Extraversion + funciones dominantes Ni o Ti. Relatos centrados en comprensión, análisis, preguntas filosóficas, o búsqueda de sentido.',
  icon: 'Brain',
};

/**
 * @source Pearson (1991) Awakening the Heroes Within
 * @reference ISBN 978-0062506788
 * @page_or_section "The Seeker / Explorer archetype — ch. 6"
 * @verbatim false
 */
const explorer: ArchetypeDefinition = {
  key: 'explorer',
  name: 'The Explorer',
  nameEs: 'El Explorador',
  source: 'Pearson (1991) Awakening the Heroes Within',
  definition:
    'El Explorador se define por la necesidad de descubrir, de ir más allá de los límites conocidos, de encontrar un lugar propio en el mundo. Su impulso es la libertad.',
  coreMotivation:
    'Descubrir. Encontrar lo auténticamente propio. Ir más allá de lo familiar. Ser libre.',
  coreFear: 'Quedar atrapado. Conformismo. Perder la curiosidad. Dejar de crecer.',
  associatedFunctions: {
    primary: ['Ne', 'Se'],
    secondary: ['Ti'],
  },
  bigFiveCorrelations: {
    high: ['openness', 'extraversion'],
    low: ['agreeableness'],
  },
  assignmentCriteria:
    'Alta Openness + alta Extraversion + funciones dominantes Ne o Se. Relatos centrados en viajes, cambios, búsqueda, rechazo de lo establecido.',
  icon: 'Compass',
};

/**
 * @source Pearson (1991) Awakening the Heroes Within
 * @reference ISBN 978-0062506788
 * @page_or_section "The Creator archetype — ch. 9"
 * @verbatim false
 */
const creator: ArchetypeDefinition = {
  key: 'creator',
  name: 'The Creator',
  nameEs: 'El Creador',
  source: 'Pearson (1991) Awakening the Heroes Within',
  definition:
    'El Creador necesita dar forma a lo que imagina, transformar ideas en realidad. Su identidad se construye haciendo aparecer lo que no existía.',
  coreMotivation:
    'Crear algo con significado. Traer al mundo lo que visualizaron. Dejar una obra detrás.',
  coreFear: 'Mediocridad. Falta de visión. Que su expresión no sea vista o comprendida.',
  associatedFunctions: {
    primary: ['Ni', 'Ne'],
    secondary: ['Fi'],
  },
  bigFiveCorrelations: {
    high: ['openness'],
    low: [],
  },
  assignmentCriteria:
    'Alta Openness + funciones dominantes Ni o Ne + Fi marcado. Relatos centrados en proyectos creativos, visión estética, expresión personal única.',
  icon: 'Sparkle',
};

/**
 * @source Pearson (1991) Awakening the Heroes Within
 * @reference ISBN 978-0062506788
 * @page_or_section "The Altruist / Caregiver archetype — ch. 8"
 * @verbatim false
 */
const caregiver: ArchetypeDefinition = {
  key: 'caregiver',
  name: 'The Caregiver',
  nameEs: 'El Cuidador',
  source: 'Pearson (1991) Awakening the Heroes Within',
  definition:
    'El Cuidador encuentra propósito en el servicio, la protección, y el cuidado de otros. Su identidad se forja en ser quien está cuando otros necesitan.',
  coreMotivation:
    'Cuidar. Proteger. Ser necesario. Aliviar el sufrimiento. Que los demás estén bien.',
  coreFear: 'Egoísmo. Negligencia. Ser incapaz de ayudar. Perder a quien cuida.',
  associatedFunctions: {
    primary: ['Fe', 'Si'],
    secondary: ['Fi'],
  },
  bigFiveCorrelations: {
    high: ['agreeableness', 'conscientiousness'],
    low: ['neuroticism'],
  },
  assignmentCriteria:
    'Alta Agreeableness + alta Fe o Fi + baja Neuroticism. Relatos centrados en cuidado de otros, familia, servicio, empatía.',
  icon: 'Heart',
};

/**
 * @source Pearson (1991) Awakening the Heroes Within
 * @reference ISBN 978-0062506788
 * @page_or_section "The Destroyer / Outlaw archetype — ch. 10"
 * @verbatim false
 */
const rebel: ArchetypeDefinition = {
  key: 'rebel',
  name: 'The Rebel',
  nameEs: 'El Rebelde',
  source: 'Pearson (1991) Awakening the Heroes Within',
  definition:
    'El Rebelde desafía el status quo y busca transformar lo que considera injusto o caduco. Su fuerza es la claridad para ver lo que no funciona y la voluntad de romperlo.',
  coreMotivation:
    'Transformar lo corrupto. Liberar lo reprimido. Derribar lo injusto. Reinventar.',
  coreFear: 'Ser cómplice del sistema. Perder su autenticidad. Conformismo. Pérdida de poder.',
  associatedFunctions: {
    primary: ['Ti', 'Ne'],
    secondary: ['Fi'],
  },
  bigFiveCorrelations: {
    high: ['openness'],
    low: ['agreeableness'],
  },
  assignmentCriteria:
    'Alta Openness + baja Agreeableness + funciones dominantes Ne o Ti. Relatos centrados en rechazo a la autoridad, crítica del sistema, transformación.',
  icon: 'Lightning',
};

export const ARCHETYPES: readonly ArchetypeDefinition[] = [
  hero,
  sage,
  explorer,
  creator,
  caregiver,
  rebel,
] as const;

export function buildArchetypesBlock(): string {
  return buildKnowledgeBlock({
    items: ARCHETYPES,
    render: (a) =>
      `## ${a.nameEs} (${a.key})\n**Fuente**: ${a.source}\n${a.definition}\n\n**Motivación**: ${a.coreMotivation}\n**Miedo central**: ${a.coreFear}\n**Funciones Jung asociadas**: ${a.associatedFunctions.primary.join(', ')} (primarias), ${a.associatedFunctions.secondary.join(', ')} (secundarias)\n**Correlaciones Big Five**: alto en ${a.bigFiveCorrelations.high.join(', ') || 'ninguno'}, bajo en ${a.bigFiveCorrelations.low.join(', ') || 'ninguno'}\n**Criterio de asignación**: ${a.assignmentCriteria}`,
  });
}
