# Umbra — Tesis (TFG)

> Estructura del documento de 50-80 páginas que se entrega a la
> Universidad Siglo 21. Cada capítulo vive en su propio archivo
> Markdown y se compila a PDF via Pandoc.

## Estructura

```
thesis/
├── README.md                    (este archivo)
├── 00-portada.md                ← a completar (vos)
├── 01-resumen.md                ← a completar (vos) — abstract 250 palabras ES + EN
├── 02-introduccion.md           ← extiende docs/biz/TFG.md
├── 03-marco-teorico.md          ← extrae de lib/knowledge/* + citas APA
├── 04-estado-del-arte.md        ← extrae de docs/biz/MARKET.md + literatura
├── 05-metodologia.md            ← extrae de docs/biz/VALIDATION.md
├── 06-arquitectura.md           ← extrae de docs/tech/ARCHITECTURE.md + DECISIONS.md
├── 07-implementacion.md         ← extrae de UMBRA_MASTER_BUILD.md + features/*
├── 08-validacion-computacional.md ← métricas ML por dimensión + tests + clasificador de crisis
├── 09-validacion-usuarios.md    ← resultados SUS (Brooke 1996) + codificación temática
├── 10-resultados.md             ← síntesis
├── 11-discusion.md              ← a completar (vos)
├── 12-conclusiones.md           ← a completar (vos)
├── 13-trabajo-futuro.md         ← items fuera del scope + roadmap
├── 14-referencias.md            ← bibliografía APA 7th
├── 15-anexos.md                 ← ADRs completos, datasets, screenshots
├── pandoc.yaml                  ← metadata + template config para build
└── build.sh                     ← script que invoca pandoc para generar PDF
```

## Mapeo capítulo → fuente

Mantenido sincronizado con [IMPLEMENTATION_PLAN.md](../docs/biz/IMPLEMENTATION_PLAN.md):

| Capítulo | Fuente primaria en el repo | Trabajo requerido |
|---|---|---|
| 00 Portada | — | Completar datos personales, fecha, director/a |
| 01 Resumen | — | Redactar abstract ES + EN (250 palabras) |
| 02 Introducción | [docs/biz/TFG.md](../docs/biz/TFG.md) | Expandir con motivación personal + research questions |
| 03 Marco teórico | [lib/knowledge/](../lib/knowledge/) + [docs/biz/ETHICS.md](../docs/biz/ETHICS.md) | Big Five (Goldberg 1999), Jung (1921), Pearson (1991), Calvo & Peters (2014) con citas APA |
| 04 Estado del arte | [docs/biz/MARKET.md](../docs/biz/MARKET.md) + literatura | Tabla comparativa de productos comerciales |
| 05 Metodología | [docs/biz/VALIDATION.md](../docs/biz/VALIDATION.md) | Reformatear a prosa académica |
| 06 Arquitectura | [docs/tech/ARCHITECTURE.md](../docs/tech/ARCHITECTURE.md) + [ADRs](../docs/DECISIONS.md) | Mermaid diagrams + justificación de decisiones |
| 07 Implementación | [UMBRA_MASTER_BUILD.md](../UMBRA_MASTER_BUILD.md) + [docs/features/](../docs/features/) + [ml/README.md](../ml/README.md) | Resumen por fase + sprints ML, sin pegar código |
| 08 Validación computacional | `ml/eval_metrics.json` + crisis-eval reports | Tablas + análisis + discusión honesta |
| 09 Validación con usuarios | `docs/research/sus-results.csv` + transcripciones anonimizadas | SUS promedio + stddev + temas cualitativos |
| 10 Resultados | Agregado de 08 + 09 | Síntesis cuanti + cuali |
| 11 Discusión | — | Limitaciones, amenazas a validez, reflexión metodológica |
| 12 Conclusiones | — | Qué se logró, qué se aprendió, contribución |
| 13 Trabajo futuro | [IMPLEMENTATION_PLAN.md](../docs/biz/IMPLEMENTATION_PLAN.md) | Items futuros + cross-vendor + n≥30 + longitudinal |
| 14 Referencias | — | Gestionar con Zotero o BibTeX; APA 7ª edición |
| 15 Anexos | [docs/DECISIONS.md](../docs/DECISIONS.md), datasets, content/consent/, screenshots | Copiar ADRs verbatim, dataset crisis (extracto), consent v1, capturas del dashboard |

## Build

Requiere Pandoc + LaTeX (para PDF). En macOS:

```bash
brew install pandoc
brew install --cask mactex-no-gui  # ~2GB, solo una vez
```

Luego:

```bash
cd thesis/
./build.sh                     # genera thesis/umbra-tfg.pdf
./build.sh --open              # y lo abre
```

El script concatena los .md en orden numérico, aplica `pandoc.yaml` como
metadata, y escribe `umbra-tfg.pdf`.

## Voz académica

- Español formal (NO voseo — el voseo es decisión de producto, documentada en la tesis pero no usada en la prosa académica)
- APA 7ª edición para citas
- Evitá primera persona excepto en Conclusiones y Discusión donde está
  permitida
- Los bloques de código se usan con criterio — no pegues archivos
  enteros, solo snippets relevantes (5-20 líneas)

## Honestidad metodológica

Lo que NO hay que ocultar en la tesis:

- IPIP-NEO sustituye a NEO-PI-R por motivos de licencia (ADR-015).
- El corpus latinoamericano fue construido con asistencia IA y validado
  con rúbrica manual (ADR-028); el sesgo del modelo generador queda
  declarado como limitación.
- Las dimensiones Big Five que no alcancen los umbrales R² > 0.20 y
  r > 0.30 sobre el split test se reportan como
  `per_dimension_status: "low_confidence"` (ADR-027) en lugar de
  ocultarse.
- El dataset de crisis fue draft-generado con asistencia IA; la
  revisión clínica externa queda como continuación.
- n acotado en el corpus latinoamericano y en el estudio SUS
  (Brooke 1996, n=8-15 según TP1).
- La capa narrativa depende de un proveedor LLM externo; la
  capacidad de cambiar de vendor es una continuación documentada.

## Estado de los capítulos

| Capítulo | Estado | Notas |
|---|---|---|
| 00 Portada | ☐ Esqueleto | Datos personales pendientes |
| 01 Resumen | ☐ Esqueleto | — |
| 02 Introducción | ☐ Esqueleto | — |
| 03 Marco teórico | ☐ Esqueleto | — |
| 04 Estado del arte | ☐ Esqueleto | — |
| 05 Metodología | ☐ Esqueleto | — |
| 06 Arquitectura | ☐ Esqueleto | — |
| 07 Implementación | ☐ Esqueleto | — |
| 08 Validación computacional | ☐ Esqueleto — depende de Sprint ML 3 | — |
| 09 Validación con usuarios | ☐ Esqueleto — depende de sesiones SUS | — |
| 10 Resultados | ☐ Esqueleto | — |
| 11 Discusión | ☐ Esqueleto | — |
| 12 Conclusiones | ☐ Esqueleto | — |
| 13 Trabajo futuro | ☐ Esqueleto | — |
| 14 Referencias | ☐ Esqueleto | Zotero pendiente |
| 15 Anexos | ☐ Esqueleto | — |
