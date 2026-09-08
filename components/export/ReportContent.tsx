import { BrandMark } from '@/components/layout/BrandMark';
import { BrandWordmark } from '@/components/layout/BrandWordmark';
import { ReadingArt } from '@/components/dashboard/ReadingArt';
import { ReflectionDiagram } from '@/components/dashboard/ReflectionDiagram';
import { ActivityIllustration } from '@/components/plan/ActivityIllustration';
import { Compass, ListChecks, ChatCircle, HandHeart, Waves, Eye, PencilLine, ArrowRight, Question, Sparkle } from '@phosphor-icons/react/dist/ssr';
import { SectionedNarrative } from '@/components/dashboard/SectionedNarrative';
import { ExplainedText } from '@/components/ui/ExplainedText';
import { GLOSSARY, JUNG_CONTEXT } from '@/lib/knowledge/glossary';
import { extractPerDimensionStatus, STATUS_LABEL } from '@/lib/profile/dimension-display';
import { formatDateEs } from '@/lib/utils';
import { BFI2S_ATTRIBUTION, BFI2S_DOMAINS, BFI2S_SOURCE, extractSelfReport } from '@/lib/assessment/bfi2s';
import { ARCHETYPE_INFO, type BigFive, type JungFunctions, type ReportExportData } from '@/types';

const DIMENSIONS: Array<{ key: keyof BigFive; name: string; meaning: string; question: string; icon: typeof Compass }> = [
  { key: 'openness', name: 'Apertura', meaning: 'Curiosidad por las ideas, la imaginación y las experiencias nuevas.', question: '¿Qué te dio curiosidad últimamente?', icon: Compass },
  { key: 'conscientiousness', name: 'Responsabilidad', meaning: 'Formas de organizarse, sostener tareas y planificar.', question: '¿Qué te ayuda a sostener una tarea?', icon: ListChecks },
  { key: 'extraversion', name: 'Extraversión', meaning: 'Tendencias de participación social, actividad y expresión.', question: '¿Cómo elegís compartir tiempo con otros?', icon: ChatCircle },
  { key: 'agreeableness', name: 'Amabilidad', meaning: 'Formas de cooperar, confiar y considerar a otras personas.', question: '¿Cómo buscás acuerdos sin dejarte de lado?', icon: HandHeart },
  { key: 'neuroticism', name: 'Sensibilidad', meaning: 'Tendencias de respuesta ante el estrés y las emociones difíciles.', question: '¿Qué situaciones te movilizan?', icon: Waves },
];
const FUNCTION_GROUPS: Array<{ title: string; description: string; codes: Array<keyof JungFunctions>; question: string }> = [
  { title: 'Cómo mirás lo que pasa.', description: 'Sensación e intuición: en esta teoría son formas de prestar atención a experiencias, recuerdos y posibilidades.', codes: ['Se', 'Si', 'Ne', 'Ni'], question: 'Pensá en algo que pasó hoy. ¿Qué notaste primero: un detalle, un recuerdo, una posibilidad o una conexión?' },
  { title: 'Cómo considerás una decisión.', description: 'Pensamiento y sentimiento: en esta teoría describen criterios para considerar una decisión. Sentimiento se refiere a valores, no a cuánta emoción sentís.', codes: ['Te', 'Ti', 'Fe', 'Fi'], question: 'Recordá una decisión reciente. ¿Qué pesó más para vos: los pasos, la coherencia, un acuerdo o un valor personal?' },
];

/** One fixed-width print composition; never omits saved narrative or plan content. */
export function ReportContent({ data }: { data: ReportExportData }) {
  const info = ARCHETYPE_INFO[data.profile.archetype];
  const statuses = extractPerDimensionStatus(data.profile.analysisRaw);
  const selfReport = extractSelfReport(data.profile.analysisRaw);
  const secondaryName = Object.entries(ARCHETYPE_INFO).find(([key]) => key === data.profile.archetypeSecondary)?.[1].name ?? data.profile.archetypeSecondary;
  const firstName = data.userName?.trim().split(/\s+/)[0];
  const renderAction = (action: NonNullable<ReportExportData['plan']>['areas'][number]['actions'][number]) => <div key={action.id} className="pdf-action pdf-keep"><div className="pdf-action-opening"><ActivityIllustration title={action.title} completed={0} total={0} /><div><h4>{action.title}</h4><p><ExplainedText text={action.description} document /></p></div></div><ul>{action.microGoals.map((goal, i) => <li key={i}><span className="pdf-checkbox" aria-hidden="true" /><span><ExplainedText text={goal.text} document /></span></li>)}</ul></div>;
  return <>
    <div className="pdf-cover pdf-section">
      <div className="pdf-brand" role="img" aria-label="umbra"><BrandMark /><BrandWordmark /></div>
      <h1>{firstName ? `${firstName},` : 'Tu historia,'}<br />esta lectura<br />es para explorar.</h1>
      <p className="pdf-cover-deck">Un cuaderno para reconocer lo que te resuena,<br />cuestionar lo que no y elegir por dónde seguir.</p>
      <div className="pdf-cover-visual"><ReflectionDiagram /></div>
      <div className="pdf-cover-meta"><strong>{data.userName ?? 'Tu cuaderno personal'}</strong><span>{formatDateEs(new Date())}</span></div>
      <div className="pdf-contents"><span><Eye size={18} />Tu lectura</span><ArrowRight size={16} /><span><Question size={18} />Las palabras, explicadas</span><ArrowRight size={16} /><span><PencilLine size={18} />Un paso posible</span></div>
      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && <p className="pdf-note">Ejemplo local con datos ficticios. No representa un análisis real.</p>}
    <div className="pdf-footer"><p>Generado por Umbra · TFG Ingeniería en Software, Universidad Siglo 21.</p><p>Umbra no es terapia ni diagnóstico. No uses esta lectura para tomar decisiones clínicas.</p><p>Si estás en crisis: 135 (CABA y GBA) · 911 · 0800-999-0091 (Argentina, 24 horas).</p></div>
    </div>

    {selfReport && <div className="pdf-section pdf-self-report">
      <div className="pdf-section-heading pdf-ink-heading"><PencilLine size={46} weight="thin" /><h2>Lo que vos<br />reconocés en vos.</h2><p>Tu autoinforme BFI-2-S en español. Estas cifras se calculan con tus respuestas; no las predice la IA.</p></div>
      <p>Completado el {formatDateEs(new Date(selfReport.completedAt))}. Cada cifra es el promedio de seis respuestas, ajustando los ítems inversos según la clave publicada. Escala de 1 a 5: una cifra mayor expresa mayor presencia declarada de esa tendencia, no un resultado mejor o peor.</p>
      <div className="pdf-dimensions">{BFI2S_DOMAINS.map(domain => <div className="pdf-dimension pdf-keep" key={domain.key}><PencilLine size={28} aria-hidden="true" /><div><h4>{domain.label}</h4><p>{domain.description}</p><p className="pdf-reflection-question">{domain.question}</p></div><span>{selfReport.scores[domain.key].toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / 5</span></div>)}</div>
      <p className="pdf-note">No son percentiles, diagnósticos ni una comparación con otras personas. Este autoinforme no valida el ML ni Jung. Las preguntas de reflexión son invitaciones generales, no intervenciones de eficacia comprobada para tu perfil.</p>
      <p className="pdf-note">{BFI2S_ATTRIBUTION} Fuente: <a href={BFI2S_SOURCE}>formulario y clave originales del Colby Personality Lab</a>.</p>
    </div>}

    {data.narrative && <div className="pdf-section pdf-reading">
      <div className="pdf-section-heading"><h2>No necesitás encajar<br />en esta lectura.</h2><p>Este texto se generó con IA a partir de lo que compartiste. Puede equivocarse. Vos decidís qué tiene sentido en tu experiencia y qué no.</p></div>
      <div className="pdf-reading-guide pdf-keep"><div><Eye size={26} /><strong>Reconocé</strong><p>Subrayá una idea que te resulte cercana.</p></div><div><Question size={26} /><strong>Contrastá</strong><p>Buscá un ejemplo real. También vale disentir.</p></div><div><PencilLine size={26} /><strong>Elegí</strong><p>Quedate con una pregunta para seguir pensando.</p></div></div>
      <div className="pdf-archetype pdf-keep"><ReadingArt chapter={3} /><div><h3>{info.name}</h3><p>{info.description}</p>{secondaryName && <p>Figura secundaria: {secondaryName}</p>}<p className="pdf-note">Una imagen para acompañar la lectura: el arquetipo es una figura simbólica elegida por IA. No es tu identidad, un diagnóstico ni una capacidad medida.</p></div></div>
      <SectionedNarrative content={data.narrative} presentation="document" />
    </div>}

    <div className="pdf-section pdf-new-page">
      <div className="pdf-section-heading pdf-ink-heading"><Compass size={46} weight="thin" /><h2>Cinco miradas.<br />Ninguna te define.</h2><p>Estas dimensiones ayudan a poner en palabras tendencias. No son casilleros en los que tengas que entrar.</p></div>
      <h3>Big Five · estimación experimental de ML</h3>
      <p>Big Five describe cinco dimensiones de personalidad, no tipos de personas. La versión actual de Umbra no tiene evidencia suficiente para mostrar cifras individuales en español.</p>
      <div className="pdf-dimensions">{DIMENSIONS.map(dimension => <div key={dimension.key} className="pdf-dimension pdf-keep"><dimension.icon size={30} weight="light" aria-hidden="true" /><div><h4>{dimension.name}</h4><p>{dimension.meaning}</p><p className="pdf-reflection-question">{dimension.question}</p></div><span>{statuses[dimension.key] === 'ok' ? data.profile.bigFive[dimension.key] : STATUS_LABEL[statuses[dimension.key]]}</span></div>)}</div>
      <div className="pdf-callout"><strong>Qué significa «sin cifra»</strong><p>El sistema no cuenta con validación individual suficiente en este contexto. No significa que una dimensión sea baja, que te falte algo o que hayas respondido mal. No se muestran percentiles ni comparaciones con otras personas.</p></div>
    </div>

    {FUNCTION_GROUPS.map((group, index) => <div className="pdf-section pdf-new-page" key={group.title}>
      <div className="pdf-section-heading pdf-symbol-heading"><div><h2>{group.title}</h2><p>{group.description}</p></div><ReadingArt chapter={index === 0 ? 1 : 3} /></div>
      <p className="pdf-note">Funciones de Jung · interpretación de IA. Los valores guardados, de 0 a 100, son asociaciones simbólicas: no son capacidades medidas, probabilidades ni porcentajes de personalidad. Las letras e / i distinguen una orientación hacia el entorno o hacia la experiencia interna, no si sos sociable o tímido.</p>
      <div className="pdf-function-header"><span>Las siglas, con un ejemplo cotidiano</span><span>Valor simbólico</span></div>
      {group.codes.map(code => <div key={code} className="pdf-function pdf-keep"><span className="pdf-function-code">{code}</span><div><h3>{GLOSSARY[code].name}</h3><p>{GLOSSARY[code].meaning}</p><p className="pdf-function-example"><Sparkle size={14} aria-hidden="true" /><span>Por ejemplo: {GLOSSARY[code].example}</span></p></div><span className="pdf-function-value">{data.profile.jungFunctions[code]}</span></div>)}
      <div className="pdf-prompt pdf-keep"><Question size={26} aria-hidden="true" /><div><strong>Ahora, llevá la idea a tu día.</strong><p>{group.question}</p></div></div>
      <p className="pdf-note">Los ejemplos explican conceptos; no afirman que te pase a vos. Si un texto guardado usa «alto», «bajo» o «débil», no lo leas como una capacidad o un defecto personal. {JUNG_CONTEXT}</p>
    </div>)}

    {data.plan && <div className="pdf-section pdf-new-page">
      <div className="pdf-section-heading pdf-ink-heading"><PencilLine size={46} weight="thin" /><h2>De una idea<br />a algo que podés probar.</h2><p>No hace falta hacer todo. Elegí una propuesta que tenga lugar en tu día y adaptala a tu realidad.</p></div>
      <p className="pdf-note">Propuestas generadas por IA, no indicaciones terapéuticas. Los casilleros son para tus notas en papel; no reflejan ni cambian el progreso de la app.</p>
      {data.plan.areas.map(area => <section key={area.id} className="pdf-area">
        <div className="pdf-area-lead pdf-keep">
        <div className="pdf-area-heading"><h3>{area.name}</h3></div>
        <p className="pdf-rationale"><strong>Por qué aparece esta propuesta. </strong><ExplainedText text={area.rationale} document /></p>
        {area.actions[0] && renderAction(area.actions[0])}
        </div>
        {area.actions.slice(1).map(renderAction)}
      </section>)}
    </div>}

    <div className="pdf-section pdf-new-page pdf-personal-notes">
      <div className="pdf-section-heading pdf-symbol-heading"><div><h2>Lo importante<br />lo escribís vos.</h2><p>Podés volver a estas preguntas otro día. Tu respuesta no tiene que ser perfecta ni coincidir con el informe.</p></div><ReadingArt chapter={4} /></div>
      {['Una idea que reconozco en mi experiencia', 'Algo con lo que no coincido o quiero revisar', 'Un paso pequeño que elijo probar'].map(prompt => <div className="pdf-notes pdf-keep" key={prompt}><h3>{prompt}</h3><div /><div /><div /></div>)}
      <div className="pdf-closing pdf-keep"><BrandMark /><p>Esta lectura no tiene la última palabra.<br /><strong>Tu experiencia también cuenta.</strong></p></div>
      <p className="pdf-note">Estas notas quedan en el papel. No se envían a Umbra ni cambian tus datos en la app.</p>
    </div>

  </>;
}
