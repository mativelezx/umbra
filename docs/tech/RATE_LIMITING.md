# Consumo y límites de la demostración

Las rutas que generan contenido se ejecutan en Node. Antes de invocar al proveedor reservan consumo por cuenta mediante `charge_rate_limit`; después ajustan la reserva con `reconcile_rate_limit` cuando disponen de los contadores. La tabla `rate_limits` identifica cuenta y día UTC. Los clientes sólo pueden leer su propio registro; los cambios pasan por el servidor.

## Configuración publicada

| Parámetro | Valor | Alcance |
|---|---|---|
| DAILY_TOKEN_CAP | 120000 | Tokens de entrada y salida por cuenta y día UTC |
| DAILY_COST_CAP_CENTS | 200 | Estimación monetaria por cuenta y día UTC |
| GLOBAL_DAILY_BUDGET_USD | Declarado | Corte global NO implementado |
| maxDuration | 120 segundos | Duración máxima de las seis rutas con generación |

Se alcanza el límite cuando cualquiera de los dos controles por cuenta no admite la reserva. No se suman como presupuestos independientes. El tope previo de 60.000 tokens impedía conversar después de un recorrido completo; se elevó el margen de texto sin cambiar los 200 centavos ni borrar consumos. Copiar estos valores al configurar otro entorno: los valores de respaldo de rutas históricas no son una política unificada.

El bloqueo devuelve HTTP 429 y la interfaz explica que se alcanzó el cupo. La fecha de reinicio es UTC, no necesariamente medianoche argentina. No se debe vaciar la tabla para hacer pasar un test.

## Qué mide la contabilidad

`lib/claude/pricing.ts` convierte tokens informados a centavos de dólar con redondeo hacia arriba. Para los modelos configurados, las referencias son Sonnet 3/15 USD y Haiku 1/5 USD por millón de tokens de entrada/salida. La fuente comercial debe revisarse al cambiar modelo: https://platform.claude.com/docs/en/about-claude/pricing .

Una reserva es una estimación, no la factura. Algunas salidas admitidas tienen un máximo superior a la salida inicialmente reservada. Una interrupción puede consumir tokens aunque la persona no reciba una respuesta completa. Las rutas de streaming conservan los contadores informados antes del corte; una caída abrupta del proceso puede impedir la conciliación. Las llamadas del clasificador de seguridad no se contabilizan de forma completa en este registro. Por estas razones no se promete un techo monetario exacto desde la tabla.

El bloqueo por fila hace atómica la reserva de una cuenta, pero no convierte en una sola transacción la llamada externa y el guardado de contenidos. El responsable debe contrastar el registro con la consola y factura de Anthropic.

## Prueba remota y presupuesto autorizado

Las pruebas con llamadas pagas requieren opt-in explícito y se ejecutan sin reintentos automáticos del test. La variante remota restringe dominio web y base, usa cuentas identificadas como ficticias y corta solicitudes al alcanzar un umbral conservador, dejando margen para la llamada en curso. Ese control del ejecutor de pruebas no es un control global del producto ni sustituye los límites de la cuenta del proveedor.

Los tests de CI usan claves de ejemplo y no representan invocaciones pagas reales. Las pruebas de fallos simulados se distinguen del recorrido con Supabase, ML y Anthropic activos.

## Pendiente antes de ampliar el uso

Falta un límite global atómico con tratamiento de concurrencia, conciliación de todas las llamadas y evaluación de sus fallos. Una suma cacheada durante varios minutos no garantiza ese límite. La demostración se limita a evaluación académica con datos ficticios; no se habilita uso masivo ni se presenta la variable global como protección activa.
