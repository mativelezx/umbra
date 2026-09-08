import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BookOpenText, CaretDown, Compass, Eye, FilePdf,
  Footprints, Handshake, Heart, Lightbulb, ListChecks, Notebook,
  PencilLine, Scales, UsersThree, Waves,
} from '@phosphor-icons/react/dist/ssr';
import styles from './Education.module.css';

const dimensions = [
  {
    name: 'Apertura de mente',
    meaning: 'Qué te da curiosidad',
    description: 'Tu interés por ideas nuevas, el arte y experiencias distintas.',
    example: 'Probar algo nuevo o disfrutar de lo que ya conocés.',
    Icon: Compass,
  },
  {
    name: 'Responsabilidad',
    meaning: 'Cómo te organizás',
    description: 'Tu manera de planificar, sostener tareas y cumplir compromisos.',
    example: 'Armar una lista antes de una entrega o resolver sobre la marcha.',
    Icon: ListChecks,
  },
  {
    name: 'Extraversión',
    meaning: 'Cómo participás con otros',
    description: 'Cuánto buscás compañía, conversación y actividades en grupo.',
    example: 'Tomar la palabra en una reunión o preferir una charla de a dos.',
    Icon: UsersThree,
  },
  {
    name: 'Cordialidad',
    meaning: 'Cómo tratás a los demás',
    description: 'Tu disposición a escuchar, colaborar y confiar en otras personas.',
    example: 'Cómo buscás un acuerdo cuando pensás distinto de alguien.',
    Icon: Handshake,
  },
  {
    name: 'Emocionalidad negativa',
    meaning: 'Cómo vivís las preocupaciones',
    description: 'La frecuencia de preocupación y cambios emocionales que reconocés en vos. También se llama neuroticismo; no indica un trastorno.',
    example: 'Seguir pensando en un contratiempo o recuperar la calma más fácilmente.',
    Icon: Waves,
  },
];

export function LandingPossibilities() {
  return (
    <section className={`${styles.container} ${styles.possibilities}`} aria-labelledby="possibilities-title">
      <div className={styles.intro}>
        <h2 id="possibilities-title">Cuando querés cambiar algo, pero no sabés por dónde.</h2>
        <p>Una decisión que postergás. Un hábito que repetís. Una relación que querés entender. No necesitás llegar con todo claro: podés empezar por una situación concreta.</p>
      </div>
      <div className={styles.possibilityList}>
        <article>
          <PencilLine size={30} aria-hidden="true" />
          <h3>Ordenar lo que pensás</h3>
          <p>Preguntas, una por vez, para contar lo que te pasa sin tener que empezar con una hoja en blanco.</p>
        </article>
        <article>
          <BookOpenText size={30} aria-hidden="true" />
          <h3>Mirarlo de otra manera</h3>
          <p>Una lectura de tus respuestas para reconocer ideas, hacerte preguntas y decidir qué coincide con tu experiencia.</p>
        </article>
        <article>
          <Footprints size={30} aria-hidden="true" />
          <h3>Elegir qué hacer después</h3>
          <p>Actividades con pasos concretos que podés adaptar, probar o dejar para otro momento.</p>
        </article>
        <article>
          <FilePdf size={30} aria-hidden="true" />
          <h3>Volver a tus ideas</h3>
          <p>Guardá la lectura en tu cuenta o descargala en PDF para revisarla cuando te sirva.</p>
        </article>
      </div>
    </section>
  );
}

export function LandingEducation({ isDemo }: { isDemo: boolean }) {
  return (
    <>
      <section id="pilares" className={`${styles.container} ${styles.bigFive}`} aria-labelledby="big-five-title">
        <div className={styles.sectionHeading}>
          <h2 id="big-five-title">Big Five, en palabras simples.</h2>
          <div>
            <p>Big Five significa «los cinco grandes». Es una forma de estudiar cinco aspectos de la personalidad, como la curiosidad o la manera de organizarte.</p>
            <p>El cuestionario de 30 afirmaciones es la referencia principal de tu resultado en Umbra. Resume cómo te describís vos: no te encasilla en un tipo de persona. Responderlo es opcional.</p>
          </div>
        </div>
        <div className={styles.dimensionList}>
          {dimensions.map(({ name, meaning, description, example, Icon }) => (
            <article key={name} className={styles.dimension}>
              <Icon className={styles.dimensionIcon} size={34} weight="regular" aria-hidden="true" />
              <div className={styles.dimensionTitle}>
                <h3>{name}</h3>
                <p>{meaning}</p>
              </div>
              <p className={styles.dimensionDescription}>{description}</p>
              <p className={styles.dimensionExample}><span>En lo cotidiano</span>{example}</p>
            </article>
          ))}
        </div>
        <p className={styles.source}>Estos ejemplos explican ideas; no son preguntas de un test. Fuentes: <a href="https://www.colby.edu/wp-content/uploads/2013/08/Soto_John_2012.pdf">Soto y John, 2012 (PDF, inglés)</a> y <a href="https://www.colby.edu/wp-content/uploads/2013/08/Soto_John_2017.pdf">2017 (PDF, inglés)</a>.</p>
        <aside className={styles.modelNote} aria-labelledby="experimental-title">
          <div>
            <h3 id="experimental-title">Tus respuestas no son una adivinación.</h3>
            <p>El cuestionario y el ML son cosas distintas.</p>
          </div>
          <div>
            <p>El cuestionario calcula cinco promedios de 1 a 5 a partir de lo que respondés. La IA no inventa esos números. Se usa el BFI-2-S en español, con sus preguntas y cálculo originales.</p>
            <p>Por separado, un modelo de aprendizaje automático (ML) intenta estimar rasgos desde tus textos. Todavía no tiene evidencia suficiente en español: por eso sus cinco estimaciones se muestran sin cifras. Completar el cuestionario no valida ese modelo.</p>
          </div>
        </aside>
      </section>

      <section id="jung" className={styles.jungSection} aria-labelledby="jung-title">
        <div className={`${styles.container} ${styles.jungLayout}`}>
          <figure className={styles.portrait}>
            <Image
              src="/landing/jung-1909.jpg"
              alt="Carl Gustav Jung de pie frente a un edificio, en una fotografía histórica de alrededor de 1909."
              width={1854}
              height={2383}
              sizes="(max-width: 760px) min(100vw - 40px, 360px), (max-width: 1050px) 32vw, 360px"
            />
            <figcaption>
              Carl Gustav Jung, hacia 1909. Autor desconocido.<br />
              Library of Congress, vía <a href="https://commons.wikimedia.org/wiki/File:Jung_1910.jpg">Wikimedia Commons</a>. Dominio público en EE. UU. <a href="/landing/source-note.md">Ver procedencia y derechos</a>.
            </figcaption>
          </figure>
          <div className={styles.jungCopy}>
            <h2 id="jung-title">Jung: otra forma de hacerte preguntas.</h2>
            <p className={styles.biography}>Carl Jung estudió cómo interpretamos lo que vivimos. Umbra toma algunas de sus ideas para ayudarte a mirar una situación desde distintos ángulos.</p>
            <p>No necesitás aprender siglas. Por ejemplo, ante una decisión podés preguntarte:</p>
            <dl className={styles.functionList}>
              <div><dt><Scales size={23} aria-hidden="true" />Lo que tiene lógica</dt><dd>¿Qué razones tengo para elegir esto? Jung lo llamó pensamiento.</dd></div>
              <div><dt><Heart size={23} aria-hidden="true" />Lo que me importa</dt><dd>¿Esta decisión respeta mis valores? Jung lo llamó sentimiento: valorar, no solo emocionarse.</dd></div>
              <div><dt><Eye size={23} aria-hidden="true" />Lo que veo</dt><dd>¿Qué está pasando de verdad, acá y ahora? Es la idea de sensación.</dd></div>
              <div><dt><Lightbulb size={23} aria-hidden="true" />Lo que podría pasar</dt><dd>¿Qué otras posibilidades imagino? Es la idea de intuición.</dd></div>
            </dl>
            <div className={styles.jungLimit}>
              <h3>Una imagen para pensar, no una etiqueta.</h3>
              <p>También podés encontrar figuras como «el Sabio»: una manera de hablar de la búsqueda de conocimiento. A estas imágenes se las llama arquetipos. Sirven como metáforas para la lectura, no para definir quién sos.</p>
              <p>La interpretación la genera IA y podés no estar de acuerdo. No es una medición, un diagnóstico ni MBTI; no tiene el mismo respaldo que el Big Five.</p>
            </div>
            <p className={styles.source}>Para conocer las ideas originales: <a href="https://www.jungpage.org/learn/jung-lexicon">Jung Lexicon, de Daryl Sharp (inglés)</a>. Sobre su vida: <a href="https://isapzurich.com/en/about/faq/">ISAPZURICH (inglés)</a>.</p>
          </div>
        </div>
      </section>

      <section id="actividades" className={`${styles.container} ${styles.activities}`} aria-labelledby="activities-title">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="activities-title">Actividades de reflexión</h2>
            <p className={styles.activityLead}>Que no quede solo en leer.</p>
          </div>
          <p>La app propone actividades a partir de tus respuestas. Elegí una, abrí sus pasos y marcá lo que hiciste. Vos decidís el ritmo; no hay una personalidad ideal que alcanzar.</p>
        </div>
        <div className={styles.activityExamples}>
          <article className={styles.writingExample}>
            <Notebook size={38} aria-hidden="true" />
            <h3>Escribir unos minutos</h3>
            <p>Elegí algo de tu día que te haya dejado pensando y anotá por qué.</p>
            <div className={styles.writingPrompt}>
              <p>¿Qué me llamó la atención hoy?<br />¿Por qué quiero recordarlo?</p>
              <span>Una pregunta de ejemplo para empezar.</span>
            </div>
            <p>Podés usar un cuaderno. No hace falta compartir ese texto con Umbra.</p>
          </article>
          <div className={styles.moreActivities}>
            <article>
              <Footprints size={29} aria-hidden="true" />
              <div>
                <h3>Prestar atención al caminar</h3>
                <p>Durante una caminata, prestá atención a un sonido, una textura o un detalle. Después, si querés, anotá qué notaste.</p>
              </div>
            </article>
            <article>
              <Handshake size={29} aria-hidden="true" />
              <div>
                <h3>Pedir ayuda con una cosa chica</h3>
                <p>Pensá en una tarea para la que te serviría ayuda y en alguien de confianza a quien podrías pedírsela.</p>
              </div>
            </article>
            <p className={styles.exampleLimit}>Estos son ejemplos. Las sugerencias de tu cuenta pueden ser distintas y no garantizan un cambio en tu bienestar.</p>
            <Link className={styles.action} href={isDemo ? '/plan' : '/register'}>
              {isDemo ? 'Ver actividades de ejemplo' : 'Crear una cuenta'}<ArrowRight size={21} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.computingNote}>
          <h3>La idea es llevarlo a tu día.</h3>
          <p>Podés cerrar la app y probar una actividad fuera de la pantalla. Este criterio se inspira en Positive Computing: diseñar tecnología que tenga en cuenta el bienestar y la libertad de elegir. Es una intención de diseño, no una eficacia demostrada. <a href="https://mitpress.mit.edu/five-minutes-with-rafael-a-calvo-and-dorian-peters/">Conocer el enfoque (MIT Press, inglés)</a>.</p>
        </div>
      </section>

      <section id="preguntas" className={`${styles.container} ${styles.faq}`} aria-labelledby="faq-title">
        <div className={styles.faqIntro}>
          <h2 id="faq-title">Antes de empezar.</h2>
          <p>Lo esencial para decidir si Umbra es lo que estás buscando.</p>
          <div className={styles.dataNote}>
            <h3>Tus datos y tus decisiones</h3>
            <p>Antes de compartir texto, revisá quién lo procesa y qué controles tenés.</p>
            <Link href="/privacy">Leer la política de privacidad<ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.questions}>
          <details>
            <summary>¿Qué recibo al terminar?<CaretDown size={21} aria-hidden="true" /></summary>
            <div><p>Si completás el cuestionario, primero ves sus cinco resultados y qué significa cada uno. En otra pestaña tenés una lectura de IA sobre lo que contaste. También podés elegir actividades, seguir conversando en el chat y descargar un informe PDF.</p><p>El cuestionario es opcional. La lectura y las actividades las genera IA; los cálculos del cuestionario no. Los ejemplos de esta portada son ficticios, no resultados sobre vos.</p></div>
          </details>
          <details>
            <summary>¿Dónde interviene la inteligencia artificial?<CaretDown size={21} aria-hidden="true" /></summary>
            <div><p>Claude, de Anthropic, ayuda a generar preguntas, lecturas, actividades y respuestas del chat a partir de tu contexto. Puede equivocarse: compará lo que dice con tu experiencia.</p><p>Los promedios del cuestionario se calculan con una regla fija, no con IA. El modelo propio que intenta estimar rasgos desde texto sigue siendo experimental y muestra sus límites por separado.</p></div>
          </details>
          <details>
            <summary>¿Es un test de personalidad o una consulta profesional?<CaretDown size={21} aria-hidden="true" /></summary>
            <div><p>Umbra es una herramienta académica para reflexionar, no una consulta profesional. Incluye un cuestionario de personalidad opcional, pero eso no convierte a la app en una evaluación psicológica validada.</p><p>No ofrece terapia, diagnósticos ni tipos MBTI. No debe usarse para decisiones médicas o selección laboral. No se ha demostrado que mejore el bienestar.</p></div>
          </details>
          <details>
            <summary>¿Necesito saber de psicología para usarlo?<CaretDown size={21} aria-hidden="true" /></summary>
            <div><p>No. Está pensado para personas adultas y usa preguntas sobre situaciones cotidianas. No hay una respuesta correcta ni una personalidad ideal que alcanzar.</p><p>Podés hacer una pausa y decidir qué querés compartir. Una actividad es una invitación, no una obligación.</p></div>
          </details>
          <details>
            <summary>¿Qué pasa con lo que escribo?<CaretDown size={21} aria-hidden="true" /></summary>
            <div><p>En el recorrido con cuenta, Supabase almacena datos y Anthropic recibe texto y contexto para generar contenido. El módulo propio de aprendizaje automático también procesa texto. Evitá incluir información privada de otras personas.</p><p>Configuración reúne descarga de datos, participación en investigación y solicitud de eliminación. Sus alcances y los de los proveedores están explicados en la <Link href="/privacy">política de privacidad</Link> y en el consentimiento que revisás antes de empezar.</p></div>
          </details>
        </div>
      </section>
      <section className={`${styles.container} ${styles.closing}`} aria-labelledby="closing-title">
        <h2 id="closing-title">No tenés que tener todo claro para empezar.</h2>
        <p>Traé una situación que te importe. El primer paso es contarla.</p>
        <Link href="/register" className={styles.action}>Empezar a conocerme<ArrowRight size={21} aria-hidden="true" /></Link>
        <p className={styles.source}>Creá tu cuenta y revisá el uso de tus datos antes de responder.</p>
      </section>
    </>
  );
}
