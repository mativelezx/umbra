# Cierre de diseño y lettering — 7 de septiembre de 2026

## Estado

App real local promovida en http://localhost:3000, build `wx-kJZ1X7YA2bmvuwVQa8`, PID observado 2691. Fuente: esta copia preservada de entrega. La carpeta original de desarrollo no recibió estos cambios. No se desplegó en Internet ni se entregó al CAE.

Marca: símbolo original de dos aperturas más logotipo `umbra` de cinco contornos vectoriales. El logotipo no depende de Bricolage; esa fuente queda para la interfaz. Brand se comparte en portada, acceso, registro, consentimiento, onboarding y navegación; el informe usa ambos componentes y el favicon solo el símbolo.

Resultado: bloque inicial ilustrado, acción al lector, tres pasos de orientación y pestañas con iconos/explicación. Actividades: biblioteca visual agrupada, geometrías propias y pasos realmente marcados. Acceso: panel oscuro explicativo en escritorio, formulario directo en móvil. Se preservan APIs, puntuación ML, consentimiento, rutas, datos y límites de interpretación. No se agregaron dependencias.

## Evidencia de esta revisión

- 284 pruebas de aplicación en 49 archivos; typecheck, lint y build de producción correctos.
- 5 E2E sintéticos: cuatro anchos (390/768/1292/1440), teclado, foco, preservación del lector, axe, ausencia de cifras no respaldadas; ocho preguntas, actividades y descarga efectiva de PDF. Sin POST a APIs de generación ni base real en esas pruebas.
- 16 E2E de producción en el candidato 3024: portada/educación/FAQ y acceso real a cuenta sintética/transiciones, en Chromium y WebKit. Sin guardado de cambios ni llamadas pagas.
- La primera repetición posterior al lettering dio 12 aprobadas y 4 fallidas: Docker/Supabase se había detenido. Se comprobó ECONNREFUSED en 54321. Tras abrir Docker, los nueve contenedores Umbra volvieron a estar activos; se repitió la misma selección y dio 16/16. No se borraron bases, volúmenes ni cuentas.
- ML health respondió `model_loaded: true`. La investigación reejecutó las métricas sobre matrices guardadas; no se realizó nuevo estudio con personas ni reentrenamiento.
- Capturas en `.impeccable/review/stoic-2026-09-07/`. Referencia Stoic Today/Library inspeccionada en Mobbin; patrones adaptados a web con activos propios, no paridad 1:1 acreditada.

## Revisión y límites

Impeccable orientó jerarquía, guía, contraste, geometrías y movimiento acotado. El revisor independiente examinó 24 capturas previas al lettering: sin hallazgos visuales materiales; pidió sincronizar DESIGN.md. Después del pedido adicional de logotipo, el coordinador inspeccionó capturas nuevas y ejecutó pruebas. La segunda revisión independiente y el documenter se interrumpieron por límite de uso. El coordinador completó DESIGN.md y `.impeccable/design.json`; no se atribuye a terceros el cierre que no realizaron.

El detector corrió una sola vez: exit 2, salida truncada, avisos de tamaños y grises contra el documento anterior. No se presenta como pase limpio. No hay certificación integral de accesibilidad, validación de personalidad o garantía de aprobación académica.

## Demo: requisito escrito

La consigna escrita exige demo del prototipo alojada en la nube con acceso público, enlace y descripción en Demo, después de Conclusiones y antes de Referencias. No exige explícitamente video ni fija duración, resolución, formato o cámara. Los 6–8 minutos del guion son sugerencia, no regla. No se transcribieron las explicaciones docentes en audio, por lo que no se excluyen indicaciones orales adicionales. Fuente guardada: `PRUEBAS-Y-CONSIGNA-2026-09-07.md` en la carpeta de reentrega de Documents. Localhost no reemplaza el enlace público.

## Evidencia del modelo y pendientes

El modelo sigue con cinco estados de baja confianza. Más preguntas no validan un modelo a nivel poblacional. `ML-EVIDENCIA-PLAN-2026-09-07.md` propone evaluación externa con PersonText, pendiente de confirmar permiso, consentimiento y orientación de puntuaciones. Se preparó un borrador para los autores: no se envió ni se descargó el corpus. El piloto propio con IPIP-R-30 es una propuesta de estudio, no una función implementada ni evidencia ya obtenida.

La tesis y el ZIP `Umbra_Codigo_Integrado_2026-09-07.zip` no se actualizaron en esta revisión visual; ese ZIP todavía corresponde a la interfaz anterior. No confundir app local actual con el paquete de entrega. Antes del envío siguen pendientes el checkpoint nuevo de código, material de demo público y enlace en tesis, confirmación del cronograma y revisión/defensa personal del autor. Los documentos externos del cierre del mediodía conservan referencias al build anterior.

## Inicio y reversión locales

Con Supabase/ML activos, el puerto libre y los directorios temporales todavía presentes:

```bash
node /private/tmp/umbra-supabase-recovery.LKk8Iy/run-real-local.mjs start 3000 .next-stoic-candidate
```

Build anterior conservada: `.next-delivery-verified`, ID `GaE7zWBEQVCUCT4jb_urs`. El iniciador sin cuarto argumento usa esa versión para reversión. No correr ambos en el mismo puerto. No hay arranque automático; cerrar Docker, procesos o reiniciar puede detener el entorno. El iniciador privado y los secretos no deben entrar al paquete público.
