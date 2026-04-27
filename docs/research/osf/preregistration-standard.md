# Umbra — OSF Preregistration · DESCONTINUADO (2026-04-27)

> **Este documento está descontinuado**. Reemplazado por la cadena DVC +
> MLflow + commits del repo público + métricas committeadas en
> `/ml/eval_metrics.json`. Ver:
>
> - `docs/DECISIONS.md` ADR-012 (SUPERSEDED), ADR-026, ADR-028.
> - `docs/biz/VALIDATION.md` (estado de validación post-pivot).
> - `/ml/README.md` (módulo ML propio).
>
> El contenido original de la preregistración OSF se preservó en el
> historial de Git para trazabilidad académica. Cualquier referencia
> activa a OSF en el TFG o en la defensa debe quitarse.

## Razón del retiro

La preregistración OSF se definió cuando el componente analítico de
Umbra era íntegramente un prompt a Claude (Pass 1 monolítico, ahora
deprecated). Las hipótesis H1 (determinismo) y H2 (robustez a
paráfrasis) tenían sentido sobre un instrumento estocástico. Tras el
pivot ML (ADR-002 v2 + ADR-026), la inferencia Big Five la realiza un
regresor entrenado y determinístico por construcción; H1 dejó de ser
una pregunta de investigación. La validación primary del TFG entregado
son métricas estándar de regresión por dimensión Big Five sobre el
regresor entrenado (ADR-028).

La auditabilidad y trazabilidad que prometía OSF (preregistro de
hipótesis + plan de análisis + datos) la cubre ahora una cadena
distinta: corpus versionado con DVC, experimentos trackeados con
MLflow, código y métricas committeados en repo público (umbra), y
script `make all` que reproduce el pipeline end-to-end en cualquier
máquina con Python.

Acción para Mati cuando se levante: `git rm` este archivo desde la
terminal (o aplicar `COMMIT_PLAN.md`). Los importadores documentales
ya fueron actualizados.
