# Recuperación local de Supabase — 7 de septiembre de 2026

## Alcance aprobado

El usuario pidió solucionar Supabase para la entrega, después de autorizar una
cuenta sintética temporal y hasta USD 2 de llamadas a Claude. Trabajo de
infraestructura local, backend y verificación web. No es un despliegue público.

- Entorno: local; proyecto Docker/Supabase `Umbra`, API 127.0.0.1:54321,
  PostgreSQL 127.0.0.1:54322; ML 127.0.0.1:8000.
- Datos nuevos: sintéticos de QA, separados por cuenta de prueba. Las 19 cuentas
  previas no se usan, modifican ni muestran; sólo se consultaron conteos/esquema.
- Proveedor autorizado: Anthropic para las pruebas acotadas. Sin envío de correo
  real ni alta de usuarios humanos. No habilitar investigación en la cuenta QA.
- Acceso: agentes pueden revisar esquema/metadatos y escribir la cuenta QA.
  RLS queda activada. No se permite reset, borrado de volúmenes ni cron de purga.
- Demo de 3000 se conserva mientras se prueba un candidato real en otro puerto.
- Coste: hasta USD 2 en pruebas aprobadas, sin reintentos automáticos. Se revisaron
  contadores antes de repetir por fallos concretos. El iniciador privado reserva
  un límite de aplicación de USD 1,50 por cuenta/día y margen para clasificación
  y evidencia auxiliar; el contador de la app no es la factura del proveedor.

## Diagnóstico observado

Docker estaba bloqueado después de registrar falta de espacio el 5 de septiembre.
Reinicio normal falló por procesos que no salían. Se cerraron los procesos
identificados y se inició Docker 29.3.1 conservando volúmenes.

PostgreSQL 17.6 abrió correctamente: 19 perfiles, 19 cuentas y 9 consentimientos.
Las 14 tablas públicas tenían RLS activa. Sólo estaban registradas las migraciones
001–003. Faltaban `consent_text_hash`, `locale`, la tabla de respuestas de
usabilidad que requiere la exportación y `record_consent_atomic`.

El contenedor Auth tenía un directorio de tarea interno obsoleto (`file exists`)
y no arrancaba. Se recreó únicamente ese contenedor sin volúmenes, con la misma
imagen/configuración/red. El anterior se conserva renombrado
`supabase_auth_Umbra_recovery_saved_20260907`; no se borraron datos.

## Respaldo y plan de cambios

Antes de modificar esquema se generó un dump completo en un directorio privado
temporal `/private/tmp/umbra-supabase-recovery.LKk8Iy/`, permisos 0700/0600.
`pg_restore --list` pudo leer su índice; no se hizo una restauración de ensayo.
El respaldo contiene datos y credenciales: no se incorpora al ZIP de entrega.

Aplicación prevista, dentro de una única transacción y con timeout:

1. 004: agrega dos columnas con defaults explícitos a consentimiento, sin inventar
   hashes para registros históricos; su hash permanece vacío.
2. 005: crea tabla de usabilidad vacía con RLS, necesaria para exportar la cuenta.
3. 20260907010000: registra aceptación y preferencia opcional de investigación de
   forma atómica; ejecutar sólo mediante service_role en servidor autenticado.

No se ejecuta `supabase db reset`, un push general ni 006 (tareas de borrado).
Si la transacción falla se revierte completa. Después de escribir datos nuevos,
no hacer rollback destructivo de columnas/tablas: conservar filas y preparar un
cambio correctivo; la restauración completa requiere aprobación humana.

## Resultados observados de recuperación

- 004, 005 y 20260907010000 aplicadas en una transacción; COMMIT confirmado,
  historial registrado y esquema REST recargado. Conteos previos conservados.
- Auth y REST responden HTTP 200 con las claves locales existentes. Los servicios
  básicos de Umbra están activos. No se arrancaron proyectos ajenos.
- Registro/consentimiento de una cuenta sintética realizados en interfaz real.
  El primer test excedió 15 s esperando la compilación dev de onboarding (16 s).
  No hubo consumo de IA en ese intento. Se continuó con la misma cuenta.
- Prueba real de login, cambio de nombre, recarga/persistencia, descarga JSON y
  control anónimo (401): 1/1. Nombre restituido; investigación sigue desactivada.
- Anthropic inicialmente rechazó llamadas por falta de saldo. Matías informó
  una recarga; después hubo respuestas reales. Una respuesta excedió el límite
  de longitud y activó la pregunta de respaldo. Se registra como degradación,
  no como generación de esa pregunta. El E2E exige disponibilidad en la primera
  pregunta y verifica por separado análisis/narrativa/plan reales.
- Se detectó un fallo real de flujo: `DynamicFlow` descartaba la respuesta local
  al recibir la pregunta siguiente, dejando vacío el texto a analizar. Se corrigió
  conservando cada respuesta sólo tras confirmación del servidor para la misma
  sesión. Regresión roja antes y verde después; tests de privacidad también verdes.
- 279 pruebas de aplicación / 48 archivos, build, tipos/lint, integridad y gate
  básico de Agent OS verificados. Build integrada: `GaE7zWBEQVCUCT4jb_urs`.
  18 E2E públicos/cuenta/motion en Chromium/WebKit sobre esa build, anchuras
  390/1440: imagen, FAQ, controles de movimiento, borrador/foco, posición de la
  navegación, persistencia del nombre, exportación JSON y límite anónimo 401.
- Revisión independiente detectó duplicación del último turno cuando el cierre
  devuelve una respuesta ya guardada, y pérdida del historial previo al deshacer.
  Ambos corregidos; regresiones rojas antes y verdes después. Se conserva el
  historial que devuelve /undo y se reemplaza el turno respondido del mismo id.
  Segunda lectura del revisor: sin hallazgos pendientes en esos ajustes.
- ML local cargado con el bundle existente. Se mantienen los estados experimentales
  `low_confidence`; no se reemplazan por resultados de Claude ni por cifras de demo.
- El flujo real reveló otra incompatibilidad: ML devuelve decimales y las cinco
  columnas existentes del perfil son INTEGER. Se agregó redondeo a enteros sólo
  en el límite de persistencia, conservando el modelo original, el rango 0–100 y
  los estados de confianza. No se modificó el esquema ni se inventaron resultados.
- Respaldo anterior: SHA-256
  `160a13c006a1c8a7a961e063f9887c1c2a69c02a107ac291fd265cd5ddf04a99`.
  Copia durable privada en
  `/Users/matiasvelez/Documents/Umbra-Respaldo-Privado-20260907.32Vkwy/`.
- Suite ML repetida: 23/23, pesos existentes y modo offline; sin reentrenamiento.
- Se movieron a la Papelera dos compilaciones propias ya sin procesos activos:
  `.next-real-local` y `.next-story-demo`, aproximadamente 805 MB. Son recuperables;
  no se vació la Papelera, no se purgó Docker y no se eliminaron fuentes/datos.

## Cierre de integración y entrega local

La build `GaE7zWBEQVCUCT4jb_urs` pasó 1/1 E2E completo real en 3026, incluyendo
que la cantidad de textos analizados coincida con las respuestas confirmadas.
Se puso esa misma build en 3000 (PID 22804) y pasó 16/16 pruebas seleccionadas
Chromium/WebKit, sin llamadas pagas adicionales. Los candidatos 3023–3026 se
detuvieron; ML (PID 98527), Supabase y la web de 3000 siguen activos.

Actividad persistida/recarga/PDF y chat real con historial: 2/2 en el candidato
anterior. La última modificación posterior sólo afectó el historial de onboarding;
el chat no cambió ni volvió a consumir crédito. PDF y actividades se repitieron en
3000 en ambos motores. La sesión del navegador de la app usa la cuenta sintética.

Contador observado al terminar las pruebas automatizadas de la cuenta QA: 207274 tokens de entrada, 78803 de
salida y 113 centavos de USD. Incluye intentos de depuración; no es una factura ni
incluye toda clasificación/evidencia auxiliar. Sin más pruebas pagas programadas.
En ese cierre, investigación desactivada y nombre Umbra E2E. No se eliminó la cuenta.
La interacción manual posterior en el navegador puede agregar contenido y consumo;
no forma parte de los textos sintéticos ni del contador de las pruebas del agente.

ZIP durable: `Umbra_Codigo_Integrado_2026-09-07.zip`, 319 archivos de contenido;
CRC/hashes/fuentes coinciden. Extracción nueva: 587 dependencias desde caché, tipos
y 279 pruebas correctos. No se repitió build/browser sobre la extracción; sí en
el clon de contenido verificado. Guías y manifiesto externos actualizados.

## Límites de operación y entrega

No hay despliegue público ni entrega en Canvas. RESEND_API_KEY no está configurada:
no se verificó confirmación de eliminación mediante correo. No se ejecutó la
migración 006 de purgas ni un ensayo de restauración. No se habilitaron personas
reales, no se certificó privacidad/seguridad productiva y no se alteraron los
límites de validez del ML. El Word/PDF no se modificó en este incremento.
