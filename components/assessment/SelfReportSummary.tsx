import Link from 'next/link';
import { ArrowRight, Compass, ListChecks, ChatCircle, HandHeart, Waves } from '@phosphor-icons/react/dist/ssr';
import { BFI2S_ATTRIBUTION, BFI2S_DOMAINS, BFI2S_SOURCE } from '@/lib/assessment/bfi2s';
import type { BigFiveSelfReport } from '@/types';
import { formatDateEs } from '@/lib/utils';
import styles from './SelfReport.module.css';
const DOMAIN_ICONS = { openness: Compass, conscientiousness: ListChecks, extraversion: ChatCircle, agreeableness: HandHeart, neuroticism: Waves };

export function SelfReportSummary({ report }: { report: BigFiveSelfReport | null }) {
  return <section className={styles.summary} aria-labelledby="self-report-heading">
    <h2 id="self-report-heading">Lo que vos reconocés en vos.</h2>
    <p>Big Five describe cinco tendencias de personalidad. Tus resultados salen de lo que respondés al cuestionario, no de lo que la IA supone sobre vos.</p>
    {!report ? <><p>Completá 30 afirmaciones para ver tus cinco resultados y una explicación de cada uno. No hay respuestas correctas ni una personalidad ideal.</p><Link className={styles.primaryLink} href="/assessment">Completar mi cuestionario <ArrowRight size={18} aria-hidden="true" /></Link><p className={styles.note}>Opcional · BFI-2-S en español. Si preferís no responderlo, podés abrir «Tu lectura» o elegir una actividad.</p></> : <>
      <p className={styles.note}>Autoinforme · {formatDateEs(report.completedAt)} · escala de 1 a 5</p>
      <div className={styles.dimensions}>{BFI2S_DOMAINS.map(domain => { const Icon = DOMAIN_ICONS[domain.key]; return <div key={domain.key} className={styles.dimension}>
        <div><h3><Icon size={24} weight="light" aria-hidden="true" />{domain.label}</h3><p>{domain.description}</p></div>
        <strong aria-label={`${domain.label}: ${report.scores[domain.key].toFixed(2)} sobre 5`}>{report.scores[domain.key].toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<small> / 5</small></strong>
        <div className={styles.scale} aria-hidden="true"><span style={{ width: `${(report.scores[domain.key]-1)*25}%` }} /></div>
        <div className={styles.scaleLabels} aria-hidden="true"><span>1 · menor presencia declarada</span><span>5 · mayor presencia declarada</span></div>
      </div>; })}</div>
      <p>Es el promedio de seis respuestas por dimensión, ajustando las afirmaciones inversas. Un número mayor expresa más presencia de esa tendencia en tu autodescripción: no significa «mejor». No es un porcentaje, un diagnóstico ni una comparación con otras personas.</p>
      <details className={styles.explore}><summary>Elegí una pregunta para llevarlo a tu día</summary>{BFI2S_DOMAINS.map(domain => <p key={domain.key}><strong>{domain.label}.</strong> {domain.question}</p>)}<p className={styles.note}>Estas preguntas son invitaciones generales, no recomendaciones cuya eficacia se haya comprobado para tu perfil.</p><Link href="/plan">Ver mis actividades</Link></details>
      <p className={styles.note}>El cuestionario no valida automáticamente el ML ni las interpretaciones de Jung. Sus resultados se mantienen separados.</p>
      <Link className={styles.repeatLink} href="/assessment">Volver a responder el cuestionario <ArrowRight size={16} aria-hidden="true" /></Link>
    </>}
    <details className={styles.source}><summary>Fuente y alcance del cuestionario</summary><p>{BFI2S_ATTRIBUTION}</p><a href={BFI2S_SOURCE} target="_blank" rel="noreferrer">Consultar preguntas y clave originales</a><p>La adaptación publicada aporta respaldo al instrumento. No demuestra por sí sola la validez de esta administración web ni del prototipo Umbra.</p></details>
  </section>;
}
