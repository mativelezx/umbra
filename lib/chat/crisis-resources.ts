/**
 * Canonical crisis resources shown when the safety pipeline triggers.
 * Argentina-focused. Numbers verified against public directories as of 2026.
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
      hours: '24 horas',
    },
    {
      label: 'CAS desde celular u otras provincias',
      type: 'phone',
      value: '011-5275-1135',
      region: 'Argentina',
      hours: '24 horas',
    },
    {
      label: 'Emergencias',
      type: 'phone',
      value: '911',
      region: 'Argentina',
      hours: '24 horas',
    },
    {
      label: 'Salud Mental Responde (Ministerio de Salud)',
      type: 'phone',
      value: '0800-999-0091',
      region: 'Argentina',
      hours: 'Lun a Vie 8-20h',
    },
    {
      label: 'SOS Un Amigo Anónimo',
      type: 'phone',
      value: '011-4783-1300',
      region: 'CABA',
      hours: '24 horas',
    },
    {
      label: 'Organización Panamericana de la Salud',
      type: 'web',
      value: 'https://www.paho.org/es/temas/suicidio',
    },
  ];
}
