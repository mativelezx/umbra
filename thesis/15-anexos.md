# Anexos

<!-- Los anexos contienen material referencial que no corta el flujo
     de lectura del cuerpo principal pero que el tribunal puede querer
     inspeccionar. Cada anexo se pega verbatim desde su fuente en el
     repo para que no haya drift entre el documento y el código. -->

## Anexo A — ADRs seleccionadas

<!-- Copiar verbatim desde docs/DECISIONS.md. Las cinco más
     representativas:

     - ADR-002: Jung directo, no MBTI (lectura interpretativa).
     - ADR-008: crisis_events observability con salted hashes.
     - ADR-024: consent_text_hash + locale (Ley 25.326 art. 7).
     - ADR-026: módulo analítico propio (DistilBERT congelado +
       Ridge multi-output).
     - ADR-027: reporte por dimensión Big Five con umbrales
       R²>0.20, r>0.30 y per_dimension_status.

     El conjunto completo de ADRs queda en docs/DECISIONS.md. -->

## Anexo B — Texto de consentimiento informado

<!-- Copiar verbatim content/consent/v1-es-AR.md (consentimiento
     del producto) y content/consent/research-m3-v1-es-AR.md
     (consentimiento específico del estudio de usabilidad
     planificado para TP3/TP4). -->

## Anexo C — Dataset de crisis etiquetado (extracto)

<!-- Copiar un subset representativo del lib/evals/crisis-dataset.ts
     — NO los 100 casos por ética (evitar que el dataset completo
     se indexe en buscadores), solo 5 por categoría como ejemplo.
     El dataset completo queda en el repo con nota ética. -->

## Anexo D — Corpus latinoamericano (extracto)

<!-- Copiar 3-5 casos representativos del corpus
     ml/data/latinoamericano/cases.csv como ejemplo del formato.
     El corpus completo queda en el repo, versionado con DVC. -->

## Anexo E — Rúbrica de validación del corpus latinoamericano

<!-- Copiar verbatim ml/data/latinoamericano/rubrica_validacion.md
     (ADR-028). -->

## Anexo F — Protocolo de sesión SUS

<!-- Copiar verbatim docs/research/usability-protocol.md -->

## Anexo G — SUS en español latinoamericano

<!-- Copiar verbatim docs/research/sus-spanish-latinoamericano.md -->

## Anexo H — Métricas del módulo analítico

<!-- Copiar la tabla consolidada de MSE/R²/r por dimensión sobre
     los tres bloques (english_only, latinoamericano_only,
     combined) desde ml/eval_metrics.json. Incluir el commit hash
     usado para reproducir las métricas. -->

## Anexo I — Screenshots clave del producto

<!-- 5-8 screenshots del dashboard, onboarding, chat, y narrativa en
     su estado final. Capturados con Playwright contra el dev server.
     Preferir vista desktop y mobile. -->

## Anexo J — Diff de commits de desarrollo

<!-- Lista de commits hash + mensaje corto en orden cronológico desde
     el kick-off del TFG hasta la entrega. Se genera con:

     git log --oneline --reverse --format="%h %s"

     Muestra el proceso incremental de desarrollo y es evidencia directa
     de la disciplina de ingeniería. -->
