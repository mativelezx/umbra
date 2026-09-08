import { BookOpen, ChatCircle, Footprints } from '@phosphor-icons/react';
import { BrandMark } from './BrandMark';

export function AccessPrelude() {
  return <aside className="access-prelude" aria-label="Qué podés hacer en Umbra">
    <div className="access-aperture" aria-hidden="true"><BrandMark /><span /><span /><span /></div>
    <h2>Empezá por eso<br />que te viene dando vueltas.</h2>
    <p>Una decisión, un vínculo o un hábito. Contalo con tus palabras y elegí qué querés explorar.</p>
    <ul>
      <li><BookOpen size={22} aria-hidden="true" /><span><strong>Una lectura de tus respuestas</strong><span>Ideas que podés comparar con tu experiencia.</span></span></li>
      <li><ChatCircle size={22} aria-hidden="true" /><span><strong>Un chat para profundizar</strong><span>Preguntá por algo que quieras entender mejor.</span></span></li>
      <li><Footprints size={22} aria-hidden="true" /><span><strong>Actividades para probar</strong><span>Pasos concretos que podés adaptar a tu día.</span></span></li>
    </ul>
    <p className="access-boundary">Prototipo académico de autoconocimiento. Las interpretaciones son de IA; no es terapia ni una evaluación psicológica.</p>
  </aside>;
}
