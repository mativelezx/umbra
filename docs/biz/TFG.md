# Umbra — TFG (Trabajo Final de Grado) Deliverables

> Dimensión académica de Umbra. Estructura de tesis, cronograma, plan de
> defensa.

## Contexto

- **Programa**: Ingeniería en Software, Universidad Siglo 21 (Argentina)
- **Tipo**: TFG — requisito de graduación
- **Formato**: monografía + artefacto de software
- **Tribunal**: profesores de software engineering + (eventualmente) un
  examinador externo cercano a psicología.
- **Escala de calificación**: 0-10 (Argentina). 9-10 con honores.

## Deliverables

### 1. El producto (Umbra web app)
Frontend Next.js + módulo analítico propio (`ml/`). Corre sobre Vercel +
Supabase + un proceso FastAPI que sirve el módulo ML. Demostrable al
tribunal por screen share o URL pública.

### 2. La monografía escrita
Aproximadamente 50-80 páginas. Estructura:

1. **Portada** — título, autor, director, fecha, institución.
2. **Resumen** — 250 palabras en español + abstract en inglés.
3. **Introducción** — contexto, motivación, preguntas de investigación.
4. **Marco teórico** — Big Five (Goldberg 1999, IPIP-NEO), funciones
   cognitivas Jung (1921), arquetipos aplicados Pearson (1991), Positive
   Computing (Calvo & Peters 2014).
5. **Estado del arte** — revisión del paisaje de productos de
   autoconocimiento digital + literatura académica sobre LLMs aplicados
   a inferencia de personalidad.
6. **Metodología** — arquitectura híbrida (capa analítica propia + capa
   narrativa LLM externa), construcción de la base de conocimiento,
   estrategia de validación (métricas ML por dimensión, axe-core en CI,
   unit + E2E con Vitest y Playwright, SUS en TP3/TP4).
7. **Arquitectura del sistema** — Next.js App Router, Supabase, módulo
   analítico FastAPI, decisiones arquitecturales documentadas en ADRs.
8. **Implementación** — desglose por fase, retos técnicos clave,
   trade-offs.
9. **Validación** — métricas del módulo analítico (MSE, R², r por
   dimensión), pasaje de tests automatizados, planificación SUS.
10. **Discusión** — hallazgos, implicancias, limitaciones, amenazas a
    la validez.
11. **Conclusiones** — contribuciones, trabajo futuro.
12. **Referencias** — APA 7ª edición.
13. **Anexos** — ADRs, dataset crisis, screenshots, capturas del
    dashboard, snapshot del módulo analítico.

### 3. Defensa (~20-30 min + Q&A)
Slides cubriendo problema, paisaje, metodología, arquitectura, demo en
vivo (5-7 min), validación, trabajo futuro y Q&A.

## Preguntas de investigación

**RQ1**: ¿Puede una arquitectura híbrida (módulo analítico propio +
capa narrativa LLM externa) producir perfiles psicológicos trazables y
auditables sobre texto introspectivo en español latinoamericano?

**RQ2**: ¿Las dimensiones Big Five inferidas por el módulo analítico
alcanzan los umbrales mínimos R² > 0.20 y r > 0.30 sobre el split test
del corpus combinado Essays + corpus latinoamericano propio?

**RQ3**: ¿El sistema cumple con los mecanismos técnicos de la Ley
25.326 y con los principios de Positive Computing (Calvo & Peters
2014), y el pipeline de detección de crisis se comporta de manera
fail-closed conforme a la especificación de seguridad?

**RQ4**: ¿Es Umbra percibido como usable por participantes del perfil
target medido con SUS (Brooke 1996) adaptado al español latinoamericano,
con n=8-15 participantes según el plan de TP3/TP4?

## Cronograma

Calendario oficial del TFG en Universidad Siglo 21:

| Hito | Fecha | Entregable |
|---|---|---|
| **TP1** | 26 de abril de 2026 | Anteproyecto entregado: marco teórico, arquitectura, metodología, cronograma. |
| Sprint ML 1 | 11-24 de mayo de 2026 | Preparación datasets (Essays + corpus propio), baseline scikit-learn. |
| **TP2** | 17 de mayo de 2026 | Prototipo, casos de uso UML, DER, arquitectura, requerimientos. |
| Sprint ML 2 | 25 mayo-7 junio | Extracción de embeddings DistilBERT congelado, entrenamiento Ridge, registro MLflow. |
| **TP3** | 7 de junio de 2026 | Gestión de proyecto: costos, riesgos, Pareto, contingencia. |
| Sprint ML 3 | 8-21 de junio | Validación cruzada, métricas por dimensión, serialización joblib. |
| Validación SUS | 22 junio-5 julio | n=8-15 sesiones, cuestionario SUS adaptado al español latinoamericano. |
| **TP4** | 28 de junio de 2026 | Documento integrado final. |
| Defensa oral | agosto/septiembre 2026 | Slides + demo en vivo + Q&A. |

## Metodología (Scrum + ADRs)

- **Scrum** (Schwaber & Sutherland 2020) + Manifiesto Ágil (Beck et al.
  2001).
- Sprints de 1 semana calendario.
- Equipo: 1 integrante (PO + SM + Dev), supervisado por director TFG.
- Artefactos: Product Backlog (Markdown versionado), Sprint Backlog
  (tablero), Incremento (código mergeado).
- **Architecture Decision Records (ADR)** — Nygard 2011.
- Definition of Done: código en main + tests actualizados + docs/ADR
  + a11y axe + cumplimiento normativo cuando aplica.

## Voz académica

- Español formal (NO voseo) en la prosa de la tesis.
- El producto usa voseo argentino — esa decisión de producto se
  documenta en la tesis pero la prosa académica se redacta en español
  estándar.
- Cita todo. APA 7ª edición. Zotero recomendado.

## Honestidad sobre limitaciones

La tesis declara explícitamente las siguientes limitaciones:

- Heterogeneidad EN vs ES-AR de los datasets ML (Essays en inglés vs
  corpus propio en español latinoamericano). Mitigación documentada en
  ADR-027 (umbrales por dimensión) y ADR-028 (rúbrica de validación
  manual del corpus latinoamericano).
- Sesgo del corpus latinoamericano generado con asistencia de IA
  generativa: declarado en ADR-028, mitigado con la rúbrica documentada
  en `ml/data/latinoamericano/rubrica_validacion.md`.
- Dependencia operativa del proveedor LLM externo en la capa narrativa:
  mitigado con identificador de modelo fijado y capa de abstracción.
- n bajo en el estudio SUS planificado para TP3/TP4: defendible con
  Brooke (1996) como instrumento estándar de la industria; el reporte
  honesto del n efectivo es preferible a inflar la muestra.
- IPIP-NEO sustituye a NEO-PI-R por motivos de licencia (ADR-015).

## Estrategia de defensa

### Preguntas probables y respuestas

- **"¿Por qué módulo analítico propio en vez de delegar todo al LLM?"**
  Trazabilidad y auditoría: el módulo serializa artefactos, calcula
  métricas por dimensión, versiona datos con DVC y experimentos con
  MLflow. ADR-026.
- **"¿Por qué LLM externo en la capa narrativa?"** La capa narrativa
  produce texto extenso, contextualizado y conversacional que sería
  prohibitivamente costoso entrenar localmente. La separación medido
  vs interpretativo está formalizada en ADR-002 + ADR-007.
- **"¿Qué pasa si el LLM cambia su modelo?"** El identificador de
  modelo está fijado por env var (ADR-005). Una capa de abstracción
  sobre el cliente permite swap a un proveedor alternativo si fuera
  necesario.
- **"¿Esto es terapia?"** No, no-meta explícito; banner permanente
  + classifier de crisis fail-closed + recursos argentinos (135, 911,
  Salud Mental Responde, Centros de Salud Mental Comunitaria).
- **"Datos personales — ¿cómo cumplís con Ley 25.326?"** Cinco
  mecanismos técnicos: consent bloqueante con SHA-256 del texto
  verbatim, exportación, rectificación, cancelación con magic link
  single-use, oposición a investigación. ADRs 002, 013, 021, 024.
- **"¿MBTI?"** No, funciones Jung directamente. Jung (1921) en
  dominio público.
- **"¿Diferencia con 16personalities?"** Ver [biz/MARKET.md](MARKET.md):
  arquitectura híbrida auditable + reporte por dimensión + voseo
  latinoamericano nativo + cumplimiento Ley 25.326.

### Demo script (5-7 min)
1. Landing (10s).
2. Register + consent (30s) — Ley 25.326.
3. Onboarding (60s) — onboarding dinámico, progresivo.
4. Dashboard (45s) — radar Big Five con `per_dimension_status`, Jung
   bars, archetype card.
5. Narrativa (45s) — streaming.
6. Chat (60s) — mensaje normal, luego mensaje de crisis, mostrar la
   crisis card bloqueando.
7. Export (20s) — PDF download.
8. /settings/export (20s) — Ley 25.326 acceso ZIP.

## Referencias

### Académicas
- Beck, K., et al. (2001). Manifiesto por el Desarrollo Ágil de Software.
- Brooke, J. (1996). SUS: A quick and dirty usability scale. En P. W.
  Jordan et al. (Eds.), *Usability evaluation in industry*. Taylor &
  Francis.
- Calvo, R. A., & Peters, D. (2014). *Positive Computing: Technology
  for Wellbeing and Human Potential*. MIT Press.
- Costa, P. T., & McCrae, R. R. (1992). NEO PI-R Professional Manual.
- Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2019). BERT.
- Goldberg, L. R. (1999). A broad-bandwidth, public domain, personality
  inventory measuring the lower-level facets of several five-factor
  models. En *Personality Psychology in Europe*, Vol. 7. Tilburg
  University Press.
- Hoerl, A. E., & Kennard, R. W. (1970). Ridge regression: Biased
  estimation for nonorthogonal problems.
- Howard, J., & Ruder, S. (2018). Universal Language Model Fine-tuning
  for Text Classification.
- John, O. P., & Srivastava, S. (1999). The Big Five trait taxonomy.
- Jung, C. G. (1921). *Tipos psicológicos*.
- Ley 25.326 (Argentina). Protección de los Datos Personales.
- Nygard, M. T. (2011). Documenting Architecture Decisions.
- Pearson, C. S. (1991). *Awakening the heroes within*. HarperOne.
- Pedregosa, F., et al. (2011). Scikit-learn: Machine learning in
  Python.
- Pennebaker, J. W., & King, L. A. (1999). Linguistic styles: Language
  use as an individual difference.
- Peters, M. E., et al. (2019). To tune or not to tune?
- Pittenger, D. J. (2005). Cautionary comments regarding the
  Myers-Briggs Type Indicator.
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory.
- Sanh, V., Debut, L., Chaumond, J., & Wolf, T. (2019). DistilBERT.
- Schwaber, K., & Sutherland, J. (2020). The Scrum Guide.
- Sculley, D., et al. (2015). Hidden technical debt in machine
  learning systems.
- Stein, R., & Swan, A. B. (2019). Evaluating the validity of the
  Myers-Briggs Type Indicator.
- Treveil, M., et al. (2020). *Introducing MLOps*. O'Reilly.
- Wolf, T., et al. (2020). Transformers: State-of-the-art Natural
  Language Processing.
- Zaharia, M., et al. (2018). Accelerating the machine learning
  lifecycle with MLflow.

### Internas (repo)

- [biz/IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- [biz/VALIDATION.md](VALIDATION.md)
- [biz/LEGAL.md](LEGAL.md)
- [biz/ETHICS.md](ETHICS.md)
- [DECISIONS.md](../DECISIONS.md)
- [tech/EVALS.md](../tech/EVALS.md)
- [tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md)
- [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md)
