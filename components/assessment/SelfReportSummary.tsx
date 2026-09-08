import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { BFI2S_ATTRIBUTION, BFI2S_DOMAINS, BFI2S_SOURCE } from '@/lib/assessment/bfi2s';
import type { BigFiveSelfReport } from '@/types';
import styles from './SelfReport.module.css';

export function SelfReportSummary({ report }: { report: BigFiveSelfReport | null }) {
  return <section className={styles.summary} aria-labelledby="self-report-heading">
    <h2 id="self-report-heading">Lo que vos reconocés en vos.</h2>
    <p>Big Five es una forma de describir cinco tendencias de personalidad. Este cuestionario las resume a partir de tus respuestas, no de una interpretación de IA.</p>
    {!report ? <><p>Todavía no completaste esta referencia. Podés sumarla aunque el modelo experimental no tenga cifras para mostrar.</p><Link className={styles.primaryLink} href="/assessment">Completar mi cuestionario <ArrowRight size={18} aria-hidden="true" /></Link><p className={styles.note}>30 afirmaciones · opcional · BFI-2-S en español</p></> : <>
      <p className={styles.note}>Autoinforme · {new Date(report.completedAt).toLocaleDateString('es-AR', { timeZone: 'UTC' })} · escala de 1 a 5</p>
      <div className={styles.dimensions}>{BFI2S_DOMAINS.map(domain => <div key={domain.key} className={styles.dimension}>
        <div><h3>{domain.label}</h3><p>{domain.description}</p></div>
        <strong aria-label={`${domain.label}: ${report.scores[domain.key].toFixed(2)} sobre 5`}>{report.scores[domain.key].toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<small> / 5</small></strong>
        <div className={styles.scale} aria-hidden="true"><span style={{ width: `${(report.scores[domain.key]-1)*25}%` }} /></div>
      </div>)}</div>
      <p>Es el promedio de seis respuestas por dimensión, ajustando las afirmaciones inversas. Un número mayor expresa más presencia de esa tendencia en tu autodescripción: no significa «mejor». No es un porcentaje, un diagnóstico ni una comparación con otras personas.</p>
      <details className={styles.explore}><summary>Elegí una pregunta para llevarlo a tu día</summary>{BFI2S_DOMAINS.map(domain => <p key={domain.key}><strong>{domain.label}.</strong> {domain.question}</p>)}<p className={styles.note}>Estas preguntas son invitaciones generales, no recomendaciones cuya eficacia se haya comprobado para tu perfil.</p><Link href="/plan">Ver mis actividades</Link></details>
      <p className={styles.note}>El cuestionario no valida automáticamente el ML ni las interpretaciones de Jung. Sus resultados se mantienen separados.</p>
    </>}
    <details className={styles.source}><summary>Fuente y alcance del cuestionario</summary><p>{BFI2S_ATTRIBUTION}</p><a href={BFI2S_SOURCE} target="_blank" rel="noreferrer">Consultar preguntas y clave originales</a><p>La adaptación publicada aporta respaldo al instrumento. No demuestra por sí sola la validez de esta administración web ni del prototipo Umbra.</p></details>
  </section>;
}
