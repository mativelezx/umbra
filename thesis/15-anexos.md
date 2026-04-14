# Anexos

<!-- Los anexos contienen material referencial que no corta el flujo
     de lectura del cuerpo principal pero que el tribunal puede querer
     inspeccionar. Cada anexo se pega verbatim desde su fuente en el
     repo para que no haya drift entre el documento y el código. -->

## Anexo A — ADRs seleccionadas (5 principales)

<!-- Copiar verbatim desde docs/DECISIONS.md. Las 5 más representativas:

     - ADR-002: Jung directo, no MBTI
     - ADR-008: crisis_events observability con salted hashes
     - ADR-014: committed cache snapshots + pinned SKU
     - ADR-023: validación mixed-methods Branch B + M3
     - ADR-025: aplicación de heurísticas PAIR

     Incluir los 25 ADRs completos como Anexo A1 en un archivo aparte
     si el TFG permite PDFs adjuntos. -->

## Anexo B — Texto de consentimiento informado

<!-- Copiar verbatim content/consent/v1-es-AR.md (consentimiento del
     producto) y content/consent/research-m3-v1-es-AR.md (consentimiento
     específico del estudio M3). -->

## Anexo C — Dataset de crisis etiquetado (extracto)

<!-- Copiar un subset representativo del lib/evals/crisis-dataset.ts
     — NO los 100 casos por ética (evitar que el dataset completo se
     indexe en buscadores), solo 5 por categoría como ejemplo. El
     dataset completo queda en el repo con nota ética. -->

## Anexo D — Corpus H1/H2 (extracto)

<!-- Copiar 3-5 casos representativos de lib/evals/cases.ts como
     ejemplo del formato. El corpus completo queda en el repo. -->

## Anexo E — Protocolo de sesión M3

<!-- Copiar verbatim docs/research/M3-session-protocol.md -->

## Anexo F — SUS en español rioplatense

<!-- Copiar verbatim docs/research/sus-spanish-rioplatense.md -->

## Anexo G — OSF preregistration

<!-- Incluir (a) el texto completo del preregistro, (b) el DOI obtenido
     al submit, (c) la fecha. Si el preregistro vive online solo,
     linkearlo con QR code para la versión impresa. -->

## Anexo H — Screenshots clave del producto

<!-- 5-8 screenshots del dashboard, onboarding, chat, y narrativa en
     su estado final. Capturados con Playwright contra el dev server.
     Preferir vista desktop (mostrar el sticky TOC) y mobile (mostrar
     el stack responsive). -->

## Anexo I — Eval results (H1/H2/H3) y cache snapshots

<!-- Referencia al directorio eval-results/ en el commit hash publicado.
     No pegar el JSON completo en el anexo — solo tablas resumen que
     ya aparecieron en el capítulo 08. -->

## Anexo J — Diff de commits de desarrollo

<!-- Lista de commits hash + mensaje corto en orden cronológico desde
     el kick-off del TFG hasta la entrega. Se genera con:

     git log --oneline --reverse --format="%h %s"

     Muestra el proceso incremental de desarrollo y es evidencia directa
     de la disciplina de ingeniería. -->
