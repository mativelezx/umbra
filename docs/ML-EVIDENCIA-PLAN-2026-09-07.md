# Evidencia real para el módulo ML de Umbra

Fecha: 7 de septiembre de 2026. Destinatario: tesista y dirección del TFG.
Estado: investigación y protocolo propuesto; no es un estudio con participantes ejecutado.

## Decisión recomendada

Hay un camino concreto: evaluar el bundle actual, congelado, contra un corpus real en español que tenga autoinformes de sus autores y condiciones de reutilización confirmadas. PersonText es el primer candidato. La búsqueda encontró su publicación, portal y formato, pero no resolvió la autorización específica del CSV ni una inconsistencia en neuroticismo. Esos son los pendientes precisos antes de descargarlo y evaluarlo.

En paralelo, un piloto propio de textos más autoinforme permitiría obtener evidencia en la población destinataria. Es un estudio nuevo: requiere personas, consentimiento y revisión del procedimiento. La ruta más próxima a la entrega es conservar la evidencia funcional ya reproducible, documentar la prueba externa y ejecutar una evaluación breve de uso cuando esté autorizado el entorno. No hace falta reconstruir la arquitectura ni pagar una API de personalidad.

Los cinco `low_confidence` actuales son coherentes con la evidencia. El estado se carga por dimensión desde las métricas del modelo; **no calcula la confianza del texto que acaba de escribir cada persona**. Escribir más texto puede cambiar la predicción, pero no produce una validación poblacional ni desbloquea el estado.

## Alcance y controles de este trabajo

- Clasificación Agent OS: investigación, auditoría de ML/datos y documentación de defensa.
- Canal: aplicación web en español; evaluación analítica local, sin despliegue.
- Datos consultados: documentación pública, código, métricas y artefactos históricos de la copia de entrega. No se accedió a Supabase ni a mensajes de usuarios.
- Contratos: `PROJECT_PROFILE.md`, `AGENT_OS.md`, `workflows/research.md`, `agents/research.md`, `REAL_DATA_ENVIRONMENT_CONTRACT.md` y `AI_RISK_REGISTER.md`.
- No se descargaron los CSV externos, no se contactó a investigadores, no se llamó a proveedores pagos y no se entrenó ni cambió el modelo o sus estados.
- El trabajo solo agrega este documento. La copia original de desarrollo conserva sus cambios.

## Qué se puede demostrar hoy

| Pregunta | Evidencia actual | Límite de la conclusión |
|---|---|---|
| ¿El artefacto produce resultados y se pueden recalcular sus métricas? | Bundle existente, script de verificación, matrices guardadas, contratos y tests del módulo. | Evidencia funcional y de reproducción parcial; no reconstruye todo el entrenamiento histórico. |
| ¿Predice etiquetas del corpus inglés? | Test inglés de 248 ensayos. Apertura: R² 0,0634, r 0,2581, AUC 0,6486 y exactitud balanceada 0,5952. | Resultado exploratorio de ese corpus; ninguna dimensión supera ambos criterios de regresión del proyecto. |
| ¿Predice un autoinforme real de personas hispanohablantes? | El test local español contiene dos viñetas sintéticas, con una etiqueta disponible por viñeta. | No existe aquí una evaluación de esa pregunta. |
| ¿Es comprensible y útil para personas reales? | La tesis revisada describe un protocolo de usabilidad pendiente. | Los tests de software y una demo sintética no contestan esta pregunta. |

Verificación nueva ejecutada el `2026-09-07T16:29:23.113545+00:00`, sin red y sin escribir un informe nuevo:

```bash
cd ml
PYTHONDONTWRITEBYTECODE=1 HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
  .venv/bin/python scripts/verify_bundle.py
```

Resultado: `cached_matrix_metrics_replayed=true`, `split_ids_disjoint=true` y las cinco dimensiones con `low_confidence`. Inventario comprobado: entrenamiento 1973 ensayos ingleses + 16 viñetas; validación 246 + 2; prueba 248 + 2. SHA-256 del bundle: `93eeecaaef2f334216783f0057184cbd2864edd43a484d3459e881b03d536612`.

Esta corrida volvió a comprobar métricas sobre las matrices guardadas. No volvió a ejecutar inferencia desde texto. La inferencia local previa y la comparación de dos embeddings están registradas en `ml/verification-2026-09-07.json`; esa muestra tampoco demuestra la procedencia completa de todas las matrices.

El guard de `MIN_BLOCK_N=30` en `ml/src/predict.py` es una regla técnica del prototipo. Treinta casos, incluso reales, no bastan por sí solos para declarar una dimensión válida. No debe modificarse el JSON o el umbral para conseguir estados favorables.

## Corpus candidatos: evidencia primaria y pendientes

### PersonText: primera opción para evaluación externa

El artículo describe 213 textos de transcripciones, asociados al IPIP de 50 ítems, valores 0–1 y etiquetas binarias. Documenta sustitución de nombres. Su tabla incluye `UID`, `Text`, fecha, cinco pares valor/etiqueta, sexo y edad. La regla publicada para la etiqueta es valor >0,6; sin embargo, la tabla 2 presenta `NeuV=0,7/0,9` con `NeuT=No`. Es necesario aclarar si representa estabilidad, inversión o una errata. La sección de disponibilidad remite a una descarga, sin detallar una licencia del CSV. [Bátiz-Beltrán et al., 2024, artículo original](https://www.scielo.org.mx/pdf/cys/v28n3/2007-9737-cys-28-03-1115.pdf).

El portal del equipo publica PersonText v1, una v2 de 306 opiniones y un conjunto separado denominado PersonText-myPersonality Esp. No muestra términos de reutilización del corpus. Para esta ruta se propone exclusivamente PersonText original, sin incorporar el conjunto myPersonality. [Portal del Instituto Tecnológico de Culiacán](https://catalabs.mx/datasets/persontext/).

Pendientes de admisión:

1. Confirmación del responsable de que permite descargar/procesar localmente esa versión para investigación académica no comercial y publicar métricas agregadas. La licencia del artículo no acredita automáticamente la del archivo externo. La redistribución del CSV es una autorización distinta y no es necesaria para evaluar.
2. Confirmación del alcance del consentimiento o base de publicación para reutilización investigadora y de qué anonimización se aplicó. Quitar nombres por sí solo no demuestra que una narración no pueda reidentificarse.
3. Diccionario de datos, instrumento/traducción y clave de puntuación; aclaración especial de `NeuV/NeuT`, versión recomendada y cantidad de personas únicas. No asumir que filas equivale a participantes independientes.

No hay un rechazo del autor ni evidencia de prohibición: hay condiciones que no se pudieron confirmar en las fuentes públicas revisadas. No se descargó el corpus para inspeccionar textos mientras persisten esas ambigüedades.

### Otras opciones localizadas

| Recurso | Qué aporta | Qué falta o qué limita su uso en Umbra |
|---|---|---|
| [TxPI-u, autores, 2018](https://arxiv.org/html/1806.07977v1) | Ensayos en español de 416 estudiantes mexicanos con TIPI; el artículo describe participación informada y valores 1–7. | Confirmar acceso actual, condiciones de reutilización y archivo apto. TIPI y población universitaria mexicana no equivalen al corpus inglés ni al uso argentino. |
| [HWxPI, organizadores ChaLearn](https://chalearnlap.cvc.uab.es/dataset/29/description/) | Transcripciones de ensayos mexicanos y etiquetas binarias derivadas de TIPI. | Registro de competición requerido; revisar condiciones. No se necesitan imágenes manuscritas. No asumir independencia respecto de TxPI-u sin verificar autores/participantes. |
| [PAN 2015, organizadores](https://pan.webis.de/clef15/pan15-web/author-profiling.html) | Textos de Twitter en español y puntuaciones de rasgos entre −0,5 y +0,5. | Género textual diferente, acceso y condiciones por confirmar. No hidratar perfiles ni recopilar mensajes de redes como atajo. |

La disponibilidad de estos recursos cambia la decisión: no es necesario inventar un corpus español para buscar la primera evaluación externa. No cambia la conclusión actual del modelo; todavía no fue evaluado en esos datos.

## Prueba externa propuesta, sin reentrenar

Una vez resueltos los tres pendientes de PersonText:

1. **Congelar antes de mirar resultados:** hash del bundle, extractor y revisión; librerías, tokenización, límite de 512 tokens, orden de dimensiones y protocolo de métricas. Escribir las exclusiones y transformaciones antes de calcular asociaciones.
2. **Admitir el archivo:** guardar prueba del permiso y hash fuera del repositorio público; validar columnas y rango; contar filas y personas. Conservar solo el texto desidentificado, un ID de estudio y etiquetas necesarias. No copiar fechas, sexo o edad si no forman parte del análisis aprobado.
3. **Fijar la unidad de evaluación:** una observación por persona o una regla previa para combinar sus textos. Si hay repeticiones, agrupar por participante tanto la evaluación como el remuestreo. Revisar duplicados y posible solapamiento con cualquier dato de entrenamiento.
4. **Predecir en local:** cargar `ridge_v1.joblib` y ejecutar el extractor congelado con los textos originales en español. No ajustar pesos, alpha, plantillas, calibración ni cortes con este corpus. Registrar cuántos textos se truncan y evaluar la entrada completa que realmente consume el modelo.
5. **Evaluar asociación como resultado principal:** Pearson r y Spearman rho por dimensión, n efectivo, intervalos de confianza por participante y distribución de salidas. Si falta variación, informar la métrica como no estimable. Publicar las cinco dimensiones, incluidas las desfavorables; no seleccionar la mejor como resultado global.
6. **Evaluar discriminación como secundario:** AUC contra las etiquetas binarias oficiales, tras confirmar su orientación. Exactitud balanceada/F1 solo con un corte de predicción fijado antes; el corte histórico 50 puede probarse como política existente, no presentarse como óptimo para IPIP. Comparar con una regla constante como referencia, reportando el desbalance.
7. **Separar escalas:** dividir la salida Ridge por 100 produce un rango 0–1, pero no la convierte en puntuación IPIP ni en probabilidad calibrada. MSE/MAE/R² contra IPIP pueden añadirse como diagnóstico exploratorio de esa correspondencia, con el cambio de instrumento explícito. No afirmar que 70 Ridge significa lo mismo que 0,70 IPIP. Si se quisiera calibrar, haría falta otra partición por personas y una nueva prueba independiente.
8. **Cerrar con un informe externo:** versión/hash, permiso, n real, exclusiones, truncamiento, métricas con incertidumbre, fallos y límites. Mantenerlo fuera de `eval_metrics.json` y de los estados productivos hasta revisión científica y académica. Un resultado nulo o negativo es evidencia real y se conserva.

La inferencia es técnicamente factible porque ambos lados admiten texto y cinco dimensiones comparables como hipótesis de convergencia; el principal problema no es la forma del tensor, sino el significado del criterio. El entrenamiento actual usa principalmente BFI binario inglés; PersonText usa otro autoinforme, idioma y situación comunicativa.

Estimación de implementación, no medición de rendimiento: una jornada de trabajo para admisión, adaptador aislado, cálculo e informe si los metadatos llegan completos; procesamiento local de cientos de textos, sin llamadas pagas. Costo de API necesario: **US$0**. No se promete una duración exacta de CPU ni el tiempo de respuesta de los investigadores. No se presume licencia gratuita hasta recibir su aclaración.

## Piloto propio con adultos: propuesta acotada

Objetivo: obtener pares auténticos de texto y autoinforme y comprobar si la salida congelada se asocia con el criterio en el contexto de Umbra. No comprobar que la IA conoce a la persona ni estudiar efectos terapéuticos.

- **Primera etapa operativa:** 5–8 voluntarios adultos para verificar instrucciones, comprensión y captura. Si esas sesiones llevan a cambiar el procedimiento, tratarlas como ensayo y excluirlas de la evaluación posterior.
- **Piloto exploratorio:** objetivo de 30–50 adultos hispanohablantes con datos completos, reportando el n finalmente obtenido. Esta cantidad es una propuesta de factibilidad, no un cálculo de potencia ni una muestra representativa. No abrir el acceso o cambiar estados al llegar a 30.
- **Recorrido por participante:** consentimiento de investigación separado del uso del producto; texto personal con una consigna neutral, antes de mostrar cuestionario o predicción; autoinforme con instrucciones y clave originales; al terminar, devolución que explique el carácter experimental. No pedir identificadores de terceros, historia clínica ni relatos íntimos innecesarios.
- **Instrumento:** escoger una versión y mantenerla fija. Ver opciones abajo; revisar el scoring con una persona competente. La respuesta autoinformada es un criterio con sus propios errores, no una verdad absoluta.
- **Datos:** ID aleatorio; vínculo de contacto separado y acceso limitado; fin, plazo de conservación y retiro definidos. Guardar versión del consentimiento/instrumento, texto desidentificado y respuestas necesarias. No enviar narraciones a servicios de IA ni publicarlas en el repositorio. El consentimiento general del producto no se presume permiso para entrenamiento.
- **Análisis:** el mismo diseño externo, por participante, sin entrenar con el piloto. Analizar sensibilidad a longitud/truncamiento y mostrar n por dimensión, faltantes e intervalos. Si se exploran cinco rasgos, etiquetar esa multiplicidad y evitar cinco declaraciones independientes de éxito basadas solo en p <0,05.
- **Segunda ocasión opcional:** un segundo texto 1–2 semanas después sirve para explorar estabilidad. Cuenta como seguimiento de la misma persona, no como un nuevo participante ni una validación longitudinal suficiente.
- **Después:** revisar resultados con dirección del TFG. Solo una fase posterior, con una partición nueva y reglas previas, puede usar datos autorizados para entrenar o calibrar.

Como referencia de precisión, con n=30 y r observado=0,30, el intervalo aproximado del 95 % por transformación de Fisher sería −0,07 a 0,60, bajo sus supuestos. Incluso una correlación aparentemente razonable tendría mucha incertidumbre. Es un cálculo ilustrativo, no un resultado del piloto.

Antes de reclutar corresponde confirmar con la dirección académica el procedimiento de revisión ética aplicable y quién administra el estudio. Deben quedar definidos información al participante, finalidad, acceso, retiro y seguridad de los datos. La referencia local es la [Ley 25.326, texto oficial, especialmente arts. 4–6, 9 y 14–16](https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/texto). Este plan no certifica cumplimiento ni sustituye la revisión institucional.

## Autoinforme como referencia o alternativa de método

**IPIP-R-30:** primera opción para discutir por su cercanía al contexto. Cupani y colaboradores publicaron un instrumento de 30 ítems de dominio público y un estudio con 910 personas de Córdoba. Es una fuente de evidencia del instrumento, no del modelo Umbra. Antes de administrarlo, obtener la forma completa y su procedimiento de puntuación, incluidos ítems invertidos y tratamiento de aquiescencia. No construir una versión propia a partir de nombres de rasgos. [Artículo original de Cupani et al., 2019](https://actacolombianapsicologia.ucatolica.edu.co/index.php/acta-colombiana-psicologia/article/view/2009).

**BFI-2 en español:** alternativa con un estudio de adaptación publicado y material de los autores. Para referencia externa puede considerarse la versión completa de 60 ítems; abreviar cambia la evidencia disponible. El laboratorio permite investigación no comercial y conserva el copyright; eso no autoriza incorporarlo a un producto comercial sin revisar condiciones. [Adaptación española, Gallardo-Pujol et al., 2022](https://www.colby.edu/wp-content/uploads/2023/06/Gallardo-Pujol_et_al_2022.pdf), [condiciones oficiales de Berkeley](https://www.ocf.berkeley.edu/~johnlab/bfi.html).

El IPIP original es de dominio público, pero el propio proyecto advierte que no ha verificado todas las traducciones listadas. Debe seleccionarse la versión concreta con su evidencia y clave. [Permisos IPIP](https://ipip.ori.org/newPermission.htm), [traducciones IPIP](https://ipip.ori.org/newItemTranslations.htm).

Si la prioridad futura fuese entregar un perfil basado en un instrumento administrado, podría usarse el autoinforme como fuente del componente cuantitativo y dejar el texto para reflexión/narrativa. Sería un **cambio explícito de método y alcance**, que debe acordarse con el tesista y la dirección, actualizar tesis y producto y verificarse. No se implementó ni se lo presenta como reparación del modelo actual.

## Evidencia de uso: trabajo distinto de la validación ML

Una ronda de 5–8 adultos, observada y consentida, puede aportar evidencia formativa sobre tareas: completar un recorrido, comprender qué significa evidencia insuficiente, distinguir texto propio/narrativa/resultado del modelo, volver al perfil y encontrar controles de datos. Registrar éxito por tarea, problemas observados y comentarios con n real. Es un tamaño propuesto para detectar problemas, no para estimar satisfacción de toda la población.

Si se administra el SUS preparado en el TFG, describir exactamente la adaptación empleada y sus límites; no atribuirle una validación lingüística no comprobada. Una escala de usabilidad o una respuesta «me representa» no valida la predicción de personalidad. La utilidad percibida tampoco demuestra mejora del bienestar.

## Borrador para aclarar PersonText — no enviado

Destinataria publicada: María Lucía Barrón-Estrada, `lucia.be@culiacan.tecnm.mx`.

Asunto: Uso académico de PersonText y aclaración de etiquetas para TFG

> Soy Matías Vélez, estudiante de Ingeniería en Software de Universidad Siglo 21, Argentina. Estoy evaluando un prototipo de inferencia experimental Big Five desde texto. Quisiera evaluar un modelo ya congelado en PersonText, exclusivamente en una computadora local, sin enviar datos a proveedores externos y publicando solo resultados agregados.
>
> ¿La versión v1 o v2 puede reutilizarse con ese fin y bajo qué licencia o condiciones? ¿La publicación de los textos y sus autoinformes contempla reutilización para investigación externa? No necesito redistribuir el CSV ni acceder a videos, nombres o contactos.
>
> También agradecería el diccionario de campos, la traducción/clave IPIP usada, la cantidad de participantes únicos y la orientación de NeuV/NeuT: en la tabla 2 del artículo aparecen valores altos de NeuV con NeuT=No. ¿NeuV expresa estabilidad emocional, neuroticismo o hay una errata? ¿Cuál es la versión recomendada para una evaluación reproducible?
>
> Citaré el trabajo y conservaré cualquier resultado desfavorable. Muchas gracias.

Enviar este mensaje requiere autorización explícita para contactar a terceros. Tener el borrador listo no implica que se haya enviado o recibido un permiso.

## Relación con la tesis actual y cierre

Se revisó el texto de `TFG_Umbra_Velez_SOF01994_REVISION.pdf`, ubicado en la carpeta de reentrega del 7 de septiembre. Los objetivos específicos incluyen construir y evaluar un módulo propio y reconocer sus límites para español. El resumen, discusión y anexos ya separan funcionamiento, evaluación inglesa y ausencia de validación con personas hispanohablantes. El resultado negativo actual puede contribuir a ese objetivo exploratorio; no habilita la afirmación de inferencia individual validada. La aceptación académica corresponde a la dirección y al tribunal.

No hace falta cambiar nuevamente los objetivos para ocultar las métricas. Un estudio externo ejecutado se incorporaría como nueva evidencia con fecha, versión y método; un piloto que no llegó a realizarse debe seguir presentado como protocolo.

Fuentes comprobadas el 7 de septiembre de 2026. Confianza alta en el diagnóstico local, existencia/formato publicado de PersonText y antecedentes de instrumentos; confianza limitada en admisión del corpus hasta resolver licencia, consentimiento y orientación. Se detuvo la búsqueda al identificar una opción principal y alternativas razonables, con pendientes concretos que requieren al responsable del recurso. No se encontraron resultados ya ejecutados de Umbra sobre esos corpus.
