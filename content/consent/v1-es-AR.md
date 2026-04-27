# Umbra — Consentimiento informado (v1, es-AR)

> Este es el texto verbatim de la versión `2026-04-14-v1` del
> consentimiento informado para Umbra, en español latinoamericano. Es la
> fuente única de verdad que la página `/consent` renderiza. Cualquier
> cambio material bumpea la versión a `2026-04-14-v2` (o equivalente)
> y crea un nuevo archivo `v2-es-AR.md` — **esta archivo nunca se edita
> in-place** para preservar la trazabilidad de Ley 25.326 art. 7.
>
> Identificador de versión: `2026-04-14-v1`
> Locale: `es-AR`
> Hash SHA-256: se computa en CI y se verifica contra los valores
> enviados por los clientes al endpoint `/api/consent`.

## ¿Qué es Umbra?

Umbra es una plataforma web de autoconocimiento que usa inteligencia
artificial para generar un retrato personal sobre la base de textos
introspectivos que vos escribís. Combina teoría de funciones cognitivas
de Jung, el modelo Big Five (OCEAN) y los principios de Positive
Computing. **Umbra no es terapia. No reemplaza un tratamiento profesional
ni pretende diagnosticar.**

Este producto se desarrolla como Trabajo Final de Graduación de
Ingeniería en Software en la Universidad Siglo 21 (Argentina).

## ¿Qué datos recolectamos?

- **Email** — necesario para registrarte, iniciar sesión y recuperar la
  cuenta.
- **Textos introspectivos** — lo que escribís durante el onboarding y
  en el chat.
- **Perfil psicológico generado** — el resultado del análisis que hace
  Claude sobre tus textos (Big Five, funciones Jung, arquetipo,
  narrativa).
- **Dirección IP** — la almacenamos hasheada con HMAC-SHA256 y una clave
  secreta (pepper) del servidor. No guardamos la IP en claro.
- **User agent** — para debugging de compatibilidad.

## ¿Dónde se almacenan?

- **Supabase PostgreSQL** en un datacenter de US-East (Virginia).
- Cifrado en tránsito (TLS) y en reposo (Supabase default).
- **Claude API (Anthropic)**: los textos se envían a Anthropic solo
  para procesamiento. Por política de Anthropic, **no se usan para
  entrenar modelos**.

## ¿Quién accede a tus datos?

- Vos, desde tu sesión autenticada.
- El sistema automatizado de Umbra (rutas Edge/Node).
- El responsable del tratamiento (el desarrollador/tesista), con
  fines de mantenimiento y soporte.
- Anthropic, transitoriamente, durante el procesamiento de tus
  solicitudes.
- **NO se comparten con terceros para publicidad, marketing ni
  monetización.**

## ¿Cuánto tiempo se retienen?

- Indefinidamente, hasta que solicites borrado.
- Excepciones automatizadas:
  - `analysis_raw` (payload debug del analizador): se purga a los 30 días.
  - `crisis_events` (auditoría de seguridad del chat): se purga a los 30 días.

## Tus derechos (Ley 25.326, arts. 13-17)

Bajo la Ley 25.326 de Protección de Datos Personales tenés los
siguientes derechos, accesibles desde `/settings/account` o por email
al responsable del tratamiento:

- **Acceso** (art. 14): descargar toda tu información via
  `/api/account/export`.
- **Rectificación** (art. 16): corregir datos inexactos desde
  `/settings/profile`.
- **Cancelación** (art. 16): solicitar borrado completo desde
  `/settings/account/delete`. El proceso requiere confirmación por
  email con un token de vida corta.
- **Oposición** (art. 16): oponerte al uso de tus datos para fines
  específicos como investigación opt-in.

Tiempo de respuesta máximo: **10 días hábiles** (art. 14).

## Datos sensibles

Tus textos introspectivos pueden tocar temas de salud mental,
creencias, relaciones, orientación sexual u otros datos sensibles
(Ley 25.326 art. 2 inc. 3). El consentimiento que otorgás al aceptar
este texto cumple con el requisito de consentimiento expreso por
escrito o medio equivalente verificable (art. 7). Umbra guarda el
hash SHA-256 de este texto de consentimiento al momento de tu
aceptación, para poder probar más adelante qué texto exacto viste.

## Crisis y recursos de ayuda

Umbra incluye un detector de crisis automático. Si un mensaje contiene
señales de riesgo (ideación suicida, autolesión activa, psicosis,
consumo con riesgo vital), el chat se bloquea y te mostramos recursos
profesionales:

- **135** — Centro de Asistencia al Suicida (gratis, línea nacional).
- **911** — Emergencias.
- **0800-999-0091** — Salud Mental Responde.
- **CABA**: SOS Un Amigo Anónimo (011-4783-1300).

Si sentís que estás en crisis, por favor llamá a alguno de esos números
antes de continuar usando Umbra. **Umbra no reemplaza ayuda
profesional en una crisis.**

## Responsable del tratamiento

- Matías Vélez (autor del TFG)
- Universidad Siglo 21 — Ingeniería en Software
- Email de contacto: (a completar antes del despliegue público)

## Derecho a denunciar

Ante la **Agencia de Acceso a la Información Pública (AAIP)**:
https://www.argentina.gob.ar/aaip

## Aceptación

Al marcar el checkbox en la página `/consent` declarás que:

1. Leíste este texto completo.
2. Tenés 18 años o más (o autorización de adulto responsable).
3. Aceptás el tratamiento de tus datos personales y sensibles según
   este texto y la Ley 25.326.
4. Entendés que Umbra no es terapia y no reemplaza ayuda profesional.
5. Podés retirar tu consentimiento en cualquier momento solicitando
   borrado de tu cuenta.
