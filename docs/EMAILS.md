# Correos de Umbra

Los mensajes de cuenta usan la marca de Umbra: logotipo en minúsculas, isotipo, cabecera grafito, cuerpo blanco y una acción principal. No incluyen respuestas del cuestionario, textos personales, resultados ni diagnósticos.

## Plantillas y disparadores

| Mensaje | Servicio | Cuándo se usa |
|---|---|---|
| Bienvenida | Resend, `/api/account/welcome` o callback confirmado | Después de un registro con sesión inmediata o de confirmar una cuenta reciente por correo. El callback envía después de responder; el envío no bloquea la creación de cuenta. |
| Confirmar cuenta | Supabase Auth | Si el entorno exige confirmar el email al registrarse. En la demo local esta exigencia está desactivada. |
| Invitación | Supabase Auth | Cuando se utiliza una invitación de Auth. No se agregó un panel de invitaciones. |
| Recuperación | Supabase Auth | Desde «Olvidé mi contraseña», con regreso a `/reset-password`. |
| Enlace de acceso | Supabase Auth | Si se solicita un magic link. Tener la plantilla no agrega ese método a la pantalla de acceso. |
| Confirmar nuevo email | Supabase Auth | Ante una solicitud de cambio de email. |
| Código de verificación | Supabase Auth | Cuando Auth requiere reautenticación. |
| Contraseña actualizada | Supabase Auth | Notificación de seguridad después de cambiarla. |
| Email actualizado | Supabase Auth | Notificación de seguridad después de completar el cambio. |
| Confirmar eliminación | Resend | Desde ajustes de cuenta; abrir el enlace no borra datos. La eliminación requiere confirmar en la app. |

## Fuente única

`lib/email/templates.ts` genera HTML y texto plano. `scripts/build-email-templates.ts` genera las ocho plantillas de Auth y la galería local de diez mensajes. Ejecutar con Node y tsx:

```sh
node --import tsx scripts/build-email-templates.ts
node --import tsx scripts/build-email-templates.ts --check
```

La galería queda en `artifacts/email-preview`. Sus acciones son ficticias y no operan sobre cuentas. Las rutas de plantillas de confirmación/autenticación y notificaciones en `supabase/config.toml` siguen los dos criterios de resolución de Supabase CLI 2.84.2; no normalizarlas sin probar esa versión.

## Imágenes y compatibilidad

Los PNG de `public/brand` se derivan del lettering y símbolo existentes. Resend los adjunta mediante CID. En las plantillas de Auth, las imágenes se buscan en el Site URL de la aplicación: en un despliegue debe ser una dirección HTTPS pública. Georgia y Arial son alternativas para clientes que no cargan las fuentes de la app. No se depende de SVG, JavaScript ni animaciones para entender o usar el correo.

## Entornos y secretos

- Supabase local entrega sus correos en Mailpit (`http://127.0.0.1:54324`); esto no equivale a enviarlos a Gmail.
- Resend usa `RESEND_API_KEY` y `EMAIL_FROM`, sólo en configuración privada del servidor. Nunca deben incluirse en Git, el ZIP o el video.
- El remitente `onboarding@resend.dev` permite pruebas al titular de la cuenta. No habilita destinatarios arbitrarios. Hace falta verificar un dominio propio para eso.
- Las plantillas del repositorio no se instalan automáticamente en un Supabase remoto: configurar allí Auth → Email Templates, Site URL, redirecciones y SMTP verificado antes de afirmar que está publicado.
- Limitación comprobada de CLI 2.84.2: lee las dos configuraciones `auth.email.notification`, pero su arranque local no las transmite a GoTrue. Los diseños «Contraseña actualizada» y «Email actualizado» están preparados; **esos dos avisos no se envían automáticamente en este entorno local**. No se disfrazó esa ausencia como un envío correcto. El correo de recuperación sí tiene plantilla activa. Para verificar avisos en un entorno que los habilite, ejecutar el E2E con `E2E_AUTH_NOTIFICATIONS=true`.
- La bienvenida admite sólo cuentas de hasta una hora y usa una clave de idempotencia estable. La recuperación evita informar si el email está registrado.
- Ambos recorridos de bienvenida comparten la misma comprobación de antigüedad y clave de deduplicación. Recuperación, intercambio inválido y reapertura de un código ya usado no disparan otra bienvenida. Una confirmación posterior a la ventana de una hora puede completar el acceso, pero no reenvía este mensaje opcional.
- Las llamadas a Resend tienen una espera máxima de ocho segundos. Una falla o demora del correo opcional no revoca una sesión confirmada ni se presenta como un envío exitoso.

## Verificación

`lib/email/*.test.ts` comprueba contenido, escape, enlaces, destinatario autenticado, deduplicación y fallos. `components/auth/PasswordRecoveryForm.test.tsx` cubre los estados del formulario. `e2e/email-preview.spec.ts` verifica los diez correos a 720 y 390 px con controles de accesibilidad. `e2e/email-recovery-real.spec.ts`, con opt-in y URLs locales, crea una cuenta ficticia y prueba recuperación real con Mailpit, actualización y autenticación.

La corrección del 8/9 añade diez controles del callback en `lib/auth/callback.test.ts` y uno de timeout del proveedor. Se reprodujo primero el faltante de bienvenida del callback: dos comprobaciones fallaron y pasaron tras corregirlo. La suite completa posterior pasó 409 pruebas en 67 archivos, además de tipos y lint. Son pruebas controladas; el envío a destinatarios externos sigue requiriendo SMTP y dominio propio verificado.

Las capturas del navegador no certifican todos los clientes de correo ni sus modos oscuros. Tampoco prueban un despliegue remoto. Conservar los logs del entorno realmente ejecutado y distinguirlos de los tests simulados.
