# Autoinforme independiente y evaluación del ML

Fecha: 7 de septiembre de 2026. Implementación autorizada por el autor en esta conversación. Clasificación Agent OS: feature, datos y ML, IA y confianza, interfaz, documentación académica. Canal: web de escritorio y móvil. Se conserva el producto del cursado y el modelo propio; no se promete aprobación académica.

## Entorno y alcance

Código de la entrega: clon conservado `/private/tmp/umbra-entrega-audit.B6Tyg8/repo`. Base Git 0350f43 con cambios anteriores preservados; no se atribuyen a esta intervención. Respaldo de los archivos inicialmente afectados: `/private/tmp/umbra-evidence-backup.KmFlLw/before.tgz`. Producción web local anterior en 3000 preservada durante las pruebas; candidatos en 3025 (ficticio) y 3026 (integración local).

Datos de prueba: fixtures y una cuenta sintética de prefijo `umbra-e2e-`, no datos de personas reales. Supabase local en 54321; sin reset ni nuevas migraciones. Anthropic autorizado para el recorrido acotado de prueba. No se publica un despliegue ni se entrega en Canvas. No se envían textos de los corpus descargados a proveedores de IA.

## Qué cambió

Se incorporó el BFI-2-S español de 30 afirmaciones, manteniendo las palabras, el orden, cinco opciones y clave de dominios del formulario publicado por sus autores. Los ítems inversos se corrigen con seis menos la respuesta y se promedian los seis ítems de cada dominio. Las 30 respuestas son necesarias: no se imputan faltantes. No se calculan facetas ni se inventan baremos. La escala visible es de 1 a 5, no porcentajes.

El cuestionario se ofrece después del análisis de los textos y antes de la carta y lectura guardada. También se accede desde el resultado mediante `/assessment`. Es opcional; tiene aceptación propia y no guarda borradores en disco. Los datos completos se conservan en `psychological_profiles.analysis_raw.selfReport`, separados de `ml`. El servidor calcula los resultados y rechaza cifras enviadas por el cliente. La actualización conserva el resto del JSON y comprueba que el perfil no haya cambiado durante el guardado. Se aplican sesión, consentimiento y propiedad de la cuenta, además de RLS.

Los datos se incluyen en la exportación de cuenta y se eliminan con el perfil al borrar la cuenta. Una nueva respuesta reemplaza el autoinforme anterior e invalida por fecha los contenidos derivados de la versión anterior. Las próximas generaciones pueden usar los cinco promedios, no las treinta respuestas. Este paso no incorpora datos al conjunto de investigación, no entrena el ML y no convierte a quien responde en participante de una validación. Se registra `priorFeedback: not_controlled`: el recorrido no es una administración ciega de investigación.

La nueva UI envía al ML solo la escritura libre de onboarding mediante `mlTexts`. Las preguntas generadas, significados internos de opciones, retratos importados y cuestionario no son entradas de esa inferencia. El endpoint conserva compatibilidad con clientes anteriores que envían solo el transcript y registra esa procedencia distinta. El recorrido necesita al menos una respuesta escrita.

Se corrigieron interpretación y extracción de citas para no enviar cifras ML no reportables como pistas ocultas. Narrativa, actividades y chat reciben además ejemplos explícitos compartidos por la persona, acotados a 16 entradas de hasta 600 caracteres. Deben explicar la procedencia de sus sugerencias y distinguir texto personal, autoinforme y metáforas de Jung. El respaldo de un instrumento no demuestra eficacia de los consejos ni una correspondencia Big Five–Jung.

## Fuentes y uso

- [Formulario español y clave de dominios del BFI-2-S](https://www.colby.edu/wp-content/uploads/2022/07/bfi2s-form-spanish.pdf). John y Soto; adaptación de Gallardo-Pujol, Oceja, Cortijos-Bernabeu y Rouco.
- [Condiciones del Berkeley Personality Lab](https://www.ocf.berkeley.edu/~johnlab/bfi.html): uso gratuito para investigación no comercial; los autores conservan los derechos. No autoriza una explotación comercial de Umbra.
- [Estudio de adaptación española](https://www.colby.edu/wp-content/uploads/2023/06/Gallardo-Pujol_et_al_2022.pdf). La evidencia del instrumento no es validación de esta administración web.

## Alternativas de datos revisadas

PAN15 tiene una fuente oficial con texto y puntuaciones de cuestionario, pero no se consiguió una descarga GET utilizable en esta sesión: HEAD respondió 200; GET terminó por timeout o HTTP no satisfactorio. No se entrenó con PAN ni se inventó un manifiesto de participantes.

PersonText v1 sí se descargó del sitio de los autores para inspección. El CSV tiene 213 filas de texto, 81 valores distintos de `uid` y 79 identificadores con más de una fila. No deben presentarse las filas como 213 personas independientes. No hay textos idénticos exactos. Los campos incluyen `neuroticismo` y `presenta_neuroticismo`; su orientación debe resolverse con documentación o autores, no por intuición. Faltan condiciones explícitas de reutilización del CSV y verificar si cada UID corresponde a una persona y cómo se trataron mediciones repetidas. El archivo incluye datos personales adicionales y permanece fuera del código y paquete entregable. No fue admitido para entrenamiento ni prueba de Umbra.

## Comparación efectivamente ejecutada

`ml/scripts/compare_existing.py` comparó la media constante de entrenamiento, el TF-IDF + Ridge guardado y el DistilBERT + Ridge guardado sobre las mismas 248 filas inglesas de prueba. No se ajustaron modelos ni umbrales. Se excluyeron las dos viñetas sintéticas españolas del resultado comparativo. No se encontraron IDs o textos normalizados idénticos entre las particiones; esto no demuestra por sí solo identidades de participantes independientes.

Las etiquetas inglesas son binarias. Para el cálculo se expresaron como 0 y 1; no se presentan como puntuaciones continuas originales de un cuestionario. Es una revisión retrospectiva de un conjunto ya observado, no una nueva prueba ciega. Los hashes de pesos, matriz y particiones permanecieron iguales antes y después.

| Dimensión | RMSE constante | RMSE TF-IDF | RMSE DistilBERT |
| --- | ---: | ---: | ---: |
| Apertura | 0,4992 | 0,4821 | 0,4826 |
| Responsabilidad | 0,5009 | 0,4979 | 0,4990 |
| Extraversión | 0,5006 | 0,4943 | 0,4946 |
| Cordialidad | 0,5009 | 0,4960 | 0,5016 |
| Neuroticismo | 0,5001 | 0,4906 | 0,4999 |

Menor RMSE indica menor error sobre estas etiquetas binarias. TF-IDF obtuvo menor error en las cinco dimensiones de este conjunto; no se estudió significación estadística ni transferencia a español. No hay base para presentar DistilBERT como superior por ser más complejo. Archivo reproducible: `ml/comparison-2026-09-07.json`.

## Evaluación española pendiente

Para una evaluación independiente se requieren textos originales de participantes adultos, un cuestionario administrado sin revelar predicciones o sugerencias previas, permiso explícito y una partición por persona definida antes de ajustar modelos. Originales, fragmentos, traducciones y repeticiones de cada participante deben permanecer en el mismo grupo. Se deben fijar instrumento, orientación de dominios, criterios y métricas antes de abrir el conjunto final. No se usa la respuesta del cuestionario como entrada del predictor que se evalúa contra ella. Si cambia el instrumento entre corpus y evaluación, no se trata como escala intercambiable sin estudiar la relación.

Esta sesión no obtuvo nuevas mediciones humanas ni reservó una muestra española admitida. Por eso no hay nueva validación individual ni se cambia el estado de confianza de `ridge_v1`. El autoinforme da una referencia real basada en respuestas; no es un atajo para aprobar al predictor.

## Verificación

Verificación final del incremento, 7 de septiembre, alrededor de las 19:10 (Argentina):

- 328 pruebas de aplicación correctas en 55 archivos; TypeScript y lint correctos. Compilación de producción correcta, BUILD_ID `VAZueVEKzBMwB_vtE546j`, sin cambios de dependencias ni nuevos esquemas.
- ML: 25 pruebas correctas y una omitida. Replay de métricas e inferencia real desde texto correctos; comparación retrospectiva ejecutada. No se cambió ningún peso, partición ni umbral.
- Cuestionario en modo demo: 2 pruebas correctas, Chromium de escritorio y WebKit móvil. Incluyen 30 respuestas, cálculo, navegación y controles axe; no representan una certificación completa de accesibilidad.
- Integración con cuenta sintética: registro y consentimiento; ocho pasos de escritura con proveedor; inferencia ML; guardado del cuestionario; exportación que comprueba que ML no cambió; generación y persistencia de narrativa y plan. La primera ejecución detectó Docker detenido y otra detectó un control de origen incompatible con la normalización de Next.js: se corrigieron y repitieron las etapas. Una aserción antigua del selector de actividades falló después de generarlas; fue corregida. No se presenta ese intento inicial como una suite completa aprobada.
- Sobre la compilación candidata en 3027 pasaron las dos comprobaciones de perfil guardado, actividades persistidas y PDF. Se inició exactamente el mismo artefacto en 3000, sin recompilar: allí pasaron 3 pruebas con ingreso real, cuestionario y exportación conservados, casilla de actividad guardada y restaurada, PDF, una respuesta nueva del chat y reapertura de su historial.
- El informe descargado tiene 12 páginas. Se revisaron visualmente todas: el autoinforme tiene cinco promedios y el ML conserva cinco estados de evidencia insuficiente. Se eliminó el salto doble que dejaba una hoja vacía. El PDF de la app está rasterizado; no se declara accesibilidad de su texto.
- La tesis revisada tiene 89 páginas, 35 tablas y 9 figuras. Se revisaron todas las páginas; tras el último ajuste se compararon imágenes y se revisaron nuevamente las cinco que cambiaron. Se comprobaron 110 destinos de índices, sin faltantes ni desbordes detectados y con fuentes incrustadas.

Docker y Supabase local fueron recuperados sin reset ni borrar cuentas anteriores. Los resultados neutros del cuestionario son datos ficticios de QA, no mediciones humanas. La cuenta conserva desactivada la investigación. Las pruebas con Anthropic fueron acotadas y autorizadas; no se reutilizan como evidencia de validez del instrumento.

No se verificaron despliegue público, correo/eliminación por email, restauración de backups, validez española del predictor ni eficacia o usabilidad con participantes. La revisión humana, las fechas del cronograma y el enlace público de la demo siguen pendientes. No se entregó en Canvas ni se promete aprobación. El código preparado vive en el clon indicado arriba y el ZIP conserva una copia independiente del directorio temporal.
