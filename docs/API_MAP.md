# Umbra — mapa de APIs

Este mapa describe la implementación de la reentrega. Los contratos detallados y sus validadores están en las rutas de `app/api`; las respuestas no comparten un formato único en todos los casos. En particular, narrativa y chat transmiten eventos, y la exportación devuelve un archivo JSON, no un ZIP.

## Recorrido y cálculo

| Ruta | Método | Runtime | Propósito |
|---|---|---|---|
| /api/consent | POST | Node | Verifica sesión, versión y hash; guarda aceptación y preferencia de investigación en una operación atómica del servidor. |
| /api/onboarding/next | POST | Node | Crea o continúa la escritura guiada de la cuenta. Consulta el proveedor y guarda los turnos. |
| /api/onboarding/undo | POST | Edge | Retrocede el último paso permitido en la sesión propia. |
| /api/onboarding/seed | POST | Node | Recibe un retrato importado como contexto; no equivale a texto libre válido para entrenar o validar el ML. |
| /api/analyze | POST | Node | Envía texto elegible al ML, solicita interpretación y guarda el perfil experimental. |
| /api/self-report | POST | Edge | Calcula y guarda el BFI-2-S opcional a partir de exactamente 30 respuestas. |
| /api/narrative | POST | Node | Genera la lectura del perfil propio mediante un flujo de eventos. |
| /api/plan | POST | Node | Genera actividades orientativas vinculadas al perfil propio. |
| /api/chat | POST | Node | Revisa seguridad y conversa sobre el contexto propio mediante eventos. |
| /api/chat/conversations | GET | Edge | Lista las conversaciones de la cuenta. |
| /api/chat/conversations/[id] | GET | Edge | Recupera una conversación propia y sus mensajes. |
| /api/carta | POST | Node | Guarda una carta de la cuenta con su fecha de apertura. |
| /api/research/usability | POST | Edge | Recibe respuestas voluntarias a instrumentos de usabilidad; su existencia no demuestra un estudio realizado. |

Las operaciones que generan contenido requieren identidad y consentimiento. El ML no se reemplaza por cifras generadas por Claude si falla. El chat usa los diez mensajes más recientes de la conversación, en orden cronológico, además del mensaje actual.

### Cuestionario: /api/self-report

Entrada JSON estricta: `profileId` UUID, `instrument: "bfi-2-s-es-30-v1"`, `accepted: true` y `answers`, un arreglo de 30 enteros entre 1 y 5. No acepta puntajes del cliente.

El servidor verifica origen, tamaño, sesión, consentimiento y pertenencia del perfil. Calcula cinco promedios con las respuestas inversas y actualiza sólo si el perfil no cambió durante la operación. Responde `{ok:true,data:{selfReport}}`. Errores relevantes: 400 entrada inválida; 401 sesión; 403 origen o consentimiento; 404 perfil no encontrado; 409 perfil modificado; 413 tamaño; 415 tipo de contenido; 503 almacenamiento indisponible. No inserta esas respuestas en el conjunto de investigación.

### Eventos de narrativa y conversación

Un fragmento de texto no equivale a una respuesta completa. El cliente espera la finalización del flujo; ante error o corte conserva el estado recuperable y explica el fallo. Los tokens reportados se contabilizan aunque la generación no termine correctamente. No se registran como cero los contadores que el proveedor no informó.

## Cuenta y datos

| Ruta | Método | Runtime | Propósito |
|---|---|---|---|
| /api/account/export | GET | Node | Descarga JSON de las colecciones propias, incluidas contribuciones previas aunque la investigación esté desactivada. |
| /api/account/profile | PATCH | Node | Rectifica los campos permitidos del perfil del titular. |
| /api/account/research-opt-out | POST | Node | Cambia la participación opcional y, si se solicita, elimina contribuciones anteriores del titular. |
| /api/account/delete/request | POST | Node | Solicita un correo de confirmación temporal para eliminar la cuenta. |
| /api/account/delete/confirm | POST | Node | Comprueba sesión y token de un solo uso; ejecuta el borrado y la purga opcional indicada. |
| /api/account/welcome | POST | Node | Envía bienvenida a la cuenta recién creada; no permite elegir otro destinatario. |

La exportación no contiene contraseñas ni tokens de autenticación o borrado. Lee las colecciones durante la solicitud: no promete una instantánea transaccional. Si una colección falla o cambia de manera que invalida la paginación, devuelve error en vez de presentar una descarga parcial como completa.

La oposición cambia primero la preferencia. Si la purga posterior falla, la respuesta indica que la participación ya está desactivada y permite reintentar la eliminación. El borrado total tampoco es una transacción única entre la base, Auth y proveedores externos. La aplicación no afirma que se borraron datos cuando un paso obligatorio falla.

### Bienvenida: /api/account/welcome

Sin cuerpo de entrada. Requiere sesión con email, origen válido y una cuenta de no más de una hora. Fuera de esa ventana responde `{ok:true,sent:false}`. Resend recibe una clave de idempotencia por cuenta para deduplicar reintentos.

Respuestas: 200 enviado o no aplicable; 401 sin sesión; 403 origen rechazado; 503 correo no disponible. La bienvenida es opcional y su fallo no anula el registro.

## Controles y límites

- La identidad se obtiene de la sesión, no de un identificador de usuario libre enviado en el cuerpo.
- Las tablas de usuario tienen RLS. Las operaciones privilegiadas se realizan en el servidor y se acotan al titular.
- Las rutas con Claude reservan consumo por usuario y reconcilian los tokens disponibles. El corte automático global de factura todavía no está implementado.
- La confirmación de cuenta y la recuperación dependen de Supabase Auth y de su SMTP, no de una ruta de registro propia en Next.js.
- Tener una plantilla HTML no prueba su instalación ni un envío externo. Ver [EMAILS.md](EMAILS.md).
- Las pruebas locales, las remotas con cuentas sintéticas y las simulaciones de fallos son niveles de evidencia distintos. Ninguno equivale a validación psicológica o aprobación del CAE.

## Servicio ML independiente

`GET /health` indica si el proceso y los pesos están disponibles. `GET /version` muestra versión y estados. `POST /infer` acepta texto no vacío de hasta 15.000 caracteres y devuelve las cinco salidas, su estado, versión y tiempo.

El servidor Next.js envía `X-ML-API-Key`; esa clave no llega al navegador. La inferencia pública falla cerrada si falta configuración y rechaza una clave inválida. `POST /admin/reload-status` también exige la clave. Estos controles de acceso no transforman `low_confidence` en evidencia suficiente.
