/**
 * H1 + H2 — Eval case corpus.
 *
 * Fixed stimuli for the computational evaluation of the Umbra analyzer.
 * Used by:
 *   - `lib/evals/consistency.ts` — H1 determinism runner
 *   - `lib/evals/cross-model-paraphrase.ts` — H2 robustness runner
 *
 * Corpus composition (preregistered on OSF, see biz/TFG.md + biz/VALIDATION.md):
 *   - ipip — 20 cases adapted from IPIP-NEO vignettes (public domain,
 *     Goldberg 1999, ADR-015). Each case targets a specific Big Five
 *     dimension with plausible introspective text in voseo rioplatense.
 *   - jung — 20 cases adapted from Tipos Psicológicos (Jung 1921, public
 *     domain). Each case targets a specific cognitive function or
 *     combination.
 *   - adversarial — 10 cases synthesized by the developer to probe edge
 *     behavior: ambivalence, contradiction, very short input, mixed
 *     voseo/tuteo, atypical length.
 *
 * **CORPUS STATUS (2026-04-14)**: Corpus completo con 50 casos — 20 ipip
 * (distribuidos a través de los 5 factores Big Five con direcciones
 * alto/bajo balanceadas), 20 jung (distribuidos a través de las 8
 * funciones cognitivas), 10 adversarial (edge cases).
 *
 * La mayoría de los casos fueron draftados por codex (OpenAI gpt-5.4,
 * reasoning high, 2026-04-14) siguiendo un prompt que especificó
 * targets por dimensión, restricciones éticas y voz en voseo rioplatense.
 * Los casos ipip-01..17 fueron completados manualmente por el autor
 * (2026-04-14) para cubrir las dimensiones Big Five restantes
 * (apertura, responsabilidad, extraversión, amabilidad) que el draft
 * inicial de codex no alcanzó por truncamiento del output.
 *
 * Cases are immutable once committed. Do NOT edit existing entries —
 * append new ones at the end to preserve reproducibility against older
 * eval-results snapshots.
 */

export type EvalSource = 'ipip' | 'jung' | 'adversarial';

export interface EvalCase {
  id: string;
  source: EvalSource;
  text: string;
  notes: string;
}

export const EVAL_CASES: EvalCase[] = [
  // ─── IPIP — Openness to experience ───
  {
    id: 'ipip-01',
    source: 'ipip',
    text: [
      'Me la paso encontrando conexiones entre cosas que a primera vista no tienen nada que ver: una película que vi, una idea que leí en un paper, un recuerdo de la infancia, todo me funciona como materia prima.',
      'Disfruto genuinamente de leer sobre temas que no son ni remotamente mi área, desde historia antigua hasta teoría de sistemas, solo porque me da curiosidad cómo piensa la gente en otros lugares del conocimiento.',
      'Cuando alguien me propone algo nuevo —un restaurante raro, un viaje improvisado, una forma distinta de encarar un problema— tiendo a decir que sí antes de evaluar si me conviene.',
    ].join(' '),
    notes: 'Target: apertura alta; curiosidad intelectual amplia, búsqueda activa de novedad y conexiones interdisciplinarias.',
  },
  {
    id: 'ipip-02',
    source: 'ipip',
    text: [
      'Me siento cómodo con las rutinas que tengo armadas y no me gusta particularmente experimentar con cosas nuevas solo porque sí.',
      'Cuando alguien me recomienda un libro o una película que se sale de lo que suelo consumir, muchas veces pienso que preferiría releer o ver de nuevo algo que ya sé que me funciona.',
      'No me interesa mucho lo abstracto o lo especulativo. Si no puedo imaginar cómo se aplica a algo concreto, siento que es discusión de café.',
    ].join(' '),
    notes: 'Target: apertura baja; preferencia por lo familiar y lo concreto sobre lo novedoso.',
  },
  {
    id: 'ipip-03',
    source: 'ipip',
    text: [
      'Cuando miro una obra de arte o escucho una canción que me pega, me quedo pensando en ella durante días, reconstruyéndola mentalmente.',
      'Tengo varios cuadernos a medio llenar con ideas sueltas que probablemente nunca convierta en nada pero que me gusta anotar por las dudas.',
      'Me emociono con detalles que a otros les parecen chicos: un giro de cámara, una metáfora bien puesta, el ritmo interno de un párrafo.',
    ].join(' '),
    notes: 'Target: apertura alta; sensibilidad estética y vida imaginativa rica.',
  },
  {
    id: 'ipip-04',
    source: 'ipip',
    text: [
      'Soy bastante práctico: cuando algo me funciona, no me gusta ponerme a cuestionar por qué funciona o a buscarle vueltas filosóficas.',
      'Las discusiones sobre arte, poesía o teoría social me aburren rápido. Prefiero charlas concretas sobre cosas que se pueden arreglar o hacer.',
      'Si no le veo una utilidad clara a una idea, tiendo a descartarla sin mucho remordimiento.',
    ].join(' '),
    notes: 'Target: apertura baja; orientación pragmática y resistencia a la especulación abstracta.',
  },

  // ─── IPIP — Conscientiousness ───
  {
    id: 'ipip-05',
    source: 'ipip',
    text: [
      'Antes de empezar una tarea nueva armo un plan mental o escrito, con pasos y plazos aproximados. Trabajar sin estructura me pone incómodo.',
      'Cumplo lo que me comprometo, incluso cuando me arrepiento de haber dicho que sí. Me cuesta bastante cancelar o llegar tarde.',
      'Mi espacio de trabajo tiende a estar ordenado. No es que sea maniático, pero encontrar las cosas cuando las necesito me importa.',
    ].join(' '),
    notes: 'Target: responsabilidad alta; autodisciplina, orden y orientación al cumplimiento.',
  },
  {
    id: 'ipip-06',
    source: 'ipip',
    text: [
      'Tiendo a dejar las cosas para último momento y después me apuro. Sé que no es lo ideal pero una parte mía necesita la presión para arrancar.',
      'Los plazos más largos los pierdo de vista y después me encuentro corriendo. En cambio cuando algo es urgente, me pongo las pilas.',
      'Mi escritorio es un caos ordenado: yo sé dónde está cada cosa, aunque el resto piense que no.',
    ].join(' '),
    notes: 'Target: responsabilidad baja; procrastinación activa y dependencia de la urgencia como motor.',
  },
  {
    id: 'ipip-07',
    source: 'ipip',
    text: [
      'Me gusta revisar mi trabajo dos o tres veces antes de entregarlo. Prefiero perder media hora al final que mandar algo con un error evitable.',
      'Hago listas de cosas por hacer y siento satisfacción cuando las tacho. No por performance, sino porque me ayuda a no tener nada flotando.',
      'Cuando me comprometo con una meta, la persigo hasta terminarla aunque se ponga aburrida o difícil. El abandono me incomoda internamente.',
    ].join(' '),
    notes: 'Target: responsabilidad alta; perfeccionismo funcional y perseverancia en metas largas.',
  },
  {
    id: 'ipip-08',
    source: 'ipip',
    text: [
      'Arranco varios proyectos con mucho entusiasmo y después, cuando empiezan las partes aburridas, me aburro y paso al siguiente.',
      'Mi cuarto suele estar medio desordenado. No me molesta, y cuando me molesta lo ordeno una vez y a la semana vuelve al mismo estado.',
      'No soy bueno con los detalles: si algo está funcionando "más o menos", me cuesta dedicarle más tiempo a pulirlo.',
    ].join(' '),
    notes: 'Target: responsabilidad baja; dispersión y tolerancia alta al desorden.',
  },

  // ─── IPIP — Extraversion ───
  {
    id: 'ipip-09',
    source: 'ipip',
    text: [
      'Me cargo de energía cuando estoy con otros. Una sobremesa larga con amigos me deja mejor que cualquier siesta.',
      'Si paso varios días sin ver gente, me pongo un poco inquieto y empiezo a buscar planes con quien sea.',
      'En reuniones con desconocidos tiendo a ser de los que arranca la charla y la sostiene sin mucho esfuerzo; me resulta natural.',
    ].join(' '),
    notes: 'Target: extraversión alta; sociabilidad, energía en interacción y proactividad social.',
  },
  {
    id: 'ipip-10',
    source: 'ipip',
    text: [
      'Después de una juntada larga, aunque la pase bien, necesito dos o tres horas solo para sentirme yo otra vez.',
      'Prefiero las conversaciones de uno a uno o en grupos chicos. Cuando se llena de gente me callo y escucho, o directamente me voy.',
      'No me gusta ser el centro de atención. Cuando alguien me pone en el foco, me pongo tímido y me cuesta pensar con claridad.',
    ].join(' '),
    notes: 'Target: extraversión baja; introspección, preferencia por contactos íntimos y necesidad de recuperación social.',
  },
  {
    id: 'ipip-11',
    source: 'ipip',
    text: [
      'Hablo rápido y bastante, y a veces me doy cuenta tarde de que estoy monopolizando la conversación porque me entusiasmo con el tema.',
      'Me gusta moverme: caminar mientras pienso, hacer varias cosas a la vez, tener siempre algo por delante.',
      'Cuando estoy bajo presión o de buen ánimo tiendo a agarrar el volante de la situación sin preguntar.',
    ].join(' '),
    notes: 'Target: extraversión alta; asertividad y energía física alta.',
  },
  {
    id: 'ipip-12',
    source: 'ipip',
    text: [
      'Disfruto mucho de mi casa, de estar solo leyendo o viendo algo, y cuando el plan del finde se cancela siento una especie de alivio secreto.',
      'Me lleva tiempo confiar en alguien y abrirme. Con los que ya conozco soy distinto, pero con nuevos me voy midiendo.',
      'Prefiero escuchar antes que hablar. Cuando doy una opinión, suele ser después de haber procesado bastante lo que me dijeron.',
    ].join(' '),
    notes: 'Target: extraversión baja; reserva, necesidad de solitud y estilo reflexivo.',
  },
  {
    id: 'ipip-13',
    source: 'ipip',
    text: [
      'Me contagia el entusiasmo de los demás y a la vez contagio el mío. En grupos donde el clima está medio muerto, algo en mí trata de levantarlo.',
      'Suelo acordarme de nombres, de cumpleaños, de detalles chicos de la gente que me importa, porque me importa que el otro se sienta visto.',
      'Me buscan cuando hay que organizar algo social y generalmente digo que sí.',
    ].join(' '),
    notes: 'Target: extraversión alta con componente cálido; emoción positiva y gregariedad.',
  },

  // ─── IPIP — Agreeableness ───
  {
    id: 'ipip-14',
    source: 'ipip',
    text: [
      'Tiendo a darle al otro el beneficio de la duda. Si alguien me trata mal, mi primera hipótesis es que está pasando un mal momento, no que es mala persona.',
      'Me cuesta pedir cosas para mí. Muchas veces pongo las necesidades del otro antes que las mías sin darme cuenta.',
      'Cuando hay conflicto en un grupo, intento que la gente se entienda antes que ganar la discusión.',
    ].join(' '),
    notes: 'Target: amabilidad alta; confianza, altruismo y orientación a la armonía.',
  },
  {
    id: 'ipip-15',
    source: 'ipip',
    text: [
      'No tengo problema en decir lo que pienso aunque incomode. Prefiero un conflicto directo a una paz falsa.',
      'Desconfío un poco de la gente hasta que me muestra con hechos que se puede. No lo tomo como algo personal, es mi default.',
      'Cuando veo que se están aprovechando de mí, pongo el freno sin drama. Prioridades claras: primero lo mío.',
    ].join(' '),
    notes: 'Target: amabilidad baja; asertividad, desconfianza base y autonomía emocional.',
  },
  {
    id: 'ipip-16',
    source: 'ipip',
    text: [
      'Me emociono fácil con las historias de otros. Si veo a alguien llorar en la calle, ya me afecta aunque no lo conozca.',
      'Me gusta ayudar incluso cuando implica un costo personal, y me siento raro cuando alguien me hace un favor y no puedo devolvérselo.',
      'Las películas donde alguien lastima a un animal me arruinan el día. Esa cosa de la compasión está muy conectada en mí.',
    ].join(' '),
    notes: 'Target: amabilidad alta; empatía afectiva y compasión.',
  },
  {
    id: 'ipip-17',
    source: 'ipip',
    text: [
      'Soy bastante directo para dar feedback. Prefiero decirte que algo no me gusta a tragármelo y después estar raro sin que sepas por qué.',
      'En negociaciones no me cuesta pedir lo que quiero y no me pongo nervioso si el otro se incomoda un poco.',
      'Puedo ser cariñoso con gente muy cercana, pero con desconocidos mantengo distancia hasta entender la intención del otro.',
    ].join(' '),
    notes: 'Target: amabilidad baja-media con componente asertivo; franqueza competitiva sin hostilidad.',
  },

  // ─── IPIP — Neuroticism (existing cases 18..20) ───
  {
    id: 'ipip-18',
    source: 'ipip',
    text: [
      'Cuando algo sale mal, mi primera reacción suele ser mirar qué se puede hacer ahora, no quedarme atrapado en el golpe.',
      'No es que no me afecten las cosas, pero tengo bastante registro de proporción. Una mala semana no me hace pensar que toda mi vida está rota.',
      'La gente a veces me dice que transmito calma en momentos tensos, y creo que tiene que ver con que no me desordeno fácil por adentro.',
    ].join(' '),
    notes: 'Target: neuroticismo bajo; regulación emocional y estabilidad bajo presión.',
  },
  {
    id: 'ipip-19',
    source: 'ipip',
    text: [
      'Tengo una mezcla rara entre sensibilidad y autoexigencia. Si alguien que me importa se aleja un poco, enseguida me pregunto en qué fallé.',
      'Me cuesta separar hechos de interpretaciones cuando estoy emocionalmente cargado, y termino leyendo señales en todos lados.',
      'Después suelo acomodarme, pero en el momento todo se siente más grande, más definitivo, más personal.',
    ].join(' '),
    notes: 'Target: neuroticismo alto; sensibilidad al rechazo e intensidad afectiva.',
  },
  {
    id: 'ipip-20',
    source: 'ipip',
    text: [
      'No necesito que todo esté perfecto para sentirme bien. Si hay incertidumbre, la tolero bastante mejor que antes y no me desarmo por no tener control total.',
      'Aprendí a distinguir entre un problema real y una emoción pasajera. Eso me ayuda a no actuar impulsivamente cuando algo me frustra.',
      'Creo que mi mayor fortaleza hoy es esa: sostenerme sin dramatizar cada curva.',
    ].join(' '),
    notes: 'Target: neuroticismo bajo; ecuanimidad y tolerancia a la incertidumbre.',
  },

  // Jung adaptados (20)
  {
    id: 'jung-01',
    source: 'jung',
    text: [
      'Cuando estoy bien, estoy muy metido en lo que pasa acá y ahora. Me doy cuenta enseguida si cambió el clima de un lugar, si una comida está apenas pasada o si alguien se mueve con incomodidad.',
      'Me gusta aprender haciendo: salir, tocar, probar, equivocarme con el cuerpo presente.',
      'Si me quedo demasiado tiempo en la teoría, me siento desconectado de la realidad. Necesito sentir que piso algo vivo, no solo ideas.',
    ].join(' '),
    notes: 'Target: Se dominante; percepción sensorial inmediata y aprendizaje por contacto directo.',
  },
  {
    id: 'jung-02',
    source: 'jung',
    text: [
      'Las mejores decisiones que tomé no salieron de pensarlas seis meses sino de leer el momento con precisión. En situaciones cambiantes reacciono rápido y bastante bien.',
      'Confío mucho en lo que veo, escucho y registro corporalmente.',
      'No me interesa adornar la experiencia: prefiero una verdad concreta, aunque sea incómoda, antes que una interpretación elegante pero lejana de lo que está pasando.',
    ].join(' '),
    notes: 'Target: Se dominante; lectura del presente, rapidez y concreción.',
  },
  {
    id: 'jung-03',
    source: 'jung',
    text: [
      'Guardo recuerdos muy físicos de las cosas: el olor de la casa de mi abuela, la textura de una campera vieja, el cansancio exacto de ciertos días.',
      'Cuando algo del presente me pega, enseguida se me enlaza con otra escena antigua y eso me orienta.',
      'Los rituales me importan más de lo que admito. Hay costumbres simples que me sostienen porque me recuerdan quién fui y qué cosas no quiero perder.',
    ].join(' '),
    notes: 'Target: Si dominante; memoria sensorial autobiográfica y apego a rituales.',
  },
  {
    id: 'jung-04',
    source: 'jung',
    text: [
      'No suelo confiar ciegamente en lo nuevo hasta ver cómo se siente en mí. Mi cuerpo registra muy bien cuándo algo me hace bien y cuándo no, incluso antes de poder explicarlo.',
      'Tengo formas bastante estables de ordenar mis días, y no las vivo como rigidez sino como una manera de cuidar continuidad.',
      'Comparo mucho el presente con experiencias pasadas que me dejaron marca.',
    ].join(' '),
    notes: 'Target: Si dominante; referencia al pasado interno y registro corporal fino.',
  },
  {
    id: 'jung-05',
    source: 'jung',
    text: [
      'Me entusiasma más una posibilidad que una certeza. Escucho una idea y enseguida se me ocurren tres versiones alternativas, conexiones raras o caminos paralelos.',
      'A veces me dicen que salto demasiado rápido de un tema a otro, pero para mí todo está conectado si lo mirás desde el ángulo justo.',
      'Lo nuevo me da energía porque siento que siempre puede aparecer una salida inesperada.',
    ].join(' '),
    notes: 'Target: Ne dominante; asociaciones múltiples, alternativas y entusiasmo por lo posible.',
  },
  {
    id: 'jung-06',
    source: 'jung',
    text: [
      'Tengo la costumbre de empezar frases con “y si...”. No porque esté indeciso, sino porque genuinamente veo más de una puerta abierta casi todo el tiempo.',
      'Me fascina combinar cosas de mundos distintos y descubrir que juntas producen algo que no estaba a la vista.',
      'Mi dificultad no es generar opciones; es elegir una sin sentir que abandono otras muy vivas.',
    ].join(' '),
    notes: 'Target: Ne dominante; divergencia, exploración y costo de cerrar posibilidades.',
  },
  {
    id: 'jung-07',
    source: 'jung',
    text: [
      'Muchas veces sé hacia dónde va algo antes de poder justificarlo. No siempre tengo datos suficientes, pero hay una imagen interna que se arma sola y me marca dirección.',
      'Pienso bastante en símbolos, patrones y movimientos de fondo. Me interesa menos el hecho aislado que el sentido que parece ordenar varios hechos juntos.',
      'A veces me cuesta explicar lo que veo sin sonar demasiado abstracto.',
    ].join(' '),
    notes: 'Target: Ni dominante; síntesis interna, visión de patrón y orientación al futuro.',
  },
  {
    id: 'jung-08',
    source: 'jung',
    text: [
      'No suelo compartir una intuición apenas aparece. La dejo madurar hasta que toma forma adentro y recién ahí la digo.',
      'Me pasa con frecuencia que una imagen, un sueño o una frase suelta se me queda trabajando durante días, y después entiendo por qué era importante.',
      'Necesito una especie de coherencia profunda más que una explicación inmediata.',
    ].join(' '),
    notes: 'Target: Ni dominante; elaboración silenciosa y simbolismo interno.',
  },
  {
    id: 'jung-09',
    source: 'jung',
    text: [
      'Cuando entro en un problema, lo primero que busco es ordenar variables. Necesito saber qué objetivo hay, qué recursos existen, qué proceso conviene y qué sobra.',
      'Me desespera bastante la ineficiencia que podría evitarse con un sistema claro.',
      'No tengo problema en tomar decisiones si siento que la evidencia alcanza. Prefiero ajustar sobre la marcha antes que quedarme en la nebulosa.',
    ].join(' '),
    notes: 'Target: Te dominante; organización externa, criterio de eficiencia y decisión ejecutiva.',
  },
  {
    id: 'jung-10',
    source: 'jung',
    text: [
      'En el laburo me sale pensar en términos de estructura: qué depende de qué, quién tiene que resolver cada parte y cómo medir si realmente avanzamos.',
      'No me enamora discutir ideas solo por elegancia conceptual; me interesa si sirven, si ordenan, si permiten llegar mejor.',
      'Sé que a veces puedo sonar tajante, pero para mí claridad y ejecución van de la mano.',
    ].join(' '),
    notes: 'Target: Te dominante; foco en utilidad, métricas y estructura funcional.',
  },
  {
    id: 'jung-11',
    source: 'jung',
    text: [
      'Tengo una tendencia medio obsesiva a desmontar las cosas hasta entender cómo encajan. Si una explicación tiene agujeros, no me alcanza aunque sea práctica.',
      'Me importa mucho la precisión de las categorías y me irrita cuando dos ideas distintas se meten en la misma bolsa por comodidad.',
      'Antes de actuar necesito sentir que el mapa interno tiene coherencia.',
    ].join(' '),
    notes: 'Target: Ti dominante; consistencia conceptual, análisis fino y necesidad de comprender.',
  },
  {
    id: 'jung-12',
    source: 'jung',
    text: [
      'Suelo pensar mejor cuando estoy solo y puedo seguir un razonamiento hasta el final sin interrupciones. Me hago muchas preguntas del tipo “depende de qué” o “bajo qué condiciones esto sería cierto”.',
      'No busco tanto tener razón frente a otros como construir una explicación que no se contradiga por dentro.',
      'A veces demoro decisiones porque sigo afinando el modelo.',
    ].join(' '),
    notes: 'Target: Ti dominante; razonamiento condicional y búsqueda de verdad interna.',
  },
  {
    id: 'jung-13',
    source: 'jung',
    text: [
      'Capto rápido cómo está emocionalmente un grupo, incluso cuando nadie lo dice de frente. Si noto incomodidad, me sale acomodar el tono, incluir a quien quedó desplazado o traducir lo que alguien quiso decir para que no escale mal.',
      'Necesito sentir que el vínculo sigue respirando.',
      'No es solo quedar bien: me importa de verdad la atmósfera compartida.',
    ].join(' '),
    notes: 'Target: Fe dominante; sintonía grupal, ajuste interpersonal y armonía relacional.',
  },
  {
    id: 'jung-14',
    source: 'jung',
    text: [
      'Muchas de mis decisiones sociales pasan por leer qué necesita el momento entre personas. A veces cedo protagonismo, cambio la forma de decir algo o postergó una crítica si percibo que el otro está muy frágil.',
      'No me gusta la crueldad innecesaria.',
      'Siento alivio cuando todos pueden seguir en diálogo sin quedar humillados.',
    ].join(' '),
    notes: 'Target: Fe dominante; regulación del clima emocional y diplomacia.',
  },
  {
    id: 'jung-15',
    source: 'jung',
    text: [
      'Hay cosas que no negocio aunque me cueste explicarlas. No siempre las digo en voz alta, pero siento con bastante nitidez cuándo algo es fiel a mí y cuándo estoy traicionando una línea interna.',
      'Mis decisiones importantes suelen pasar por ese filtro silencioso.',
      'Desde afuera a veces parece que cambio de rumbo de golpe, pero por dentro vengo sintiendo hace rato que algo dejó de ser verdadero.',
    ].join(' '),
    notes: 'Target: Fi dominante; fidelidad a valores internos y autenticidad privada.',
  },
  {
    id: 'jung-16',
    source: 'jung',
    text: [
      'No necesito que todo el mundo entienda lo que siento para saber que es real. De hecho, muchas veces prefiero guardar ciertas cosas hasta poder nombrarlas sin que se deformen.',
      'Me conmueven situaciones que tocan algo muy personal, aunque por fuera no siempre se note.',
      'Lo importante para mí no es encajar emocionalmente sino ser íntegro con lo que considero valioso.',
    ].join(' '),
    notes: 'Target: Fi dominante; intensidad ética interna y reserva emocional.',
  },
  {
    id: 'jung-17',
    source: 'jung',
    text: [
      'Cuando un proyecto me importa, me sale combinar visión táctica con ejecución inmediata. Leo rápido qué está pasando, detecto oportunidades concretas y ordeno acciones sin perder tiempo en adornos.',
      'Disfruto mucho esos momentos donde el cuerpo y la cabeza van para el mismo lado: ver, decidir, hacer.',
      'Me siento útil cuando la estrategia baja enseguida a movimiento real.',
    ].join(' '),
    notes: 'Target: combinación Se + Te; lectura del entorno con acción eficaz.',
  },
  {
    id: 'jung-18',
    source: 'jung',
    text: [
      'Tengo una forma bastante natural de pensar a mediano plazo. Primero aparece una intuición de hacia dónde conviene ir; después me siento a traducirla en pasos, prioridades y criterios concretos.',
      'No me interesa tener una visión linda si no puedo volverla operativa.',
      'Cuando esto funciona bien, siento que alineo sentido y estructura.',
    ].join(' '),
    notes: 'Target: combinación Ni + Te; visión estratégica con implementación.',
  },
  {
    id: 'jung-19',
    source: 'jung',
    text: [
      'Las ideas que más me mueven son las que me permiten ser honesto conmigo y, al mismo tiempo, abrir algo nuevo. Me entusiasma imaginar formatos distintos para expresar lo que siento sin volverlo cliché.',
      'Necesito que la creatividad tenga una raíz íntima, no solo novedad por novedad.',
      'Cuando encuentro esa mezcla entre autenticidad y posibilidad, trabajo con una energía muy limpia.',
    ].join(' '),
    notes: 'Target: combinación Fi + Ne; autenticidad personal con exploración creativa.',
  },
  {
    id: 'jung-20',
    source: 'jung',
    text: [
      'Me importa mucho sostener ciertos gestos que hacen bien a otros: acordarme de fechas, repetir rituales familiares, estar cuando alguien necesita una presencia confiable.',
      'No vivo eso como obligación vacía; lo siento como una forma concreta de amor.',
      'El pasado, los hábitos y el cuidado del vínculo se me mezclan bastante en la manera de estar para los demás.',
    ].join(' '),
    notes: 'Target: combinación Si + Fe; tradición afectiva, memoria y cuidado relacional.',
  },

  // Adversariales (10)
  {
    id: 'adv-01',
    source: 'adversarial',
    text: [
      'Me gusta pensar que soy espontáneo, pero si las cosas se desordenan demasiado me pongo insoportable. Digo que no necesito controlar nada y, sin embargo, me descubro rehaciendo planes, conversaciones y posibles errores en la cabeza.',
      'También me vendo como alguien frío, aunque la verdad es que una pavada me puede tocar fuerte por dentro.',
      'Soy bastante bueno sosteniendo contradicciones mientras hago de cuenta que no están.',
    ].join(' '),
    notes: 'Edge: contradicción explícita entre autoimagen espontánea, control y sensibilidad.',
  },
  {
    id: 'adv-02',
    source: 'adversarial',
    text: [
      'Me encanta estar con gente hasta que finalmente estoy con gente. Fantaseo con planes, charlas, movimiento, pero después de un rato me quiero ir y volver a casa.',
      'Al mismo tiempo, si paso demasiado solo, me agarra la sensación de estar desapareciendo un poco.',
      'No sé si busco compañía, espejo, ruido o escape; capaz un poco de todo.',
    ].join(' '),
    notes: 'Edge: ambivalencia social; señales mixtas de extraversión e introversión.',
  },
  {
    id: 'adv-03',
    source: 'adversarial',
    text: 'Quiero cambiar, pero cuando algo cambia extraño lo anterior. No sé si soy prudente o cobarde; solo sé que me cuesta soltar.',
    notes: 'Edge: texto muy corto, alta ambigüedad y baja evidencia observable.',
  },
  {
    id: 'adv-04',
    source: 'adversarial',
    text: [
      'Si me preguntás quién soy, podría contestarte cosas completamente distintas según la semana. Hay momentos en los que me siento ordenado, productivo y hasta medio implacable con mis metas; me levanto temprano, hago listas, tacho pendientes y me convenzo de que el mundo es más simple de lo que parece si uno deja de dramatizar.',
      'Después vienen rachas en las que todo ese sistema me queda grande, como si fuera un traje prestado. Me vuelvo lento, hipersensible a cualquier gesto, me distraigo con ideas laterales y paso horas pensando en escenas mínimas o en futuros improbables.',
      'También tengo épocas muy sociales, casi expansivas: organizo planes, respondo rápido, me siento nítido en contacto con otros. Pero no duran siempre. En otros períodos necesito bajar persianas, leer solo, revisar qué parte de lo que hice fue deseo y qué parte fue personaje.',
      'No siento que una versión sea mentira y la otra verdad. Más bien me da la impresión de que conviven capas distintas que no siempre se alinean, y por eso cualquier etiqueta me queda medio corta.',
    ].join(' '),
    notes: 'Edge: texto largo, multiestado, autoobservación compleja y señales cruzadas en varias dimensiones.',
  },
  {
    id: 'adv-05',
    source: 'adversarial',
    text: [
      'A veces sentís que ya te conocés, y después aparece una reacción tuya que te desacomoda por completo. Me pasa eso: por momentos soy recontra racional y te diría que todo se resuelve pensando mejor, pero en el fondo sé que muchas decisiones las tomo por una vibración difícil de justificar.',
      'Vos me ves tranquilo; yo por dentro no siempre lo estoy.',
      'Capaz soy coherente, capaz solo aprendí a explicar lindo mis contradicciones.',
    ].join(' '),
    notes: 'Edge: mezcla voseo/tuteo y tensión entre análisis racional e intuición/emoción.',
  },
  {
    id: 'adv-06',
    source: 'adversarial',
    text: [
      'No me interesa quedar bien con nadie, eso digo. Pero cuando alguien importante se distancia, me pega más de lo que quisiera admitir.',
      'Defiendo mucho mi autonomía y mis límites, aunque después reviso mil veces si fui demasiado duro.',
      'Quiero vínculos honestos, sin dependencia, sin teatro; el problema es que a veces esa misma exigencia vuelve todo más frágil.',
    ].join(' '),
    notes: 'Edge: baja complacencia declarada con alta sensibilidad al vínculo.',
  },
  {
    id: 'adv-07',
    source: 'adversarial',
    text: [
      'En público suelo parecer seguro. Hablo claro, hago chistes, sostengo la energía y hasta improviso bien.',
      'Lo raro es que casi nunca sé si eso expresa algo genuino o si simplemente aprendí a ocupar un rol útil.',
      'Cuando vuelvo a casa me queda una mezcla de satisfacción y vacío, como si hubiera estado muy presente y muy ausente al mismo tiempo.',
    ].join(' '),
    notes: 'Edge: desempeño social alto con duda identitaria y posible agotamiento interno.',
  },
  {
    id: 'adv-08',
    source: 'adversarial',
    text: [
      'No me considero ansioso. Duermo bien, no suelo explotar y en crisis concretas reacciono bastante centrado.',
      'Pero después me encuentro repasando durante horas el tono de una frase, el orden de un mail o la expresión de alguien cuando le contesté algo.',
      'No sé si eso es sensibilidad fina, perfeccionismo o una forma prolija de preocuparme sin decirle preocupación.',
    ].join(' '),
    notes: 'Edge: afecto plano en la superficie con rumiación encubierta y autoetiqueta defensiva.',
  },
  {
    id: 'adv-09',
    source: 'adversarial',
    text: [
      'Puedo pasar de hablar de símbolos, destino y sentido a armar una planilla para comparar opciones en cinco minutos. No lo vivo como incoherencia: necesito ambas cosas.',
      'Si solo me quedo en lo práctico, me seco. Si solo me quedo en lo profundo, me pierdo.',
      'El problema es que desde afuera parezco dos personas distintas, y capaz yo mismo todavía no decidí cómo integrar esas capas.',
    ].join(' '),
    notes: 'Edge: coexistencia fuerte de abstracción intuitiva y lógica estructural.',
  },
  {
    id: 'adv-10',
    source: 'adversarial',
    text: [
      'No soy fácil de leer. Te puedo decir “todo bien” con honestidad relativa mientras por dentro sigo procesando algo desde hace días.',
      'Vos pensás que ya cerré un tema porque no hago escándalo, pero en realidad lo llevo a un cuarto interno donde lo desarmo solo.',
      'A la vez, cuando algo me importa de verdad, puedo actuar rápido y sin titubear. Soy lento para mostrarme, no siempre para decidir.',
    ].join(' '),
    notes: 'Edge: mezcla voseo/tuteo, reserva emocional con decisión situacional rápida.',
  },
];
