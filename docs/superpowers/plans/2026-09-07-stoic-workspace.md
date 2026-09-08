# Umbra: experiencia guiada e identidad — implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el resultado y las actividades en un recorrido comprensible, con identidad propia dentro de la dirección Stoic aprobada.

**Architecture:** Conservar Next.js, datos, rutas, APIs, lector y guardado existentes. Separar marca compartida, composición de resultado y actividades; no añadir dependencias ni modificar el modelo ML.

**Tech Stack:** Next.js 15.5.18, React 18, TypeScript, CSS, Phosphor, Vitest y Playwright.

**Spec:** Aprobación de Matías en esta conversación, 2026-09-07: dirección Stoic, isotipo sin letras, guía clara, iconos, contraste, movimiento; investigar evidencia sin fabricar validación.

## Global Constraints

- Web escritorio y móvil; validación visual con datos sintéticos; demo real de 3000 preservada durante el build candidato.
- Sin nuevas cuentas, migraciones, llamadas pagas, cambios de puntuación ni acceso a conversaciones personales.
- Español, sin emoji, marca `umbra`; instrumentos experimentales y narrativa de IA explícitos.
- Stoic gobierna composición y acabado, no autoriza importar assets propietarios ni sus claims clínicos.
- Conservar Bricolage Grotesque libre. Construir geometría vectorial propia, sin copiar ilustraciones.

## Task 1: Marca y envolvente

Files: `components/layout/Brand.tsx`, `components/layout/BrandMark.tsx`, `app/icon.svg`, `components/layout/Sidebar.tsx`, `components/layout/TopBar.tsx`, `app/globals.css`, `app/layout.tsx`.

Produces: `BrandMark({ className?: string })`, SVG decorativo reutilizable, no state; `Brand` mantiene su interfaz `href?: string`.

- [ ] Probar navegación de Brand con ruta pública y privada; el enlace conserva nombre accesible, SVG decorativo. Ejecutar `pnpm exec vitest run components/layout/Brand.test.tsx`.
- [ ] Reemplazar U por dos formas curvas que delimitan una abertura; aplicar el mismo dibujo al favicon y cabeceras del informe. Entrada única corta; sin autoplay permanente ni sensibilidad al movimiento.
- [ ] Navegación estable con icono, nombre y explicación corta. Preservar rutas y estado activo. Actualizar contrato de dirección en layout.

## Task 2: Resultado y actividades

Files: `app/dashboard/page.tsx`, `components/dashboard/ProfileWorkspace.tsx`, `components/dashboard/BigFiveDimensions.tsx`, nuevos componentes/CSS junto a ellos; `components/plan/ActivityWorkspace.tsx` y CSS específico.

Consumes: `BigFive`, `PerDimensionStatus`, `DevelopmentArea`, contenidos y callbacks existentes.

- [ ] Test rojo de acción inicial que lleva al lector manteniendo navegación de pestañas y foco. Test de explicación de dimensiones sin números cuando low_confidence. Probar selección de actividad y retorno sin perder estado.
- [ ] Cabecera compacta y recorrido con un CTA principal; paneles diferenciados con iconos y explicaciones, sin confundir lectura generada y estimación del modelo. Mantener todas las advertencias de validez accesibles.
- [ ] Biblioteca visual con geometrías propias y conteos derivados de pasos realmente marcados, no rachas ficticias.
- [ ] Ejecutar tests focales; `pnpm typecheck`, `pnpm lint`, `pnpm test`.

## Task 3: Verificación y entrega de la revisión

- [ ] Compilar con directorio candidato distinto de `.next-delivery-verified`; revisar la app en un puerto libre permitido, preservando 3000 hasta verificar.
- [ ] Playwright sin generación: navegación, pestañas por teclado, retorno de actividad, valores no respaldados ausentes, responsive 390/768/1440 y movimiento reducido.
- [ ] Capturas válidas escritorio/móvil/ancho del usuario; contraste, overflow y consola. Revisión Impeccable independiente y documentación del diseño observado.
- [ ] Promover solo si no hay regresiones materiales; informar resultados y pendientes del ML separados. No publicar archivos académicos ni reemplazar el ZIP automáticamente con una revisión aún abierta.

## Evidencia y decisión

La consigna escrita requiere demo pública; no fija video obligatorio ni parámetros de grabación. Audios docentes no transcritos.
La investigación ML es independiente y no cambia la metodología en este plan. Requiere distinguir integración funcional, validez predictiva y utilidad para usuarios.

## Aclaración posterior de marca, 7/9

Matías pidió expresamente que la palabra `umbra` también sea un logotipo diseñado, no solo el símbolo. Alcance añadido: `BrandWordmark.tsx` con cinco contornos originales, nombre accesible en el enlace, uso compartido en marca y PDF. Bricolage se mantiene para textos. Sin fuentes, paquetes ni imágenes externas nuevas. Verificar pequeño/grande y claro/oscuro, junto al símbolo, sin alterar el resto de la composición ya revisada.

- [ ] Test de lettering vectorial y destino público/privado; verificar primero el fallo por ausencia del wordmark.
- [ ] Implementar contornos, mantener nombre accesible y símbolo independiente; no animar cada letra.
- [ ] Recapturar el incremento de marca, revisión independiente del delta, sincronizar DESIGN y volver a compilar candidato antes de promover.
