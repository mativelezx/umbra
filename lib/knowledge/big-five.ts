// ═══════════════════════════════════════════════════════════════
// Big Five — Knowledge Base (IPIP-NEO)
// ═══════════════════════════════════════════════════════════════
// Source: Goldberg (1999) International Personality Item Pool (IPIP-NEO).
// PUBLIC DOMAIN — can be bundled in the repo without IP concerns.
//
// Why IPIP-NEO and not NEO-PI-R: see docs/DECISIONS.md ADR-015.
// Citation format enforced by lib/knowledge/citation-check.test.ts per ADR-018.
// ═══════════════════════════════════════════════════════════════

import { buildKnowledgeBlock } from './build-block';

export interface Facet {
  key: string;
  name: string;
  nameEs: string;
  description: string;
  highIndicators: string[];
  lowIndicators: string[];
}

export interface BigFiveDimension {
  key: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  facets: Facet[];
  highProfile: string;
  lowProfile: string;
}

/**
 * @source Goldberg (1999) IPIP-NEO
 * @reference https://ipip.ori.org/newBigFive5broadKey.htm
 * @page_or_section "Openness to Experience — broad domain"
 * @verbatim false
 */
const openness: BigFiveDimension = {
  key: 'openness',
  name: 'Openness to Experience',
  nameEs: 'Apertura a la Experiencia',
  description:
    'Openness reflects curiosity about inner and outer experience, preference for variety, intellectual engagement, imagination, and appreciation of art and beauty.',
  descriptionEs:
    'La apertura refleja curiosidad por la experiencia interior y exterior, preferencia por la variedad, compromiso intelectual, imaginación y aprecio por el arte y la belleza.',
  facets: [
    {
      key: 'imagination',
      name: 'Imagination',
      nameEs: 'Imaginación',
      description:
        'Tendencia a fantasear, crear mundos mentales, y encontrar la realidad interior tan interesante como la exterior.',
      highIndicators: [
        'habla de ideas hipotéticas o escenarios imaginados',
        'menciona sueños, fantasías, o mundos internos',
        'usa metáforas elaboradas',
        'describe pensamientos que lo "visitan" o "aparecen"',
      ],
      lowIndicators: [
        'prefiere hablar de hechos concretos y presentes',
        'describe la imaginación como "pérdida de tiempo"',
        'reporta poco contenido mental cuando está ocioso',
      ],
    },
    {
      key: 'artistic_interests',
      name: 'Artistic interests',
      nameEs: 'Intereses artísticos',
      description: 'Aprecio por la belleza en el arte, la música, la literatura, y la naturaleza.',
      highIndicators: [
        'menciona emociones estéticas ("me llena ver el mar", "lloré con esa película")',
        'habla de arte, música, o literatura como parte de su identidad',
        'describe lugares o imágenes con detalle sensorial',
      ],
      lowIndicators: [
        'prefiere entretenimiento funcional sin "profundidad"',
        'describe el arte como lujo o distracción',
        'no menciona objetos estéticos',
      ],
    },
    {
      key: 'emotionality',
      name: 'Emotionality',
      nameEs: 'Emocionalidad',
      description:
        'Conciencia y aceptación de las propias emociones, incluyendo matices sutiles y complejos.',
      highIndicators: [
        'nombra emociones específicas y matizadas',
        'distingue entre sentimientos similares',
        'reconoce ambivalencia emocional',
      ],
      lowIndicators: [
        'usa vocabulario emocional simple ("bien", "mal")',
        'describe emociones como distracciones o debilidad',
        'aplana o minimiza sentimientos',
      ],
    },
    {
      key: 'adventurousness',
      name: 'Adventurousness',
      nameEs: 'Aventura',
      description: 'Apertura a nuevas actividades, lugares, sabores, y rutinas.',
      highIndicators: [
        'relata viajes o experiencias novedosas con entusiasmo',
        'menciona haber cambiado de trabajo, ciudad, o costumbres',
        'expresa curiosidad por probar cosas nuevas',
      ],
      lowIndicators: [
        'valora la rutina y la previsibilidad',
        'expresa incomodidad con el cambio',
        'repite patrones estables por preferencia',
      ],
    },
    {
      key: 'intellect',
      name: 'Intellect',
      nameEs: 'Intelecto',
      description: 'Interés en ideas abstractas, conceptos, y puzzles intelectuales.',
      highIndicators: [
        'menciona temas abstractos o filosóficos',
        'conecta ideas de dominios distintos',
        'usa conceptos teóricos para explicar su experiencia',
      ],
      lowIndicators: [
        'prefiere lo práctico a lo teórico',
        'evita discusiones abstractas',
        'describe la filosofía como poco útil',
      ],
    },
    {
      key: 'liberalism',
      name: 'Liberalism',
      nameEs: 'Apertura de valores',
      description:
        'Disposición a cuestionar tradiciones, autoridad, y valores heredados; apertura al cambio social.',
      highIndicators: [
        'cuestiona normas recibidas',
        'menciona haber revisado creencias familiares o religiosas',
        'expresa relativismo moral o pluralismo',
      ],
      lowIndicators: [
        'valora la tradición y la autoridad',
        'expresa moralidad absoluta',
        'define identidad en términos de continuidad con la herencia',
      ],
    },
  ],
  highProfile:
    'Alguien curioso, imaginativo, con gusto estético marcado, que busca novedad y se entretiene con ideas abstractas. A menudo revisa sus propias creencias.',
  lowProfile:
    'Alguien práctico, con los pies en la tierra, que prefiere rutinas conocidas y valora la tradición. Puede encontrar la introspección elaborada como innecesaria.',
};

/**
 * @source Goldberg (1999) IPIP-NEO
 * @reference https://ipip.ori.org/newBigFive5broadKey.htm
 * @page_or_section "Conscientiousness — broad domain"
 * @verbatim false
 */
const conscientiousness: BigFiveDimension = {
  key: 'conscientiousness',
  name: 'Conscientiousness',
  nameEs: 'Responsabilidad',
  description:
    'Conscientiousness reflects the degree to which a person is organized, dependable, disciplined, and oriented toward goals vs. spontaneous and flexible.',
  descriptionEs:
    'La responsabilidad refleja qué tan organizada, confiable, disciplinada y orientada a metas es una persona, en contraste con espontánea y flexible.',
  facets: [
    {
      key: 'self_efficacy',
      name: 'Self-efficacy',
      nameEs: 'Auto-eficacia',
      description: 'Confianza en la propia capacidad para lograr lo que se propone.',
      highIndicators: [
        'usa lenguaje como "voy a lograrlo", "puedo con esto"',
        'describe retos pasados superados',
        'asume responsabilidad por los resultados',
      ],
      lowIndicators: [
        'usa lenguaje como "no sé si voy a poder"',
        'atribuye éxitos a la suerte',
        'dude de sus propias capacidades',
      ],
    },
    {
      key: 'orderliness',
      name: 'Orderliness',
      nameEs: 'Orden',
      description: 'Preferencia por el orden físico y mental, las listas, y los sistemas claros.',
      highIndicators: [
        'menciona listas, rutinas, o sistemas de organización',
        'describe el orden como fuente de paz',
        'relata frustración con el desorden',
      ],
      lowIndicators: [
        'describe su espacio o agenda como caóticos sin problema',
        'menciona preferencia por la espontaneidad',
        'rechaza sistemas rígidos',
      ],
    },
    {
      key: 'dutifulness',
      name: 'Dutifulness',
      nameEs: 'Sentido del deber',
      description: 'Fuerte sentido de obligación moral hacia compromisos y responsabilidades.',
      highIndicators: [
        'habla de "tener que" cumplir con otros',
        'describe no haber faltado a promesas',
        'prioriza obligaciones sobre deseos',
      ],
      lowIndicators: [
        'describe compromisos como flexibles',
        'prioriza deseos o necesidades propias',
        'menciona haber cambiado de decisión cuando algo no le sirvió',
      ],
    },
    {
      key: 'achievement_striving',
      name: 'Achievement-striving',
      nameEs: 'Orientación al logro',
      description: 'Ambición por alcanzar metas altas y superar estándares.',
      highIndicators: [
        'menciona metas específicas y ambiciosas',
        'describe satisfacción con el logro',
        'compara su performance con otros',
      ],
      lowIndicators: [
        'describe sus metas como "llegar bien"',
        'rechaza la competencia',
        'valora el proceso sobre el resultado',
      ],
    },
    {
      key: 'self_discipline',
      name: 'Self-discipline',
      nameEs: 'Auto-disciplina',
      description: 'Capacidad de terminar lo que se empieza, incluso cuando hay fricción.',
      highIndicators: [
        'describe hábitos consistentes (ejercicio, lectura, estudio)',
        'menciona haber terminado proyectos largos',
        'resiste la procrastinación',
      ],
      lowIndicators: [
        'reconoce procrastinar',
        'describe proyectos sin terminar',
        'menciona dificultad para mantener rutinas',
      ],
    },
    {
      key: 'cautiousness',
      name: 'Cautiousness',
      nameEs: 'Prudencia',
      description: 'Tendencia a pensar antes de actuar, evitando decisiones impulsivas.',
      highIndicators: [
        'describe pensar mucho antes de decidir',
        'menciona pros y contras en sus reflexiones',
        'expresa cuidado con consecuencias',
      ],
      lowIndicators: [
        'describe actuar por impulso',
        'menciona decisiones rápidas de las que después se arrepintió',
        'expresa confianza en la corazonada',
      ],
    },
  ],
  highProfile:
    'Alguien organizado, disciplinado, con planes y rutinas. Termina lo que empieza, asume responsabilidades, es confiable.',
  lowProfile:
    'Alguien flexible, espontáneo, que prioriza el presente sobre el plan. Puede tener problemas para terminar proyectos pero reacciona bien a lo inesperado.',
};

/**
 * @source Goldberg (1999) IPIP-NEO
 * @reference https://ipip.ori.org/newBigFive5broadKey.htm
 * @page_or_section "Extraversion — broad domain"
 * @verbatim false
 */
const extraversion: BigFiveDimension = {
  key: 'extraversion',
  name: 'Extraversion',
  nameEs: 'Extraversión',
  description:
    'Extraversion reflects the degree to which a person seeks stimulation from the outer world, is energized by social interaction, and takes initiative in group settings.',
  descriptionEs:
    'La extraversión refleja qué tanto una persona busca estímulo del mundo exterior, se carga de energía con la interacción social, y toma iniciativa en grupo.',
  facets: [
    {
      key: 'friendliness',
      name: 'Friendliness',
      nameEs: 'Cordialidad',
      description: 'Calidez y afecto hacia los demás.',
      highIndicators: [
        'describe a los demás como fuente de alegría',
        'menciona haber hecho amistades fácilmente',
        'expresa afecto libremente',
      ],
      lowIndicators: [
        'describe la cordialidad como agotadora',
        'menciona pocas amistades cercanas por elección',
        'prefiere conversaciones profesionales a cálidas',
      ],
    },
    {
      key: 'gregariousness',
      name: 'Gregariousness',
      nameEs: 'Gregarismo',
      description: 'Preferencia por estar en grupos y multitudes.',
      highIndicators: [
        'busca activamente encuentros grupales',
        'describe fiestas, eventos, o reuniones como energizantes',
        'se aburre estando solo',
      ],
      lowIndicators: [
        'prefiere encuentros uno a uno o solo',
        'describe grupos grandes como agotadores',
        'busca actividad en soledad',
      ],
    },
    {
      key: 'assertiveness',
      name: 'Assertiveness',
      nameEs: 'Asertividad',
      description: 'Disposición a tomar la iniciativa y expresar opiniones.',
      highIndicators: [
        'describe tomar la palabra en grupos',
        'menciona liderar proyectos o iniciar conversaciones',
        'expresa opiniones sin pedir permiso',
      ],
      lowIndicators: [
        'describe escuchar más que hablar',
        'menciona esperar a que otros lideren',
        'suaviza opiniones con disclaimers',
      ],
    },
    {
      key: 'activity_level',
      name: 'Activity level',
      nameEs: 'Nivel de actividad',
      description: 'Necesidad de estar ocupado y en movimiento.',
      highIndicators: [
        'describe agendas llenas con satisfacción',
        'menciona múltiples proyectos simultáneos',
        'describe la ociosidad como aburrida',
      ],
      lowIndicators: [
        'describe la pausa como necesaria',
        'prefiere un proyecto a la vez',
        'valora momentos de quietud',
      ],
    },
    {
      key: 'excitement_seeking',
      name: 'Excitement-seeking',
      nameEs: 'Búsqueda de emociones',
      description: 'Apetito por situaciones novedosas e intensas.',
      highIndicators: [
        'describe deportes extremos, viajes aventureros, o experiencias intensas',
        'menciona aburrirse rápido con lo familiar',
        'busca deliberadamente el "subidón"',
      ],
      lowIndicators: [
        'describe preferir la calma',
        'evita riesgos físicos o emocionales intensos',
        'valora la continuidad sobre la novedad',
      ],
    },
    {
      key: 'cheerfulness',
      name: 'Cheerfulness',
      nameEs: 'Alegría',
      description: 'Experiencia frecuente de emociones positivas.',
      highIndicators: [
        'describe su estado base como alegre o entusiasmado',
        'menciona reír con facilidad',
        've lo positivo en situaciones ambiguas',
      ],
      lowIndicators: [
        'describe su estado base como neutral o reflexivo',
        'menciona pocas experiencias de alegría reciente',
        'identifica con el pensamiento melancólico',
      ],
    },
  ],
  highProfile:
    'Alguien que se energiza con la gente, toma iniciativa, busca estímulo y habla con entusiasmo. Suele estar ocupado y en movimiento.',
  lowProfile:
    'Alguien reservado, que necesita soledad para recargar, prefiere encuentros íntimos a fiestas, y disfruta de la quietud.',
};

/**
 * @source Goldberg (1999) IPIP-NEO
 * @reference https://ipip.ori.org/newBigFive5broadKey.htm
 * @page_or_section "Agreeableness — broad domain"
 * @verbatim false
 */
const agreeableness: BigFiveDimension = {
  key: 'agreeableness',
  name: 'Agreeableness',
  nameEs: 'Amabilidad',
  description:
    'Agreeableness reflects the degree to which a person is cooperative, compassionate, trusting, and prioritizes social harmony.',
  descriptionEs:
    'La amabilidad refleja qué tanto una persona es cooperativa, compasiva, confiada, y prioriza la armonía social.',
  facets: [
    {
      key: 'trust',
      name: 'Trust',
      nameEs: 'Confianza',
      description: 'Creencia en las buenas intenciones de los demás.',
      highIndicators: [
        'asume lo mejor de los demás',
        'describe haber perdonado o entendido a otros',
        'pocas veces menciona ser "estafado" o "usado"',
      ],
      lowIndicators: [
        'describe a los demás como interesados',
        'menciona haber sido traicionado varias veces',
        'es cauto con nuevos vínculos',
      ],
    },
    {
      key: 'morality',
      name: 'Morality',
      nameEs: 'Moralidad',
      description: 'Honestidad y franqueza; rechazo a la manipulación.',
      highIndicators: [
        'valora decir la verdad aun cuando incomoda',
        'rechaza la manipulación o el juego social',
        'describe transparencia como principio',
      ],
      lowIndicators: [
        'menciona haber "jugado el juego" en lo profesional',
        'describe la honestidad como estratégica',
        'acepta la manipulación leve como parte del mundo',
      ],
    },
    {
      key: 'altruism',
      name: 'Altruism',
      nameEs: 'Altruismo',
      description: 'Preocupación genuina por el bienestar de los demás.',
      highIndicators: [
        'describe haber ayudado a alguien sin esperar nada',
        'expresa satisfacción al ver a otros bien',
        'menciona voluntariado o cuidado',
      ],
      lowIndicators: [
        'valora su tiempo y energía por encima del de otros',
        'describe la ayuda como agotadora',
        've la generosidad como ingenuidad',
      ],
    },
    {
      key: 'cooperation',
      name: 'Cooperation',
      nameEs: 'Cooperación',
      description: 'Disposición a ceder y negociar para mantener armonía.',
      highIndicators: [
        'describe ceder en discusiones por el vínculo',
        'busca consensos',
        'evita conflictos abiertos',
      ],
      lowIndicators: [
        'defiende su posición con fuerza',
        'prefiere la verdad al consenso',
        'acepta conflictos como necesarios',
      ],
    },
    {
      key: 'modesty',
      name: 'Modesty',
      nameEs: 'Modestia',
      description: 'Tendencia a minimizar los propios logros.',
      highIndicators: [
        'describe logros con humildad o como fruto de otros',
        'evita presumir',
        'se incomoda con elogios',
      ],
      lowIndicators: [
        'valora el reconocimiento',
        'describe logros con detalle y orgullo',
        'compara resultados con los de otros',
      ],
    },
    {
      key: 'sympathy',
      name: 'Sympathy',
      nameEs: 'Empatía',
      description: 'Sensibilidad al sufrimiento de los demás.',
      highIndicators: [
        'describe sentir el dolor ajeno físicamente',
        'menciona lágrimas por historias de otros',
        'piensa en el impacto de sus palabras en otros',
      ],
      lowIndicators: [
        'describe no dejarse afectar por problemas ajenos',
        'valora la "objetividad emocional"',
        'prioriza la resolución sobre el acompañamiento',
      ],
    },
  ],
  highProfile:
    'Alguien compasivo, cooperativo, que busca armonía y confía en los demás. Suele poner las necesidades de otros antes que las propias.',
  lowProfile:
    'Alguien directo, competitivo, que prioriza la verdad y la eficacia sobre la diplomacia. Puede parecer frío pero valora la autenticidad sobre la armonía forzada.',
};

/**
 * @source Goldberg (1999) IPIP-NEO
 * @reference https://ipip.ori.org/newBigFive5broadKey.htm
 * @page_or_section "Neuroticism — broad domain"
 * @verbatim false
 */
const neuroticism: BigFiveDimension = {
  key: 'neuroticism',
  name: 'Neuroticism',
  nameEs: 'Estabilidad emocional (inversa)',
  description:
    'Neuroticism reflects emotional reactivity and the tendency to experience negative emotions such as anxiety, irritability, and sadness.',
  descriptionEs:
    'El neuroticismo refleja reactividad emocional y la tendencia a experimentar emociones negativas como ansiedad, irritabilidad, y tristeza. Invertido, es estabilidad emocional.',
  facets: [
    {
      key: 'anxiety',
      name: 'Anxiety',
      nameEs: 'Ansiedad',
      description: 'Tendencia a preocuparse por amenazas reales o imaginadas.',
      highIndicators: [
        'describe anticipar lo peor',
        'menciona insomnio o tensión corporal',
        'lista miedos o preocupaciones recurrentes',
      ],
      lowIndicators: [
        'describe enfrentar situaciones difíciles con calma',
        'menciona pocas preocupaciones recurrentes',
        'no dedica tiempo a escenarios hipotéticos negativos',
      ],
    },
    {
      key: 'anger',
      name: 'Anger',
      nameEs: 'Enojo',
      description: 'Tendencia a sentir y expresar enojo.',
      highIndicators: [
        'menciona perder la paciencia con frecuencia',
        'describe reacciones intensas a la frustración',
        'recuerda ofensas',
      ],
      lowIndicators: [
        'describe pocas veces haberse enojado',
        'procesa la frustración sin drama',
        'suelta las ofensas rápido',
      ],
    },
    {
      key: 'depression',
      name: 'Depression',
      nameEs: 'Tristeza / desánimo',
      description: 'Tendencia a experimentar tristeza, desesperanza, y pérdida de energía.',
      highIndicators: [
        'describe períodos de desánimo o falta de sentido',
        'menciona no tener ganas de hacer cosas que antes disfrutaba',
        'usa lenguaje oscuro para describir su estado',
      ],
      lowIndicators: [
        'describe un estado emocional estable',
        'mantiene interés en sus actividades',
        'enfrenta los bajones con rapidez',
      ],
    },
    {
      key: 'self_consciousness',
      name: 'Self-consciousness',
      nameEs: 'Timidez / auto-conciencia',
      description: 'Sensibilidad al juicio social y vergüenza.',
      highIndicators: [
        'describe preocupación por lo que otros piensan',
        'menciona rumiar conversaciones pasadas',
        'evita situaciones de exposición',
      ],
      lowIndicators: [
        'describe no importarle mucho la opinión ajena',
        'se expone sin ansiedad',
        'suelta las interacciones rápido',
      ],
    },
    {
      key: 'immoderation',
      name: 'Immoderation',
      nameEs: 'Impulsividad',
      description: 'Dificultad para resistir tentaciones y regular impulsos.',
      highIndicators: [
        'describe haber comido, gastado, o dicho algo de más',
        'menciona dificultad con autocontrol',
        'reconoce hábitos que no puede frenar',
      ],
      lowIndicators: [
        'describe resistir tentaciones con facilidad',
        'menciona hábitos estables',
        'planifica con disciplina',
      ],
    },
    {
      key: 'vulnerability',
      name: 'Vulnerability',
      nameEs: 'Vulnerabilidad al estrés',
      description: 'Dificultad para manejar situaciones estresantes.',
      highIndicators: [
        'describe sentirse abrumado con frecuencia',
        'menciona bloqueos ante la presión',
        'reconoce necesitar tiempo para procesar eventos difíciles',
      ],
      lowIndicators: [
        'describe funcionar bien bajo presión',
        'menciona haber enfrentado crisis con claridad',
        'recupera equilibrio rápido',
      ],
    },
  ],
  highProfile:
    'Alguien emocionalmente reactivo, que siente intensamente, que se preocupa mucho y puede sentirse abrumado. Esta sensibilidad también lo hace profundo y matizado.',
  lowProfile:
    'Alguien emocionalmente estable, que maneja bien la presión, recupera equilibrio rápido y no se engancha con emociones difíciles. Puede parecer distante en momentos de vulnerabilidad ajena.',
};

export const BIG_FIVE_DIMENSIONS: readonly BigFiveDimension[] = [
  openness,
  conscientiousness,
  extraversion,
  agreeableness,
  neuroticism,
] as const;

export function buildBigFiveBlock(): string {
  return buildKnowledgeBlock({
    items: BIG_FIVE_DIMENSIONS,
    render: (d) =>
      `## ${d.nameEs} (${d.name})\n${d.descriptionEs}\n\n### Facets\n${d.facets
        .map(
          (f) =>
            `**${f.nameEs}** (${f.name}): ${f.description}\n- Señales altas: ${f.highIndicators.join('; ')}\n- Señales bajas: ${f.lowIndicators.join('; ')}`,
        )
        .join('\n\n')}\n\n**Perfil alto**: ${d.highProfile}\n**Perfil bajo**: ${d.lowProfile}`,
  });
}
