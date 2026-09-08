# Umbra · entrega con cuestionario como referencia principal

8 de septiembre de 2026. Esta guía reemplaza para la entrega a `ENTREGA-2026-09-08.md`, que se conserva como antecedente. No certifica aprobación académica ni operación abierta a usuarios externos.

## Archivos y versión que tenés que usar

- [PDF y Word de la tesis, en la publicación BFI](https://github.com/mativelezx/umbra/releases/tag/entrega-cae-bfi-2026-09-08): `TFG_Umbra_Velez_SOF01994.pdf` y `.docx`, 92 páginas físicas. No usar el documento anterior de 94 páginas.
- [Demo publicada](https://umbra-sigma.vercel.app) y [login](https://umbra-sigma.vercel.app/login).
- [Código exacto de la entrega](https://github.com/mativelezx/umbra/tree/entrega-cae-bfi-2026-09-08) e [instrucciones de instalación](../README.md). No hace falta un ZIP para abrir la demo o consultar el repositorio.
- [52 capturas y controles](evidence/bfi-primary-2026-09-08/README.md), [galería local](evidence/bfi-primary-2026-09-08/galeria.html) e [informe personal ficticio descargado](evidence/bfi-primary-2026-09-08/informe-personal-sintetico.pdf). Este último NO es la tesis.
- [CI aprobada del código publicado](https://github.com/mativelezx/umbra/actions/runs/34253066847).

Runtime publicado: `faa991a35e131dd6e01e116837e1064b6f0ead04`. Despliegue: `dpl_82vQbHCz2yfjAdDnS3riQ5nDm5wJ`. La etiqueta de entrega incluye documentación y evidencia posteriores; no cambia el código ejecutado. La rama de trabajo es `codex/reentrega-final-2026-09-07`. La carpeta de desarrollo original del autor se preservó, sin integrar sus cambios pendientes.

## Qué resolvimos, en criollo

El usuario ya no tiene al ML sin cifras como devolución principal. Si responde el cuestionario, ve cinco resultados calculados con sus treinta respuestas y una explicación de cada aspecto. Las respuestas se guardan en su perfil. No son números inventados por IA: cada resultado es el promedio de seis respuestas, invirtiendo las afirmaciones que indica la clave del instrumento. La escala es de 1 a 5, no un porcentaje, diagnóstico o comparación con otras personas.

Después puede leer la interpretación de IA, elegir actividades y conversar sobre lo que escribió. Cuando existe autoinforme, las nuevas generaciones reciben sus cinco promedios, identificados como respuestas declaradas; no reciben los treinta ítems. La interpretación puede servir como punto de partida para reflexionar, pero no se ha demostrado que mejore el bienestar.

Jung aporta imágenes y conceptos para explorar: no es una medición ni una etiqueta definitiva. El ML propio intenta estimar rasgos a partir del texto y queda visible como experimento secundario. Sigue ejecutándose, pero no se habilitan sus cinco cifras individuales. Esto preserva la honestidad del producto y el trabajo de ingeniería: entrenar Ridge, integrar el servicio, comparar alternativas y documentar cuándo una predicción no tiene respaldo suficiente.

**La traducción se probó.** Se compararon 248 textos originales en inglés con sus traducciones automáticas al español, sin entrenar ni cambiar umbrales. El resultado no justificó habilitar cifras personales. No son 496 participantes ni una validación en población argentina. La tesis lo incorpora en el Anexo H, con dos tablas; el [informe reproducible del experimento](../artifacts/audits/translation-transfer-2026-09-08/INFORME.md) distingue procedimiento, resultados y límites.

El BFI-2-S sigue siendo opcional y se ofrece después de la escritura y el análisis inicial. No se construyó un recorrido de cuestionario independiente de ese análisis. Si se omite, la app explica que falta el autoinforme y ofrece completarlo; no fabrica resultados.

## Documento y consignas

Se conservaron los componentes técnicos de Ingeniería en Software: requisitos, criterios, backlog, historias, primer sprint, DER, diccionario, arquitectura, permisos, seguridad, costos, riesgos y evaluación del modelo. Se alinearon el resumen, objetivos, propuesta, pantallas descritas, conclusiones y anexos con la prioridad del cuestionario. No se añadieron tecnologías ni un estudio con participantes inexistente.

El PDF/Word incluye logo institucional actualizado, portada sin número, cuerpo Times New Roman 12, jerarquías, márgenes y numeración según rúbrica, resumen/abstract separados, 40 tablas, nueve figuras y tres índices con 181 destinos comprobados. La paginación mantiene tablas y figuras completas; las páginas horizontales y comienzos de capítulos pueden dejar blanco justificado. Las capturas insertas del recorrido previo están identificadas como tales; las de la interfaz final están en la galería adjunta. No se altera su procedencia.

El cruce final dio **167 controles aprobados, cero fallos**. Es evidencia de las condiciones definidas en el verificador, no certificación de todas las exigencias posibles ni aprobación del CAE. No se confunde con 167 casos de uso.

### Fechas del cronograma

Se conserva el período 16 de marzo–18 de julio de 2026, reconstruido mediante Git y entregas de Canvas. Hitos de entrega: 26/04, 15/05, 07/06 y 28/06. No se presentan los commits como horas efectivas de trabajo. Las correcciones de septiembre se distinguen de la tutoría. La discrepancia entre una decisión fechada 14/04 y el pedido docente del 16/04 queda explícita. Matías debe confirmar que la reconstrucción representa lo realmente realizado; no se retrofechó Git.

## Pruebas: qué se ejecutó y qué no

| Evidencia final | Resultado y alcance |
| --- | --- |
| Web: lógica y componentes | 411/411, 67 archivos; tipos, lint y build aprobados |
| Navegador local | 22/22, cero omitidos/reintentos: cuestionario, teclado, lectura, actividades, movimiento reducido y PDF con datos ficticios |
| Navegador publicado | 4/4 recorridos; 52 pantallas/estados; lectura de cuenta ficticia guardada y descarga real del PDF; cero hallazgos graves/críticos de axe y cero desborde horizontal de página |
| Procedimiento de traducción | 10/10 pruebas; experimento retrospectivo de 248 pares conservado sin modificar modelo ni umbrales |
| Documento/código | 167/167 controles; 181 destinos exactos del índice; revisión visual de composición |

Chromium de escritorio y emulación móvil no equivalen a todos los navegadores ni a teléfonos físicos. Axe no certifica accesibilidad completa. El PDF descargado conserva composición A4; su vista previa se desplaza horizontalmente en móvil y no se presenta como un PDF etiquetado plenamente accesible.

Las 37 pruebas Python con pesos reales, seis grupos de base remota y recorrido con Claude real se ejecutaron en las revisiones anteriores del 7–8/9 y conservan su procedencia en la evidencia histórica. El parche final no cambia esos módulos. El último barrido no repitió generaciones pagas, entrega de correo ni alta de usuarios. No se suman conteos de distinto alcance como una sola cifra de cobertura.

La revisión visual detectó una diferencia de fecha entre pantalla y PDF. Se corrigió con un formateador compartido en huso argentino y una regresión que también se ejecutó en TZ=UTC. Los tests comprueban la coincidencia en la app publicada. Las pestañas internas no repiten la cortina; Impeccable orientó la jerarquía, iconos y explicaciones de origen, sin cambiar nuevamente la marca.

## ¿Demo o video?

La consigna escrita de Canvas M4 dice: «Deberás presentar una demo del prototipo guardada en algún servicio de alojamiento en la nube». Solicita acceso público, vínculo y descripción del material en Demo, después de Conclusiones y antes de Referencias. La sección está en la página impresa 66 del PDF actual, con enlaces web y código.

**No hay una duración, resolución ni obligación de MP4 identificada en ese texto escrito.** Tampoco se certifica haber revisado toda indicación oral o individual posterior. La fuente conservada es la consigna de [Prototipado tecnológico](https://siglo21.instructure.com/courses/42755/pages/prototipado-tecnologico). La entrega escrita se solicita en PDF. Una grabación de respaldo de 5–7 minutos es una sugerencia, no una exigencia encontrada. No se grabó un video por el autor.

### Recorrido de demo y estudio

1. Presentá el problema: ordenar lo que una persona cuenta de sí y ofrecer referencias y actividades de reflexión, sin diagnosticarla.
2. Entrá con la cuenta ficticia confirmada. El acceso se entrega en un archivo privado separado. Mostrá el registro como formulario, sin afirmar que su correo de confirmación está probado.
3. Mostrá Tu cuestionario: el ejemplo guardado tiene treinta respuestas neutrales y cinco valores de 3/5. Explicá promedio, inversión y escala. No son percentiles.
4. Abrí Tu lectura y luego Otras miradas. Distinguí autoinforme, interpretación de IA y experimento ML. Podés discrepar con la lectura.
5. Abrí una actividad y el historial de conversación ya guardado. Mostrá el PDF y las opciones de exportación/privacidad, sin eliminar la cuenta.
6. Cerrá con lo implementado, las pruebas y lo que falta validar con personas. Es más defendible que prometer precisión no demostrada.

No vuelvas a guardar el cuestionario de la cuenta de demo sólo para grabar: reemplaza el autoinforme e invalida la lectura y el plan anteriores; regenerarlos consume crédito. Tampoco reinicies el análisis ni envíes chat sin revisar el presupuesto. Navegar lo guardado y descargar el PDF no requiere generar otra lectura.

## Pendientes que impiden decir “100 % cerrado”

- **Correo externo:** falta dominio propio verificado y SMTP. El subdominio de Vercel no permite verificar por sí solo un remitente. Registro con confirmación, recuperación y eliminación por correo externo no están demostrados de punta a punta. Las plantillas de marca existen, pero no sustituyen esta configuración. La cuenta de demo se confirmó por administración.
- **Validación:** no hubo estudio con participantes, validación de la administración web del cuestionario, de las estimaciones ML en español ni de mejora del bienestar. La fuente del instrumento no valida toda la plataforma.
- **Operación ampliada:** quedan restauración probada, retención de proveedores y corte global de gasto. El límite por usuario no equivale a un corte de toda la cuenta.
- **Responsabilidad del autor:** confirmar cronograma, leer el documento, comprender decisiones y reconocer la asistencia utilizada. Los trabajos de referencia son ejemplos, no dictámenes de aceptación de Umbra. No se garantiza aprobación del CAE ni un resultado de Turnitin.

Usá los archivos de esta publicación, leé el PDF y revisá estos límites antes de subirlo. No entregar claves, archivos `.env`, el acceso privado ni respuestas ficticias como si fueran evidencia obtenida con participantes reales.
