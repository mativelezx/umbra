import { buildBigFiveBlock } from '@/lib/knowledge/big-five';
import { buildJungBlock } from '@/lib/knowledge/jung-functions';
import { buildArchetypesBlock } from '@/lib/knowledge/archetypes';

export interface AnalyzeProfileParams {
  texts: string[];
  mode: 'dynamic';
  areas?: string[];
}

const SYSTEM =
  'Sos un psicólogo analítico experto en Big Five (IPIP-NEO), funciones cognitivas de Jung (1921), y arquetipos aplicados de Pearson (1991). Analizás textos introspectivos para generar perfiles psicológicos estructurados. Tu output es JSON estricto, sin explicaciones adicionales.';

const INSTRUCTIONS = `## Tarea

Analizá los textos del usuario y generá un perfil psicológico completo.

### 1. Big Five (IPIP-NEO)
Asigná un puntaje de 0-100 a cada una de las 5 dimensiones:
- openness
- conscientiousness
- extraversion
- agreeableness
- neuroticism

Usá los indicadores textuales del marco teórico. Evitá poner 50 por defecto — los usuarios tienen perfiles matizados. Basate SOLO en lo que el texto revela.

### 2. Funciones cognitivas Jung
Asigná un puntaje de 0-100 a cada una de las 8 funciones:
Se, Si, Ne, Ni, Te, Ti, Fe, Fi

Identificá cuáles son dominantes (>65) y cuáles están en desarrollo (<35).

### 3. Arquetipo dominante
Elegí UNO de: hero, sage, explorer, creator, caregiver, rebel.
Usá los criterios de asignación del marco teórico, que conectan Big Five + funciones Jung con el arquetipo.

### 4. Arquetipo secundario
El segundo arquetipo más presente (nombre, no key).

### 5. Confianza
0-100. Qué tan seguro estás del análisis basándote en la calidad y cantidad del texto.

### 6. Razonamiento
Breve explicación (2-3 párrafos) que cite evidencia textual específica del usuario. NO uses lenguaje diagnóstico ni clínico. Español rioplatense.

## Formato de respuesta (JSON estricto — solo el JSON, nada más)

{
  "bigFive": {
    "openness": <0-100>,
    "conscientiousness": <0-100>,
    "extraversion": <0-100>,
    "agreeableness": <0-100>,
    "neuroticism": <0-100>
  },
  "jungFunctions": {
    "Se": <0-100>, "Si": <0-100>,
    "Ne": <0-100>, "Ni": <0-100>,
    "Te": <0-100>, "Ti": <0-100>,
    "Fe": <0-100>, "Fi": <0-100>
  },
  "archetype": "hero|sage|explorer|creator|caregiver|rebel",
  "archetypeSecondary": "<nombre del arquetipo secundario>",
  "confidence": <0-100>,
  "reasoning": "<razonamiento citando evidencia textual, 2-3 párrafos>"
}

## Reglas críticas
- NO uses lenguaje diagnóstico ("tiene síntomas de...", "sufre de...")
- NO uses términos MBTI (INFJ, INTP, etc.) — usá las funciones de Jung directamente
- NO inventes — si el texto es muy corto, bajá la confianza
- Español rioplatense (voseo) en el razonamiento
- Devolvé SOLO el JSON, sin markdown, sin explicaciones previas`;

export function buildAnalyzeProfilePrompt(params: AnalyzeProfileParams): {
  system: string;
  prompt: string;
} {
  const { texts, mode, areas } = params;

  const textBlock =
    areas && areas.length === texts.length
      ? areas.map((area, i) => `### ${area}\n${texts[i] ?? ''}`).join('\n\n')
      : texts.join('\n\n');

  const sections: string[] = [];

  const bigFive = buildBigFiveBlock();
  if (bigFive) {
    sections.push(`## Marco teórico: Big Five (IPIP-NEO)\n\n${bigFive}`);
  }

  const jung = buildJungBlock();
  if (jung) {
    sections.push(`## Marco teórico: Funciones cognitivas de Jung\n\n${jung}`);
  }

  const archetypes = buildArchetypesBlock();
  if (archetypes) {
    sections.push(`## Marco teórico: Arquetipos (Pearson aplicado)\n\n${archetypes}`);
  }

  sections.push(`## Textos del usuario (modo: ${mode})\n\n${textBlock}`);
  sections.push(INSTRUCTIONS);

  return {
    system: SYSTEM,
    prompt: sections.join('\n\n'),
  };
}
