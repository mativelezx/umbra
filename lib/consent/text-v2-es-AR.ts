/** Local review version. Never modify v1 or rewrite historical acceptances. */
export const CONSENT_VERSION_V2 = '2026-09-07-v2';
export const CONSENT_LOCALE_V2 = 'es-AR';
export const CONSENT_TEXT_V2_ES_AR = `Umbra — Consentimiento informado (versión ${CONSENT_VERSION_V2}, ${CONSENT_LOCALE_V2})

Para qué sirve Umbra
Umbra es un prototipo académico de autoconocimiento destinado a personas adultas. El perfil es experimental y las interpretaciones de IA pueden ser incorrectas. Umbra no es terapia, no realiza diagnósticos ni reemplaza la atención profesional.

Qué datos usa
Tu cuenta incluye email y nombre visible. Se guardan tus respuestas de onboarding, el retrato que decidas importar, el perfil generado, narrativas, conversaciones, actividades y progreso, y la carta al futuro si la escribís. Los textos pueden contener información personal sensible: evitá incluir datos identificatorios de otras personas. También se registran esta aceptación, su versión y hash SHA-256, fecha, user agent e IP seudonimizada con HMAC, y metadatos de uso y seguridad.

Servicios y acceso
Supabase almacena la cuenta y los datos de la aplicación. El módulo propio de aprendizaje automático procesa texto para estimar Big Five. Anthropic procesa texto y contexto para preguntas de onboarding, interpretación, narrativa, conversación y actividades. El hosting web y el correo transaccional dependen de los servicios configurados para el entorno. El responsable técnico puede acceder a datos para mantenimiento y soporte; la seudonimización no hace anónimos los textos que escribís.

Configuración pendiente de verificación
La región efectiva de almacenamiento, los respaldos y su restauración, la ejecución de purgas programadas y las condiciones efectivas de retención de los proveedores deben verificarse en el entorno utilizado antes de habilitarlo para personas usuarias reales. Este prototipo no acredita borrado inmediato en sistemas de terceros ni ausencia de retención por parte de ellos. No constituye una garantía de disponibilidad o recuperación.

Conservación y control
Los datos de la cuenta permanecen hasta que solicites su eliminación. El código incluye purgas previstas a 30 días para ciertos payloads técnicos; su ejecución en un entorno real está pendiente de verificación. En Configuración podés descargar tus datos en JSON, modificar tu nombre visible y solicitar eliminar tu cuenta. La confirmación de borrado requiere un enlace vigente y sesión iniciada. Si la operación falla, se informa el error y puede haber pasos ya realizados; no se promete una transacción única entre todos los servicios.

Investigación opcional
Si marcás la segunda casilla, permitís guardar tus textos y perfil en un dataset seudonimizado para investigación académica. El responsable con las claves correspondientes puede volver a relacionarlos con tu cuenta. Las respuestas de usabilidad que decidas enviar también son datos de investigación. Podés desactivar esta participación y pedir purgar contribuciones anteriores desde Configuración. Desactivarla sin pedir la purga conserva los registros previos. Al eliminar tu cuenta, las contribuciones al dataset de investigación permanecen salvo que marques también su purga.

Tus derechos y responsable
El responsable del prototipo es Matías Velez, TFG de Ingeniería en Software, Universidad Siglo 21. Las funciones de acceso, rectificación, cancelación y oposición se ofrecen en Configuración en el marco de la Ley 25.326. Su disponibilidad completa depende de la configuración y verificación del entorno. No se afirma cumplimiento legal integral solo por disponer de estas pantallas. Para otros pedidos, contactá al responsable del proyecto.

Límites y ayuda
El detector automático de señales de crisis puede equivocarse o no detectar una situación. Una respuesta del sistema no significa que tu mensaje haya sido evaluado por una persona ni que sea seguro. Si necesitás ayuda urgente, buscá apoyo humano y los recursos de emergencia de tu localidad.

Aceptación
Al marcar la primera casilla confirmás que leíste este texto completo y autorizás el tratamiento descrito para usar el prototipo, con sus límites y verificaciones pendientes. La participación en investigación requiere la segunda casilla, es opcional y puede retirarse. El sistema registra el hash SHA-256 de este mismo texto; las aceptaciones anteriores conservan su propia versión.`;
