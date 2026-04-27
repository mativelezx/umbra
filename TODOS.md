# Umbra — TODOS

Continuaciones identificadas durante la construcción del producto. Prioridad: P1 (cerrar antes de la entrega final), P2 (post-defensa), P3 (cuando dé el aire).

---

## P1 — Cerrar antes de TP4

- [ ] **Completar el corpus latinoamericano** a la franja n=50-100 documentada en ADR-028, con su rúbrica de validación manual aplicada caso por caso (`ml/data/latinoamericano/rubrica_validacion.md`).
- [ ] **Cerrar el entrenamiento del módulo analítico** y verificar que las métricas mínimas R²>0.20 y r>0.30 por dimensión Big Five se cumplen en el split test (ADR-027). Las dimensiones que no alcancen el umbral se reportan honestamente como `low_confidence`.
- [ ] **Sesiones SUS** (n=8-15 según TP1, instrumento Brooke 1996 adaptado al español latinoamericano) planificadas para TP3/TP4. Materiales listos en `docs/research/`.
- [ ] **Configurar `RESEND_API_KEY`** en Vercel para habilitar el flujo de borrado con magic link en producción.

## P2 — Post-defensa

- [ ] **Cross-vendor en la capa narrativa**: comparar el comportamiento del retrato y del chat con un proveedor alternativo de IA generativa para reducir dependencia de un único vendor.
- [ ] **Longitudinal tracking**: el schema (`psychological_profiles.version`) ya es forward-compat. Habilita "diff perfil entonces vs ahora" cuando se desbloquea la carta al futuro.
- [ ] **OAuth social login** (Google/Apple/GitHub). Email+password cubre el MVP.
- [ ] **og:image social share** vía `@vercel/og` con arquetipo + Big Five summary.
- [ ] **Cmd+K global search** (`cmdk` library) sobre profile/narrative/chat por texto.
- [ ] **QR en PDF export** para `/p/{share_token}` (vista online auth-gated).
- [ ] **Modo silencio** — botón del dashboard que transforma la vista en modo meditación (cita aleatoria sobre fondo cósmico).
- [ ] **Export pagination** — `/api/account/export` para usuarios con muchos mensajes necesita streaming gzip o paginación; actualmente puede saturar la Edge runtime.
- [ ] **Export+delete race** — agregar lock simbólico "export in progress" antes del delete.
- [ ] **Chat session timeout mid-type** — warning client-side a los 40 min antes del cierre del backend a los 45.
- [ ] **Partial loading states para dashboard y plan**.
- [ ] **Runbook: Claude API down** — degradar a un modelo alternativo; banner de mantenimiento si todos caen.
- [ ] **Runbook: crisis false-positive reportado por usuario** — query `crisis_events` por user_hash, revisar lexicón, decidir si re-training o excepción.
- [ ] **Runbook: daily budget excedido** — comunicar a usuarios activos, ajustar cap si se justifica.
- [ ] **Alerta**: `crisis_events severity=high count > 5/día` → revisión manual.
- [ ] **Alerta**: API error rate > 5% sobre 5min → email al desarrollador.
- [ ] **Dashboard: daily cost spend** — query SQL sobre `rate_limits` joined con pricing.

## P3 — Polish y nice-to-have

- [ ] **Knowledge block helper DRY refactor** — los 4 `*KnowledgeBlock()` comparten estructura. Extraer `buildKnowledgeBlock<T>(items, renderFn)`.
- [ ] **Admin panel** — actualmente operado vía Supabase dashboard + SQL. Futuro `/admin` con read-only views de rate_limits, crisis_events, research_dataset counts.
- [ ] **Export a Notion / Obsidian** — markdown del profile + narrativa + plan.
- [ ] **Voice input** vía Whisper.
- [ ] **Research collaboration mode** — permitir que otros investigadores swappeen su `lib/knowledge/` + `lib/prompts/` y prueben otros frameworks sobre sus datos.
- [ ] **Zod schemas convention**: schemas viven en `lib/schemas/{feature}.ts`. Excepción: schemas one-off pueden ser inline.
- [ ] **`analysis_raw` JSONB retention cron** (ADR-019): nightly Supabase cron purga rows > 30 días.
- [ ] **Redis atomic DECR para global budget** (post-ship): reemplazar `unstable_cache` 5-min TTL si el producto escala más allá del TFG. ADR-016 documenta el trade-off actual.

## Riesgos asumidos (declarados para referencia futura)

- **Heterogeneidad EN/ES-AR de los datasets ML**: mitigación documentada en ADR-027 (umbrales por dimensión + `per_dimension_status`).
- **Sesgo del corpus latinoamericano generado con asistencia IA**: mitigación documentada en ADR-028 (rúbrica manual + recomendación de validación cruzada con muestras humanas).
- **Dependencia del proveedor LLM externo en la capa narrativa**: mitigación documentada vía capa de abstracción + identificador de modelo fijado + alternativa con interfaz compatible identificada.
- **Reclutamiento SUS bajo n objetivo**: mitigación = reporte honesto del n efectivo + apoyo en unit/E2E/axe + métricas ML reportables que son independientes del n de usuarios.
