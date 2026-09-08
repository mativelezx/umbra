# Pruebas ampliadas y lenguaje claro

7 de septiembre de 2026. Incremento posterior a `AUTOINFORME-Y-ML-2026-09-07.md`.

## Alcance

Web local de escritorio y móvil, con Supabase y ML locales. Cuentas y textos nuevos ficticios de QA. No se reclutaron participantes ni se cambiaron pesos, particiones, umbrales, preguntas oficiales del BFI-2-S o consentimiento. El usuario autorizó hasta USD 2 adicionales para llamadas de prueba al proveedor. No se publicó ni se entregó en Canvas.

Fuente: clon de entrega `/private/tmp/umbra-entrega-audit.B6Tyg8/repo`, base Git `0350f43` con cambios anteriores conservados. El checkout original no se sobreescribió. El ZIP anterior de autoinforme se conserva. Las pruebas se ejecutaron en builds candidatas separadas; cada conjunto debe interpretarse con el nivel de evidencia indicado abajo.

Agent OS: auditoría, bugfix, IA/confianza y lenguaje de producto. Roles de QA y builder aplicados por el agente principal. Impeccable: harden para recuperación; clarify y distill para el pedido posterior de copy. Se mantuvo la identidad visual, sin rediseñar la marca ni agregar dependencias.

## Mensaje y recorrido

La primera revisión empezaba con «Entendete mejor. Elegí tu próximo paso». El autor rechazó ese lema y aprobó después «Tu cabeza, en palabras.». Su bajada es: «Respondé preguntas sobre tus decisiones y hábitos. Recibí una lectura de tus respuestas y actividades para probar en tu día». Portada, título de pestaña y metadatos se alinean con esta elección. No promete curar, conocer una esencia, mejorar el bienestar de forma demostrada ni predecir una personalidad con precisión individual.

El ejemplo interactivo conecta una misma decisión postergada con una pregunta, una lectura y una acción pequeña. Está identificado como ficticio, no como testimonio o resultado del visitante. Los botones siguen llevando al registro y al recorrido existente.

Big Five se explica como cinco aspectos de la personalidad, con ejemplos de curiosidad, organización, trato con otras personas y preocupaciones. Se aclara que los cinco promedios de 1 a 5 se calculan con las respuestas al cuestionario opcional de 30 afirmaciones. El ML es otra fuente, todavía experimental: responder el cuestionario no lo valida.

Jung se presenta mediante cuatro preguntas: qué tiene lógica, qué me importa, qué veo y qué podría pasar. Los nombres técnicos aparecen después. Los arquetipos se explican como imágenes para reflexionar, no identidades medidas. Se mantienen fuentes, créditos y límites.

Se alinearon también los textos de entrada, selección del recorrido, introducción del resultado, sugerencias del chat y pautas de lenguaje para futuras lecturas y respuestas. No se regeneraron automáticamente los contenidos ya guardados. Se conservaron las preguntas oficiales del instrumento, su clave de cálculo y el consentimiento.

| Término visible | Explicación al usuario | Alcance |
| --- | --- | --- |
| Lectura | Una interpretación de tus respuestas que podés cuestionar | Contenido de IA, no diagnóstico |
| Cuestionario opcional | 30 afirmaciones y cinco promedios de 1 a 5 | Autodescripción, no porcentajes ni baremos |
| Datos del modelo | Estimaciones experimentales desde texto | Sin cifras si no hay evidencia suficiente |
| Jung / arquetipo | Preguntas e imágenes para mirar una situación | Sin equivalencia matemática con Big Five |
| Actividad | Una propuesta con pasos que elegís si probar | No tratamiento ni eficacia demostrada |

Verificación de copy: lectura visual de hero, Big Five y Jung a 390 y 1440 px; sin desborde horizontal observado. Teclado, formulario público, FAQ, enlaces y controles axe en Chromium/WebKit: 22 pruebas correctas. Esto no es una prueba de comprensión o conversión con usuarios humanos.

## Fallos corregidos con regresiones

- El chat podía ocultar errores del stream o aceptar una respuesta incompleta. Ahora requiere cierre válido, descarta parciales y muestra recuperación. Aborta la petición al cambiar de conversación y evita mezclar respuestas tardías. El servidor ya no guarda una respuesta parcial como mensaje completo.
- El cierre de sesión podía dejar la vista privada en pantalla. Ahora comprueba el resultado de Auth y descarta la vista privada mediante navegación completa.
- Un nombre formado solo por espacios era aceptado. Ahora se valida después de quitar espacios externos.
- La carta ahora comprueba consentimiento y propiedad del perfil antes de guardar, con fallo explícito si la base está indisponible.
- Deshacer una sesión inexistente o ajena podía pasar por una función que creaba una sesión nueva. Ahora se rechaza antes de ese paso.
- El reintento de análisis del onboarding podía pedir otra pregunta en lugar de reintentar el análisis. Se conserva el texto y se reintenta la operación correcta.
- El conductor podía superar el límite de tres preguntas importadas y terminar sin escritura propia. Ahora el servidor controla el límite, reserva escritura cuando falta y reutiliza una tarjeta pendiente al reanudar sin otra llamada paga. Una tarjeta de respaldo sin contestar nunca termina el recorrido.
- La API del ML aceptaba texto compuesto únicamente por espacios. Ahora lo rechaza; no se alteran los textos no vacíos ni los pesos.

## Evidencia técnica

No sumar reintentos como casos nuevos. Una suite finita no demuestra todas las combinaciones posibles.

| Conjunto | Resultado | Qué demuestra / qué no |
| --- | --- | --- |
| Vitest | 361 pruebas, 59 archivos | Contratos y componentes; incluye regresiones. No todas usan infraestructura real |
| TypeScript, lint y build | Correctos | Compilación y chequeos estáticos, no aprobación académica |
| Python ML | 32 correctas, ninguna omitida en la ejecución con pesos locales | Contratos, artefactos y cálculo; no validación con participantes nuevos |
| UI de recuperación | 36 correctas, escritorio y móvil | Componentes reales con respuestas HTTP simuladas e identificadas: seis tipos de pregunta, fallos del cuestionario, chat, crisis y carta |
| Cuenta/base local | 11 correctas, repetidas en la build final después de recuperar Docker | Registro real, consentimiento, RLS, propiedad, BFI, ML conservado, carta, rectificación, logout, exportación y eliminación solo de cuenta QA |
| Recorrido completo nuevo | 1 correcto, repetido desde cero en la build final en 3,6 minutos | Registro, consentimiento, ocho preguntas reales con proveedor, ML, BFI de 30 respuestas, narrativa y plan persistidos |
| Perfil real ya guardado | 2 correctas, ambas repetidas en la build final | Casilla de actividad persistida y restaurada, PDF descargable, chat real guardado y reabierto |
| Importación de texto | 1 correcta en la build final, 1,5 minutos | Registro, consentimiento, texto importado ficticio, tres preguntas reales, escritura propia para ML, perfil y narrativa; BFI y carta omitidos; apertura del chat |

La eliminación se ensaya con un token sembrado expresamente en la base local y una cuenta creada por la suite. El correo externo no está configurado: una respuesta de error por esa ausencia es correcta, pero no demuestra entrega de email. Las dos ejecuciones completas del caso de borrado eliminaron sus respectivas cuentas B recién creadas, no la cuenta de demo ni cuentas previas. No se puede deshacer ese borrado sin un respaldo.

Las advertencias de Python incluyen APIs deprecadas y R² no definido en los fixtures diminutos del test de TF-IDF. No se interpretan esos valores como métricas de evaluación del corpus real. La ejecución habitual dio 31 correctas y una omitida por requerir habilitación explícita del modelo. Se repitió con `ML_RUN_MODEL_TESTS=1`, `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1` y el caché local existente: 32 correctas, sin descargas.

## Qué mostraron las pruebas directas del ML

`ml/scripts/audit_runtime.py` prueba nueve textos sintéticos, entradas inválidas, repetición, correspondencia HTTP/embeddings y una revisión retrospectiva de 248 filas inglesas ya existentes. En el servicio corregido no hubo fallos de contrato. La misma entrada produjo la misma salida y seis comprobaciones HTTP coincidieron con las predicciones desde embeddings almacenados. Los hashes de pesos y particiones no cambiaron.

La revisión reusa las filas existentes. Sus 2.000 remuestreos estadísticos no son 2.000 personas nuevas. Las dos viñetas sintéticas españolas se excluyen de las métricas y no se incorporó ningún participante español nuevo.

Una descripción ficticia de organización y su equivalente inglés difirieron hasta 41,72 puntos en una dimensión. Incluso un texto sin sentido recibió números. Eso muestra por qué producir una cifra no demuestra que describa a la persona. La comparación previa mantiene menor RMSE de TF-IDF en las cinco dimensiones de ese conjunto; no prueba superioridad general ni transferencia al español.

**Conclusión:** las cinco dimensiones del predictor siguen en baja confianza. No se ocultó ese límite ni se bajó un umbral para conseguir un resultado favorable. El valor disponible es el cuestionario calculado a partir de respuestas y la reflexión contextual basada en situaciones compartidas. La utilidad de las sugerencias y la validez del predictor aún requieren evaluación humana independiente.

## Incidente de entorno

Durante las pruebas el disco se quedó sin espacio: hubo errores ENOSPC, una build fallida y caída de Docker/Supabase. Se eliminaron compilaciones propias obsoletas y cachés regenerables de Next, no código, documentos o volúmenes. Tras fallar el reinicio normal se cerró el proceso de Docker bloqueado, con la máquina virtual ya detenida, y se abrió Docker de nuevo. Auth y PostgreSQL volvieron a estar saludables. Se verificó que los dos perfiles sintéticos consultados conservaban ML y, donde correspondía, el autoinforme. No se ejecutó reset ni restauración de la base.

El intento importado interrumpido había completado tres preguntas y guardado su perfil, pero no terminó la transición al resultado. No se presenta como éxito punta a punta. La repetición final confirmó el recorrido completo con los servicios recuperados. El ML se reinició con el validador corregido en 8000: auditoría directa sin fallos operativos y artefactos sin cambios.

Comprobación adicional del hero público: pausa, navegación por teclado y movimiento reducido correctos en Chromium y WebKit a 390/1440 px. No se incluye el onboarding privado en ese chequeo de movimiento. Build final: `8ln9CjMELH_WAISRVMQiu`, iniciada en 3000 después de pasar ambos recorridos completos en 3031, sin recompilar entre ambos puertos.

Sobre 3000 pasaron cinco comprobaciones de portada, ingreso, persistencia de actividad y descarga PDF. El contador de las cuentas de esta ampliación terminó en 91 centavos de USD; no es una factura y no incluye necesariamente toda llamada auxiliar. No quedan pruebas pagas programadas. El tope autorizado fue USD 2 adicionales.

## Incremento posterior: lema aprobado

«Tu cabeza, en palabras.» reemplaza el lema anterior por elección del autor. Se actualizaron la portada, la bajada explicativa, metadatos, diccionario y aserciones de tests. No cambian tipografía, estilos, animaciones, rutas, preguntas, modelo, datos ni contenido guardado. Impeccable orientó la revisión responsive conservando el diseño existente.

Build de este incremento: `1h2Vy_dfpCzct3nnEnMeo`, carpeta `.next-tagline-release`. Sobre ella se repitieron 361 tests de aplicación (59 archivos), TypeScript, lint, build y 22 tests públicos en Chromium/WebKit. La comprobación visual cubrió 390, 768 y 1440 px, sin desborde horizontal; el tamaño intermedio no registró errores JavaScript. Capturas: `artifacts/audits/tagline-2026-09-07/`.

No se repitieron en este cambio de lema las pruebas privadas de extremo a extremo, los tests del ML ni llamadas pagas: esos resultados anteriores conservan su build y alcance indicados arriba. El lema no modifica las limitaciones del predictor ni los pendientes académicos.

## Pendientes fuera de estos tests

Correo de eliminación real; despliegue público; restauración ensayada; prueba de comprensión/usabilidad con personas; validación española del predictor y evaluación de utilidad. También siguen siendo responsabilidad de la entrega la revisión humana de la tesis, las fechas del cronograma, el enlace de demo requerido y la defensa del autor. Este incremento no reescribe el Word/PDF ni garantiza aprobación o un resultado de detector de IA.
