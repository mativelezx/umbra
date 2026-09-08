/**
 * Canonical crisis resources shown when the safety pipeline triggers.
 * Argentina-focused. Official sources checked on 2026-09-07:
 * https://www.argentina.gob.ar/node/492429
 * https://www.asistenciaalsuicida.org.ar/horarios-de-atencion
 * https://sosunamigoanonimo.com.ar/?page_id=787
 */

export interface CrisisResource {
  label: string;
  type: 'phone' | 'web';
  value: string;
  region?: string;
  hours?: string;
}

export function crisisResources(): CrisisResource[] {
  return [
    {
      label: 'Centro de Asistencia al Suicida (CAS)',
      type: 'phone',
      value: '135',
      region: 'Argentina (gratuito desde línea fija en CABA y GBA)',
      hours: '8:00 a 0:00',
    },
    {
      label: 'CAS desde celular u otras provincias',
      type: 'phone',
      value: '011-5275-1135',
      region: 'Argentina',
      hours: '8:00 a 0:00',
    },
    {
      label: 'Emergencias',
      type: 'phone',
      value: '911',
      region: 'Argentina',
      hours: '24 horas',
    },
    {
      label: 'Orientación y apoyo en la urgencia de salud mental',
      type: 'phone',
      value: '0800-999-0091',
      region: 'Argentina',
      hours: '24 horas, todos los días',
    },
    {
      label: 'SOS Un Amigo Anónimo',
      type: 'phone',
      value: '011-5263-0583',
      region: 'CABA',
      hours: 'Lun a Vie 10-19h; sábados 10-16h',
    },
    {
      label: 'Organización Panamericana de la Salud',
      type: 'web',
      value: 'https://www.paho.org/es/temas/suicidio',
    },
  ];
}
