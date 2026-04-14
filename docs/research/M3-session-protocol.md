
# M3 — Protocolo de sesión think-aloud (40 min)

## Objetivo
Observar cómo una persona usa Umbra por primera vez, detectar fricciones reales en onboarding y dashboard, y relevar usabilidad percibida mediante SUS y preguntas abiertas.

## Antes de empezar

### Checklist de setup
- [ ] Participante confirmado y mayor de 18 años.
- [ ] Consentimiento informado firmado y a mano para referencia.
- [ ] OBS abierto y configurado para grabar pantalla + audio.
- [ ] Micrófono probado.
- [ ] URL de prueba lista.
- [ ] Servidor de desarrollo corriendo.
- [ ] Plantilla de notas abierta.
- [ ] Formulario SUS listo:
  - [ ] Google Form abierto, o
  - [ ] Hoja impresa / documento listo para leer en voz alta.
- [ ] Carpeta de destino para grabación verificada: `~/umbra-m3-recordings/`.
- [ ] Nombre de archivo definido: `M3-PXX-YYYY-MM-DD`.
- [ ] Agua / pausa breve ofrecida antes de iniciar.

## Guion minuto a minuto

| Minuto | Actividad | Guion / acción del moderador |
|---|---|---|
| 0-3 | Bienvenida | Agradecer, generar confianza, explicar que se evalúa la interfaz, no a la persona. |
| 3-5 | Consentimiento | Confirmar firma, repasar puntos clave, responder dudas. |
| 5-7 | Permiso de grabación | Confirmar permiso explícito para pantalla y audio. Iniciar OBS. |
| 7-10 | Instrucciones think-aloud | Explicar que verbalice todo: dudas, expectativas, confusión, decisiones. |
| 10-13 | Inicio de tarea | Compartir URL y pedir que entre como si fuera la primera vez. |
| 13-30 | Tarea principal | Completar onboarding hasta llegar al perfil / dashboard. Observar sin guiar. |
| 30-33 | Exploración libre | Pedir que recorra el dashboard y use lo que le llame la atención. |
| 33-36 | SUS | Administrar SUS por Google Form o en voz alta. |
| 36-39 | Preguntas abiertas | Hacer 3 preguntas + probes neutrales. |
| 39-40 | Cierre | Agradecer, ofrecer retirar datos si luego cambia de idea, frenar grabación. |

## Guion de bienvenida
Decir, con tono relajado:

> Gracias por sumarte. Esta sesión forma parte de mi TFG de Ingeniería en Software en la Universidad Siglo 21.  
> Hoy no te estamos evaluando a vos: estamos evaluando una experiencia web.  
> Si algo te resulta raro, confuso o incómodo, eso nos sirve un montón.  
> No hace falta que “lo hagas bien”. Me interesa ver qué te pasa de manera natural.

Evitar en esta instancia:
- Explicar en detalle qué es Umbra.
- Describir hipótesis del estudio.
- Anticipar qué debería gustarle o costarle.
- Defender decisiones de diseño.

## Instrucciones de think-aloud
Leer casi textual:

> Mientras la usás, te voy a pedir que pienses en voz alta.  
> Decí todo lo que te vaya pasando por la cabeza: qué esperás que pase, qué te confunde, qué te gusta, qué no entendés, qué estás buscando.  
> Si te quedás en silencio, puede que te recuerde suavemente que sigas verbalizando.  
> No hay respuestas correctas ni incorrectas.

Si se queda callado más de 30 segundos:
- “¿Qué estás pensando ahora?”
- “¿Qué esperabas que pasara?”
- “Contame qué te hace dudar.”

## Protocolo de observación

### Qué anotar
- Timestamps de momentos relevantes.
- Dudas o interpretaciones espontáneas.
- Citas textuales breves.
- Hesitaciones, retrocesos, misclicks, scrolls repetidos.
- Lugares donde pide ayuda.
- Señales de carga cognitiva:
  - silencios largos,
  - suspira,
  - relee,
  - vuelve atrás,
  - dice “no entiendo”, “no sé”.
- Reacciones afectivas relevantes:
  - sorpresa,
  - risa,
  - incomodidad,
  - alivio,
  - frustración.
- Qué esperaba encontrar y qué encontró realmente.

### Qué no hacer
- No explicar cómo funciona la interfaz.
- No completar pasos por la persona salvo bloqueo claro.
- No corregir “errores”.
- No hacer preguntas dirigidas del tipo “¿te gustó esto?” en medio de la tarea.
- No justificar decisiones del producto.
- No interrumpir una secuencia valiosa solo porque parece lenta.
- No interpretar en voz alta lo que “debería” hacer.

### Regla de intervención mínima
- Si hay silencio: recordar think-aloud.
- Si hay confusión sostenida: esperar.
- Si queda bloqueado más de 2 minutos o pide ayuda directa: usar una repregunta neutral.
- Si sigue bloqueado: permitir avanzar con ayuda mínima y registrar el incidente.

Repreguntas neutrales permitidas:
- “¿Qué te haría sentido hacer acá?”
- “¿Qué opción te parece más probable?”
- “¿Qué te está frenando?”

## Descripción de la tarea
Leer textual:

> Te voy a pasar una URL.  
> Quiero que la abras y la uses como si fuera la primera vez que entrás.  
> Tu objetivo es completar el recorrido inicial hasta llegar al dashboard y, cuando llegues, explorarlo libremente.  
> No hace falta que lo termines perfecto; si algo no te cierra, seguí contando qué pensás.

Tareas esperadas:
- Abrir la URL.
- Completar onboarding.
- Llegar al dashboard o pantalla principal.
- Explorar el dashboard libremente.

## Administración de SUS

### Opción recomendada: Google Form
Usar Google Form cuando:
- la sesión remota permite abrir otra pestaña o usar otro dispositivo;
- la persona está cómoda leyendo y respondiendo sola;
- querés reducir sesgo del moderador y capturar respuestas limpias.

Instrucción:
> Ahora te voy a pedir que completes 10 afirmaciones cortas sobre la experiencia.  
> Respondé del 1 al 5, desde “muy en desacuerdo” hasta “muy de acuerdo”.

### Opción alternativa: leído en voz alta
Usar lectura en voz alta cuando:
- hay problemas técnicos;
- la persona está en móvil y cambiar de pantalla complica;
- hay fatiga visible;
- necesitás accesibilidad adicional.

Regla:
- Leer cada ítem sin reformular.
- Repetir la escala si hace falta.
- No comentar ni reaccionar a las respuestas.

## Preguntas abiertas de cierre
Hacer estas 3 preguntas, en este orden:

1. ¿Qué fue lo que más te sorprendió de la experiencia?
   - Probes: “¿Para bien, para mal o ambas?”, “¿En qué momento pasó?”
2. ¿Qué parte te resultó más incómoda, confusa o pesada?
   - Probes: “¿Qué esperabas encontrar ahí?”, “¿Qué te habría ayudado?”
3. Si pudieras cambiar una sola cosa antes de que esto lo use otra persona, ¿qué cambiarías?
   - Probes: “¿Por qué esa y no otra?”, “¿Eso te frenó o solo te molestó?”

## Guion de cierre
Decir:

> Gracias por el tiempo y por decir en voz alta todo lo que te iba pasando.  
> Esto me sirve para detectar problemas reales de uso.  
> Voy a anonimizar la sesión antes de analizarla y, si más adelante cambiás de idea, me podés pedir que retire tu grabación o tu transcripción de este estudio.  
> ¿Te quedó alguna pregunta o algo que quieras agregar?

## Manejo de riesgo y malestar
Si la persona muestra malestar emocional significativo:
1. Pausar la tarea.
2. Preguntar con calma si quiere frenar, seguir más despacio o terminar la sesión.
3. Recordar que puede retirarse sin explicar motivos.
4. Si lo pide, detener también la grabación.
5. No insistir en continuar.
6. Ofrecer recursos de ayuda en Argentina.

Frase sugerida:
> Podemos pausar acá. No hace falta seguir si te está haciendo mal.  
> Si querés, cortamos la sesión y no hay ningún problema.

Recursos a compartir:
- Línea 135 — Centro de Asistencia al Suicida.
- 011-5275-1135 — CAS desde celular u otras provincias.
- 0800-999-0091 — Salud Mental Responde.
- 911 — Emergencias, si hay riesgo inmediato.

## Checklist post-sesión
- [ ] Frenar y guardar grabación de OBS.
- [ ] Verificar que el archivo abrió correctamente.
- [ ] Mover la grabación a `~/umbra-m3-recordings/`.
- [ ] Registrar código del participante: `P1`, `P2`, etc.
- [ ] Completar notas inmediatas en caliente.
- [ ] Exportar o copiar respuestas SUS.
- [ ] Transcribir o pasar por Whisper para borrador.
- [ ] Subir transcripción anonimizada al template correspondiente.
- [ ] Reemplazar nombres propios y datos identificatorios.
- [ ] Guardar solo citas anonimizadas en materiales del repo.
- [ ] Confirmar que consentimientos y grabaciones queden fuera del repo.
