/**
 * Comparative descriptions for each of the 6 Pearson-applied archetypes.
 * Built for the ArchetypeMap component so the user learns who they are
 * BY CONTRAST with the other 5 options, not by reading academic definitions.
 *
 * For each archetype we provide:
 * - `motto` — one-line vibe
 * - `drivenBy` — what moves them deep down
 * - `everyday` — concrete, non-academic example
 * - `comparisonTo` — per-pair: "en qué se parece a X, en qué se diferencia"
 */

import type { Archetype } from '@/types';

export interface ArchetypeCompareData {
  motto: string;
  drivenBy: string;
  everyday: string;
  strength: string;
  shadow: string;
  /** How this archetype relates to each of the other 5 */
  comparisonTo: Record<Archetype, string>;
}

export const ARCHETYPE_COMPARE: Record<Archetype, ArchetypeCompareData> = {
  hero: {
    motto: 'Probar el valor a través de la acción',
    drivenBy: 'Superar desafíos concretos. Hacer lo difícil porque te prueba.',
    everyday:
      'El que se levanta a entrenar a las 5am, el que acepta el proyecto que todos dicen que no se puede.',
    strength: 'Coraje en la acción, disciplina, pone el cuerpo donde importa.',
    shadow: 'A veces forza batallas que no vale la pena pelear.',
    comparisonTo: {
      hero: 'Sos vos mismo.',
      sage: 'Vos hacés; el Sabio entiende. Vos pelearías antes de leer sobre la batalla.',
      explorer: 'Los dos buscan afuera, pero vos querés vencer y el Explorador quiere descubrir.',
      creator: 'Vos superás obstáculos; el Creador los transforma en obras.',
      caregiver: 'Vos actuás para probar; el Cuidador actúa para proteger.',
      rebel: 'Los dos rompen paredes, pero vos por honor y el Rebelde por principio.',
    },
  },
  sage: {
    motto: 'Buscar verdad y comprensión profunda',
    drivenBy: 'Entender antes que actuar. La verdad es más valiosa que el resultado.',
    everyday:
      'El que se queda despierto a las 3am leyendo un libro sobre por qué pasó una crisis económica.',
    strength: 'Claridad, síntesis, capacidad de ver patrones donde otros ven caos.',
    shadow: 'Puede over-analizar y postergar decisiones simples.',
    comparisonTo: {
      hero: 'Vos preferís entender antes de actuar; el Héroe actúa y aprende después.',
      sage: 'Sos vos mismo.',
      explorer: 'Los dos aman descubrir, pero vos buscás verdad y el Explorador busca experiencia.',
      creator: 'Vos entendés el mundo; el Creador lo rehace. Muchas veces son primos cercanos.',
      caregiver: 'Vos ves al otro desde la distancia analítica; el Cuidador desde el abrazo.',
      rebel: 'Los dos cuestionan el status quo, pero vos con preguntas y el Rebelde con martillos.',
    },
  },
  explorer: {
    motto: 'Descubrir, no encasillarse',
    drivenBy: 'Libertad, nuevos horizontes, no quedarse nunca quieto.',
    everyday:
      'El que se va a vivir tres meses a un país donde no conoce a nadie, solo para ver qué pasa.',
    strength: 'Curiosidad sostenida, resiliencia al cambio, valentía para irse.',
    shadow: 'Le cuesta comprometerse o terminar lo que empieza.',
    comparisonTo: {
      hero: 'Vos buscás lo desconocido por curiosidad; el Héroe por prueba.',
      sage: 'Vos buscás la experiencia directa; el Sabio, la comprensión reflexiva.',
      explorer: 'Sos vos mismo.',
      creator: 'Vos descubrís lo que ya existe; el Creador inventa lo que no existía.',
      caregiver: 'Vos priorizás tu camino; el Cuidador, el camino del otro.',
      rebel: 'Los dos huyen del status quo, pero vos hacia afuera y el Rebelde contra adentro.',
    },
  },
  creator: {
    motto: 'Transformar ideas en algo real',
    drivenBy: 'Necesita dar forma. Si no existe, lo hago yo.',
    everyday:
      'El que abre una app, un taller de madera, una banda, un negocio — y cada uno con estética propia.',
    strength: 'Visión estética, ejecución, coraje para hacer lo que imaginó.',
    shadow: 'Perfeccionismo que bloquea el envío.',
    comparisonTo: {
      hero: 'Vos hacés obras; el Héroe hace pruebas. Tu arena es lo que queda después.',
      sage: 'Vos usás el conocimiento para construir; el Sabio lo colecciona.',
      explorer: 'Vos armás mundos; el Explorador los visita.',
      creator: 'Sos vos mismo.',
      caregiver: 'Vos creás para expresarte; el Cuidador crea para que otros estén bien.',
      rebel: 'Los dos rehacen lo roto, pero vos con estética y el Rebelde con explosión.',
    },
  },
  caregiver: {
    motto: 'Proteger y cuidar al otro',
    drivenBy: 'Que los demás estén bien. Servir como propósito.',
    everyday:
      'El que se acuerda del cumpleaños de todos y siempre tiene té en la casa para visitas.',
    strength: 'Empatía profunda, paciencia, hacer sentir al otro como en casa.',
    shadow: 'Olvidarse de sí mismo hasta agotarse.',
    comparisonTo: {
      hero: 'Vos protegés a los de la tribu; el Héroe pelea batallas externas.',
      sage: 'Vos cuidás al otro en lo concreto; el Sabio en lo abstracto (con ideas).',
      explorer: 'Vos construís base; el Explorador se va. Muchas veces son opuestos.',
      creator: 'Vos creás espacios seguros; el Creador crea obras personales.',
      caregiver: 'Sos vos mismo.',
      rebel: 'Los dos defienden a alguien, pero vos desde el abrazo y el Rebelde desde la trinchera.',
    },
  },
  rebel: {
    motto: 'Romper lo que no funciona',
    drivenBy: 'Transformar el status quo. Esto está roto y yo lo voy a romper más.',
    everyday:
      'El que renuncia a un trabajo corporativo el día que se da cuenta de que está perdido el sentido.',
    strength: 'Visión crítica, coraje para confrontar, libertad interna.',
    shadow: 'A veces rompe antes de entender y deja ruinas.',
    comparisonTo: {
      hero: 'Los dos pelean, pero vos contra sistemas y el Héroe contra obstáculos.',
      sage: 'Vos querés destruir lo falso; el Sabio quiere entenderlo. Se complementan.',
      explorer: 'Vos rompés adentro; el Explorador huye afuera. Salidas distintas al mismo problema.',
      creator: 'Vos desmantelás; el Creador construye en los escombros.',
      caregiver: 'Los dos defienden a alguien, pero vos rompiendo lo que los oprime.',
      rebel: 'Sos vos mismo.',
    },
  },
};
