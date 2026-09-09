# umbra

Prototipo de autoconocimiento para el Trabajo Final de Graduación de Ingeniería en Software, Universidad Siglo 21. Reúne escritura personal, un cuestionario opcional, una lectura orientativa y actividades para elegir. No es terapia, diagnóstico ni una medición psicológica validada.

## Acceso y versión

Demo publicada: https://umbra-sigma.vercel.app. Código de reentrega: rama `codex/reentrega-final-2026-09-07`. Se probó el recorrido remoto con cuenta ficticia: ingreso, consentimiento, escritura con Claude, análisis ML, cuestionario, lectura y actividades guardadas. La cuenta se confirmó por administración; el correo externo sigue pendiente. Usar sólo datos ficticios para esta demostración académica.

No hace falta un ZIP para consultar este repositorio. Las instrucciones siguientes se ejecutan desde un checkout de esta versión. No se incluyen contraseñas, claves de proveedores, datos de cuentas, dependencias instaladas ni cachés.

[Tesis vigente con cronograma incremental](https://github.com/mativelezx/umbra/releases/tag/entrega-cae-cronograma-2026-09-08) y [detalle de la corrección](plans/cronograma-incremental-2026-09-08.md). El [cierre integral](plans/cierre-integral-2026-09-08.md) conserva la evidencia funcional y del experimento PersonText; su Gantt anterior queda sustituido por esta revisión. El cuestionario es la referencia principal del resultado; la lectura de IA, Jung y el ML experimental conservan su origen y sus límites. La [guía BFI](docs/ENTREGA-BFI-2026-09-08.md), sus 52 capturas y las publicaciones anteriores se conservan como antecedentes identificados. El acceso de la cuenta ficticia se comparte por separado y no se versiona. La carpeta `thesis/` conserva un esqueleto histórico, no la versión de entrega.

La aplicación publicada corresponde a `1e57acd261deee87602514417459abe8813f5e2b`: 414 pruebas web en 67 archivos, tipos y lint aprobados de nuevo el 8/9. La [nota de presentación didáctica](plans/resultado-didactico-2026-09-08.md) registra build y cuatro recorridos locales aprobados de esa versión. El barrido publicado de cuatro recorridos y 52 estados pertenece a `faa991a35e131dd6e01e116837e1064b6f0ead04`, y los 167 controles documentales/181 destinos de índice corresponden al PDF BFI anterior; no se atribuyen al documento integral. La fecha del autoinforme usa el mismo huso argentino en pantalla y PDF. Los commits posteriores de documentación no cambian el runtime. El correo externo sigue requiriendo configuración y verificación.

## Qué hace cada componente

- **Cuestionario BFI-2-S:** 30 afirmaciones de la versión española publicada. Calcula cinco promedios de 1 a 5 con su clave y las respuestas inversas. Es la primera referencia visible y sigue siendo opcional; no es un porcentaje ni una comparación con otras personas. Se ofrece después de la escritura y el análisis inicial, no como entrada independiente.
- **ML propio:** DistilBERT preentrenado y congelado convierte el texto en números; cinco regresores Ridge producen estimaciones experimentales. No se entrenó DistilBERT desde cero.
- **Claude:** usa el contexto declarado para redactar la lectura, conversar y proponer actividades. Jung y los arquetipos se presentan como recursos interpretativos; no son resultados del Ridge.
- **Supabase:** registra la cuenta, el consentimiento y los datos; aplica permisos por usuario.
- **Interfaz:** permite revisar las fuentes, guardar actividades, conversar, descargar el informe y administrar los datos.

Las cinco dimensiones del modelo actual conservan `low_confidence`. Hacer más pruebas con textos inventados no valida puntuaciones psicológicas. El cuestionario ofrece una fuente directa de respuestas, separada del ML. No se realizó un estudio propio de uso de Umbra con participantes ni una evaluación de usabilidad humana.

El [experimento PersonText](artifacts/audits/persontext-retraining-2026-09-08/VEREDICTO.md) entrenó cinco Ridge nuevos con DistilBERT congelado y comparó TF-IDF + Ridge: 80 adultos para desarrollo (210 textos) y 30 adultos nuevos para examen (89 textos únicos). Son textos humanos originalmente españoles procedentes de transcripciones del corpus, no respuestas recolectadas en Umbra ni traducciones automáticas. Ninguna dimensión alcanzó conjuntamente los criterios conservados: resultado **0/5**. El candidato redujo el error frente al modelo histórico, pero no superó la referencia constante en MAE en los cinco rasgos. Los pesos nuevos no fueron desplegados. Se publican protocolo, código, resultados agregados, manifiestos y notebook; CSV, embeddings, modelos, predicciones individuales y corridas privadas quedan fuera del repositorio.

## Requisitos

Node.js 24 LTS, pnpm 9.15.0, Python 3.11 para el entorno ML local y Docker si se usa Supabase local. La web utiliza Next.js 15.5.25, React 18, TypeScript estricto y Tailwind 3.4. No usar Node 20: el cliente actual de Supabase requiere WebSocket nativo. El servicio de Vercel usa Python 3.12; una inferencia sintética comparada produjo exactamente los mismos cinco valores que el servicio local. Esto no demuestra validez psicológica.

```text
app/                   pantallas y APIs Next.js
components/            interfaz y pruebas de componentes
lib/                   lógica, cuestionario, prompts y controles
types/                 tipos compartidos
e2e/                   recorridos Playwright con opt-in
ml/                    cálculo, artefactos y evaluación experimental
supabase/migrations/   evolución de la base y permisos
supabase/templates/    correos de autenticación con la marca
public/                marca e imágenes con procedencia
```

## Poner en marcha la web

1. Instalá dependencias: `pnpm install --frozen-lockfile`.
2. Copiá `.env.local.example` a `.env.local` y completá los valores de tu entorno. El ejemplo no contiene claves válidas.
3. Prepará Supabase y el servicio ML antes de intentar un análisis.
4. Ejecutá `pnpm dev` y abrí http://localhost:3000.

Para compilar y ejecutar una versión optimizada:

```bash
pnpm build
pnpm start
```

La compilación necesita las variables públicas de Supabase. Las claves de servidor, Anthropic, ML y correo nunca deben llevar el prefijo `NEXT_PUBLIC_`. No usar credenciales de producción en capturas, ejemplos, tests públicos ni commits.

`NEXT_PUBLIC_DEMO_MODE=true` habilita un ejemplo ficticio de interfaz. Sus respuestas no generan el perfil preparado, no prueban persistencia ni proveedores y no habilitan el chat sin una cuenta. La versión de servicio real usa `false`.

## Base de datos

Usá un proyecto propio vacío o Supabase local. Revisá el destino antes de aplicar SQL; nunca uses `db reset` sobre una base compartida.

```bash
supabase start
supabase migration up --local
```

Para un proyecto remoto autorizado, las migraciones se aplican con la CLI y conexión privada. La CLI 2.84.2 falló al separar las sentencias de la migración de consentimiento durante esta publicación: se ejecutaron los archivos de consentimiento y retención con `psql --single-transaction -v ON_ERROR_STOP=1 -f ...`, se verificaron funciones y permisos y recién después se registraron como aplicados. No marcar una migración como aplicada sin ejecutar y comprobar su SQL.

La migración de retención conserva `analysis_raw.selfReport` y `analysis_raw.ml`; depura otros datos técnicos después de 30 días desde la última actualización del perfil. El cronograma de tareas se verifica en `cron.job`. Tener un archivo SQL no significa que el destino lo esté ejecutando.

Las copias de respaldo y una restauración probada son controles separados. No se promete respaldo automático por utilizar el plan gratuito.

## Ejecutar el ML local

Desde la raíz:

```bash
cd ml
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export HF_HOME="$PWD/.hf_cache"
ML_EAGER_LOAD=1 python -m uvicorn src.api_server:app --host 127.0.0.1 --port 8000
```

La primera carga descarga los pesos públicos. `GET /health` distingue proceso vivo de pesos cargados. `POST /infer` acepta `{"text":"Texto sintético para comprobar el servicio."}` y devuelve valores, versión y estado por dimensión.

En el alojamiento público, `ML_API_KEY` debe coincidir en el servicio Python y el servidor Next.js; la inferencia rechaza llamadas sin esa clave. La administración también requiere la clave. No hay reemplazo automático de los puntajes ML por puntajes inventados por Claude.

No ejecutar entrenamiento, `make clean` o `dvc repro` para grabar la demo: pueden reemplazar artefactos. Hay una revisión fijada del extractor para próximas ejecuciones, pero no un historial completo que reconstruya todo el entrenamiento original.

## Pruebas y alcance

Comprobaciones actuales y evidencia previa identificada:

| Comprobación | Resultado |
|---|---|
| Vitest, lógica y componentes | Actual: 414 pruebas aprobadas, 67 archivos; Node 24.19.0, código equivalente a `1e57acd` |
| Tipos y lint | Actual: aprobados en la verificación independiente del 8/9 |
| Compilación y cuatro recorridos locales | Aprobados en la pasada didáctica de `1e57acd`; datos ficticios; ver nota de presentación |
| Web pública y ML | Actual: acceso/registro/recuperación HTTP 200; tablero anónimo redirige al login; ML con pesos cargados, `ridge_v1`, cinco `low_confidence`, inferencia anónima rechazada con 401 |
| Auditoría de dependencias web de producción | Pasada didáctica anterior: sin vulnerabilidades conocidas high/critical reportadas por pnpm audit; no repetida en este cierre documental |
| Python con pesos reales | Evidencia previa: 37 pruebas aprobadas, ninguna omitida |
| Retención | Evidencia previa: prueba aislada aprobada; conserva resultados y elimina sólo el contenido técnico vencido |
| Supabase nuevo | Evidencia previa: 15 tablas con RLS y tres tareas activas; seis grupos remotos de aislamiento, permisos y consentimiento aprobados |
| Navegador, servicios remotos | Evidencia previa: recorrido completo; 32 controles públicos de escritorio/móvil; actividad, PDF y chat real persistido comprobados |
| GitHub Actions | Evidencia previa de la reentrega; consultar el resultado correspondiente al commit actual antes de afirmar CI vigente |
| PersonText | Experimento local del 8/9: 15 pruebas y verificación agregada registrados en sus artefactos; 0/5 criterios, sin promoción a producción |

El barrido publicado de la entrega BFI comenzó el 8/9 a las 16:51 UTC sobre `faa991a`: cuatro recorridos y 52 pantallas/estados, sin omisiones ni reintentos. Su [galería histórica](docs/evidence/bfi-primary-2026-09-08/galeria.html) conserva cada comprobación y un PDF real descargado con datos ficticios. También pasaron entonces 22 casos locales y diez pruebas del procedimiento de traducción. Las 37 pruebas ML y los seis grupos de base remota de la tabla son evidencia previa del 7–8/9. No se suman los conteos como si fueran pruebas independientes. La verificación pública actual no regeneró el recorrido con Claude ni probó correo externo.

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm audit --prod
bash scripts/test-profile-retention.sh
cd ml
ML_RUN_MODEL_TESTS=1 HF_HOME="$PWD/.hf_cache" python -m pytest tests -q
```

La suite web limita la concurrencia para funcionar en una computadora de estudiante con Supabase y ML activos. Los casos de navegador distinguen fixtures, servicios locales y llamadas pagas reales. No ejecutar toda la carpeta E2E sin revisar sus opt-ins: crea cuentas y algunos recorridos consumen crédito de Anthropic. Las capturas y respuestas sintéticas no representan participantes humanos.

## Correo y operación

Las plantillas de bienvenida, autenticación, recuperación, cambio de email y eliminación están en `lib/email/` y `supabase/templates/`. La guía es [docs/EMAILS.md](docs/EMAILS.md). Diseñar una plantilla no configura SMTP: el remitente de prueba de Resend sólo puede enviar al titular. Para destinatarios externos hace falta un dominio verificado.

La consulta de configuración productiva del 8/9 comprobó que el proyecto web no tiene `RESEND_API_KEY` ni `EMAIL_FROM`. Por eso la bienvenida opcional y el correo necesario para solicitar eliminación no están operativos. El estado del SMTP de Supabase/Auth se verifica por separado: no se envió correo de confirmación ni recuperación durante este cierre.

El límite de consumo por usuario sí se aplica. Para esta demo se configuraron 120.000 tokens y 200 centavos por día: el tope anterior de 60.000 tokens impedía continuar en el chat después del recorrido completo. Los importes de la aplicación son estimaciones redondeadas, no una factura. `GLOBAL_DAILY_BUDGET_USD` es un parámetro declarado cuyo corte automático no está implementado; no asumir que limita toda la cuenta. No abrir el prototipo a uso masivo sin cerrar ese control.

Las seis rutas con generación usan Node y un máximo de 120 segundos. La primera prueba remota encontró que Edge cortaba el análisis antes de su respuesta inicial a los 25 segundos; después del cambio pasó el recorrido. La interfaz también conserva las respuestas y ofrece reintentar ante un error no JSON del alojamiento. No se modificaron ni ocultaron los resultados ML para aprobar la prueba.

La reentrega requiere lectura y revisión del autor. La aprobación académica corresponde al CAE; ni los tests ni este README la garantizan. Debe reconocerse la asistencia utilizada, sin inventar investigación, fechas, resultados ni autoría.
