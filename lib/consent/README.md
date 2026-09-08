# Consentimiento: guardado atómico local

El texto obligatorio y la elección opcional de investigación siguen siendo decisiones distintas en pantalla. Al enviar, su persistencia se confirma en una sola transacción: `record_consent_atomic`. Se mantiene el texto v1 y no se modifican aceptaciones históricas.

## Aplicación local verificada el 7 de septiembre de 2026

La nueva migración es `supabase/migrations/20260907010000_record_consent_atomic.sql`. Agrega una función, no tablas. Solo `service_role` puede ejecutarla; la identidad procede de `auth.getUser()` en el API, nunca del cuerpo enviado por el navegador.

Con autorización posterior de Matías se aplicó **esa migración** en el proyecto
local `Umbra` (127.0.0.1:54321), después de respaldar la base y aplicar su
prerrequisito 004. Se verificaron permisos de ejecución: anon y authenticated
rechazados; service_role habilitado. Los 19 perfiles y 9 consentimientos previos
conservaron sus conteos. Una cuenta sintética nueva registró consentimiento
mediante la pantalla y el API reales, manteniendo investigación desactivada.
También se aplicó 005 para que la exportación pueda consultar la tabla de
usabilidad. El historial y evidencia están en
`docs/SUPABASE-RECUPERACION-2026-09-07.md`.

Esto no prueba ni autoriza aplicar cambios en otro proyecto o entorno remoto.
No usar `db reset`, un `db push` general ni credenciales remotas como parte de
los tests. Las purgas programadas de 006 no se activaron sobre los datos previos.

Si falta la función, el API devuelve HTTP 503 con `consent_unavailable` y la pantalla informa indisponibilidad sin avanzar. No hay fallback a dos escrituras separadas. Otros fallos de la transacción devuelven 500; la preferencia y el historial anteriores se conservan. Un fallo no equivale a una retirada confirmada: se debe reintentar y recibir éxito. Una nueva aceptación no invalida retroactivamente las anteriores.

El éxito conserva el contrato `{ok:true,data:{consentRecorded:true}}`. En un reintento después de perder la respuesta puede registrarse otra aceptación del mismo texto; no se promete ejecución exactamente una vez. La operación permanece consistente y no reescribe el historial.

## Comprobación antes de generar contenido

`/api/analyze` y `/api/onboarding/next`, `/seed`, `/undo` ya consultaban aceptación del titular. La revisión añadió la consulta explícita de servidor a `/api/chat`, `/api/narrative` y `/api/plan`, antes de guardar contenido, reservar consumo o llamar al proveedor. En estas tres rutas, ausencia devuelve 403 `consent_required`; error de consulta devuelve 503 `consent_unavailable`. Se admite cualquier versión histórica registrada para la identidad autenticada; no se inventa revocación ni se invalida v1. Exportación, rectificación, oposición y eliminación no se condicionaron a esta comprobación nueva.

`generation-gates.test.ts` cubre esas tres rutas con ausencia, error, aceptación de otra cuenta y aceptación histórica propia; comprueba que los rechazos no escriben ni invocan al proveedor, al pipeline o a la reserva de presupuesto.

## Checks reproducibles sin servicios

Desde la raíz del clon:

```bash
pnpm exec vitest run lib/consent components/onboarding/ConsentPage.test.tsx
pnpm exec tsc --noEmit --incremental false
pnpm exec next lint --no-cache
```

Las pruebas del API utilizan un doble stateful de PostgREST: comprueban estado anterior, fallo en cada escritura, reintento, selección true/false e indisponibilidad. No son E2E con Supabase.

## Evidencia SQL local separada

El 7/9/2026, antes de recibir el límite posterior de no aplicar migraciones a ninguna base, se ejecutó una prueba en un cluster **nuevo y efímero de PostgreSQL 17.10**, solo con datos sintéticos y socket Unix, sin TCP. Usó las migraciones 001, 002, 004 y la propuesta nueva. Se verificaron fallos inducidos en ambas escrituras, rollback, reintento, true/false, preservación del historial, repetición y privilegios. Pasó y el cluster quedó detenido en `/tmp/umbra-consent.yF8BHt`.

Se conservan `atomic-local.sql` y `test-atomic-local.sh` como fuente de esa prueba. **No volver a ejecutarla sin nueva autorización**, porque crea una base efímera y aplica SQL local. El script ahora se niega a ejecutar salvo autorización explícita mediante `UMBRA_ALLOW_LOCAL_CONSENT_DB_TEST=true`. No prueba Auth real, API PostgREST real, RLS remoto, migración desplegada ni cumplimiento jurídico.
