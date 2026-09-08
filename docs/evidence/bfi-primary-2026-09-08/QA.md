# Revisión visual y trazabilidad

## Tesis

Documento final: 92 páginas físicas (portada sin número), 40 tablas, nueve figuras sin contar portada y 181 destinos en tres índices. Se verificaron 167 condiciones contra el código final `faa991a`, los artefactos ML, la clave del cuestionario y los resultados de traducción. El PDF no presenta destinos faltantes ni anomalías del detector de paginación. Esos controles no prueban por sí solos toda la calidad académica.

SHA-256 Word: `b79dd4c9f319b64b3470740586a4b30fef48879fd1e9d2d5f94c416aafa5e8e7`.

SHA-256 PDF: `bc625e0fbb5e14bfa593739a020119b81625c1828d42fcebfd3c618f3bab9b85`.

La inspección visual abarcó el documento mediante dos controles complementarios: lectura de las páginas cambiadas y comparación raster exacta del cuerpo de 38 páginas con la versión inmediatamente anterior ya revisada. Se excluyeron los 150 píxeles superiores de esa comparación; encabezados, números e índices se comprobaron por separado. El mapa se conserva en `comparacion-paginas.json`. Varias de esas páginas coincidentes se volvieron a abrir igualmente. No se afirma que las 92 páginas se redibujaron o revisaron manualmente desde cero en la última pasada.

Páginas finales abiertas directamente: 2–27, 32, 34–44, 51, 55, 58, 60, 61, 64, 68–78, 80–82 y 89–92. Las restantes están cubiertas por la identidad raster verificada con la revisión anterior. No se observaron figuras ni filas de tablas cortadas. Se mantienen blancos justificados por cambios de orientación, inicio de anexos y referencias; no se promete ocupación uniforme de cada hoja. Los párrafos largos pueden continuar en la página siguiente sin que se corte una tabla o figura.

El logo institucional actual, formato, numeración, tres índices, cuadros y láminas horizontales se revisaron. Las figuras de interfaz incorporadas en el cuerpo mantienen fecha y procedencia del recorrido anterior; la galería de 52 imágenes documenta el runtime final.

## Aplicación

Cuatro recorridos publicados, iniciados 2026-09-08 16:51 UTC, 52 pantallas/estados: nueve públicos y diecisiete privados en escritorio y móvil. Datos ficticios de una cuenta existente confirmada por administración. El test bloquea las mutaciones de `/api/`, no envía correo, no regenera resultados, no elimina datos y no consume IA paga. Comprueba carga de datos, navegación y descarga real del informe.

Cero hallazgos graves/críticos de axe y cero desborde horizontal del documento de página en las 52 capturas. Los hallazgos menores, si aparecen, quedan en `resultados.json`; estos controles no certifican accesibilidad total ni corrección de toda animación. La emulación móvil no reemplaza un dispositivo físico.

Se inspeccionaron visualmente pantallas representativas de cuestionario, resultado, lectura, Jung, actividades, chat, informe y configuración en ambos tamaños, además de acceso y registro. La vista móvil A4 del informe usa desplazamiento horizontal explícito; el archivo descargado conserva su composición. La barra inferior fija aparece a la altura del viewport en capturas de página completa: no es un salto real del contenido. El barrido automatizado no es una inspección manual exhaustiva de cada palabra o estado posible.

El PDF personal de doce páginas se revisó visualmente: portada oscura, cuestionario, guía, lectura, Jung, actividades, apéndice ML y notas. No se observaron cortes ni páginas en blanco. La última corrección cambió la fecha de la pantalla para coincidir con la del PDF, no su composición. La descarga final se repitió en escritorio y móvil. El cuerpo generado por html2pdf no se certifica como PDF etiquetado plenamente accesible.

## Fallos encontrados y cierre

Se corrigieron las expectativas de los recorridos para atravesar la oferta del cuestionario y la espera de CSS de movimiento reducido, sin desactivar aserciones. La revisión visual encontró una fecha UTC distinta de la argentina entre pantalla y PDF: se añadió una regresión, se confirmó su fallo y se corrigió el formateador compartido. Pasaron 411 pruebas incluso bajo TZ=UTC y los recorridos remotos comprobaron igualdad de fecha. Un lanzamiento local omitió 22 casos por faltar el opt-in de fixtures; no se contó como aprobación y fue sustituido por una ejecución completa de 22/22, cero omisiones y cero reintentos.

El contenido científico no se maquilló para obtener números: cinco dimensiones ML siguen no reportables. El cuestionario ofrece valores de autoinforme, no una validación del predictor. Correo externo, estudio con participantes, restauración probada, retención de proveedores, corte global y confirmación del autor siguen separados de lo verificado.
