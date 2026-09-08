# Capturas y comprobaciones de Umbra

Capturas reales de navegador, con datos ficticios. No son diseños simulados ni participantes de investigación.

Web: https://umbra-sigma.vercel.app · Código publicado: `9a01631dbb18c0b9dea9c2ca61f937f57a9880bf` · Despliegue: `dpl_CW6jtaKN9U4tp1eYH7dceC1ijMcv`.

Abrí `galeria.html` para recorrer las imágenes. `resultados.json` conserva el resultado por pantalla, accesibilidad y desbordamientos. `informe-sintetico-de-la-app.pdf` es la descarga probada, no el documento de tesis.

Los controles nuevos son de lectura: no crean cuentas, no envían correos y bloquean las mutaciones a `/api/`. Se agregan cinco capturas identificadas del recorrido real anterior para mostrar onboarding y resultados. No se volvió a consumir IA para obtenerlas.

Las 50 capturas `chromium-*` y `mobile-*` y `resultados.json` se actualizaron con el barrido del 8 de septiembre de 2026, iniciado a las 12:43 UTC, bajo Node 24.19.0. Los cuatro recorridos pasaron sin omisiones ni reintentos; no se detectó desbordamiento horizontal ni infracciones serias/críticas de axe. Las cinco imágenes `recorrido-*` siguen siendo evidencia del 7 de septiembre. Los contactos conservados son miniaturas de la revisión anterior; para esta repetición, abrir las capturas individuales o la galería. La primera pasada del día falló por falta de espacio al escribir una captura; se liberó caché regenerable y se repitieron los cuatro recorridos completos.

El cruce documental de esta publicación corresponde al PDF de 94 páginas y al DOCX de la etiqueta `reentrega-2026-09-08-v2`: 156 controles aprobados y 175 destinos de índices localizados. El manifiesto y el resultado contienen sus huellas SHA-256. No se debe combinar este resultado con el documento de 90 páginas de la primera publicación.

| Pantalla | Dispositivo | Procedencia |
|---|---|---|
| [auth-link-error](capturas/chromium-auth-link-error.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [forgot-password](capturas/chromium-forgot-password.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [landing](capturas/chromium-landing.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [login](capturas/chromium-login.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [not-found](capturas/chromium-not-found.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [privacy](capturas/chromium-privacy.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [register](capturas/chromium-register.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [reset-without-session](capturas/chromium-reset-without-session.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [terms](capturas/chromium-terms.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [auth-link-error](capturas/mobile-auth-link-error.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [forgot-password](capturas/mobile-forgot-password.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [landing](capturas/mobile-landing.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [login](capturas/mobile-login.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [not-found](capturas/mobile-not-found.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [privacy](capturas/mobile-privacy.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [register](capturas/mobile-register.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [reset-without-session](capturas/mobile-reset-without-session.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [terms](capturas/mobile-terms.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [assessment](capturas/chromium-assessment.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [chat](capturas/chromium-chat.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [consent](capturas/chromium-consent.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [dashboard-jung-detalle](capturas/chromium-dashboard-jung-detalle.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [dashboard-jung](capturas/chromium-dashboard-jung.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [dashboard-modelo](capturas/chromium-dashboard-modelo.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [dashboard](capturas/chromium-dashboard.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [export](capturas/chromium-export.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [onboarding](capturas/chromium-onboarding.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [plan](capturas/chromium-plan.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [settings-delete-confirm](capturas/chromium-settings-delete-confirm.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [settings-delete](capturas/chromium-settings-delete.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [settings-export](capturas/chromium-settings-export.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [settings-profile](capturas/chromium-settings-profile.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [settings-research-opt-out](capturas/chromium-settings-research-opt-out.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [settings](capturas/chromium-settings.png) | chromium | Vercel, captura de lectura sin nueva generación |
| [assessment](capturas/mobile-assessment.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [chat](capturas/mobile-chat.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [consent](capturas/mobile-consent.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [dashboard-jung-detalle](capturas/mobile-dashboard-jung-detalle.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [dashboard-jung](capturas/mobile-dashboard-jung.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [dashboard-modelo](capturas/mobile-dashboard-modelo.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [dashboard](capturas/mobile-dashboard.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [export](capturas/mobile-export.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [onboarding](capturas/mobile-onboarding.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [plan](capturas/mobile-plan.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [settings-delete-confirm](capturas/mobile-settings-delete-confirm.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [settings-delete](capturas/mobile-settings-delete.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [settings-export](capturas/mobile-settings-export.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [settings-profile](capturas/mobile-settings-profile.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [settings-research-opt-out](capturas/mobile-settings-research-opt-out.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [settings](capturas/mobile-settings.png) | mobile | Vercel, captura de lectura sin nueva generación |
| [model-real](capturas/recorrido-model-real.png) | chromium | Recorrido con servicios reales del 7/9, cuenta ficticia confirmada por administración |
| [onboarding-real](capturas/recorrido-onboarding-real.png) | chromium | Recorrido con servicios reales del 7/9, cuenta ficticia confirmada por administración |
| [plan-real](capturas/recorrido-plan-real.png) | chromium | Recorrido con servicios reales del 7/9, cuenta ficticia confirmada por administración |
| [reading-real](capturas/recorrido-reading-real.png) | chromium | Recorrido con servicios reales del 7/9, cuenta ficticia confirmada por administración |
| [self-report-real](capturas/recorrido-self-report-real.png) | chromium | Recorrido con servicios reales del 7/9, cuenta ficticia confirmada por administración |

## Límites

Capturas sintéticas. No prueban correo, eficacia psicológica ni todos los estados posibles. Las imágenes no certifican movimiento; la captura congela animaciones.

No se comprobó en este barrido: Registro y recuperación por correo externo; Eliminación efectiva de una cuenta; Onboarding nuevo o análisis pago; Recuperación con token válido; Escenarios de crisis con personas; Restauración de respaldos.

La primera pasada detectó contraste 4,06:1 en tres enlaces “Eliminar cuenta”. Se eliminó la transparencia del texto y se repitió contra un despliegue nuevo. No se ocultaron las comprobaciones de contraste ni se excluyeron esos enlaces.
