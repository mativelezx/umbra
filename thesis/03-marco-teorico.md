# Marco teórico

<!-- FUENTE PRIMARIA: lib/knowledge/big-five.ts, lib/knowledge/jung-functions.ts,
     lib/knowledge/archetypes.ts, lib/knowledge/positive-computing.ts,
     docs/biz/ETHICS.md.

     Cada archivo del knowledge base tiene JSDoc con @source, @reference,
     @page_or_section, @verbatim (ADR-018). Extraer esas citas y darles
     formato APA 7th en el capítulo. -->

## Big Five / OCEAN (IPIP-NEO)

<!-- FUENTE: lib/knowledge/big-five.ts + Goldberg (1999). -->

Origen: Costa & McCrae (1992) NEO-PI-R, luego Goldberg (1999) IPIP-NEO
(dominio público). Umbra usa IPIP-NEO por motivos de licencia (ADR-015).

Las cinco dimensiones:

- **Apertura a la experiencia** (openness)
- **Responsabilidad** (conscientiousness)
- **Extraversión** (extraversion)
- **Amabilidad** (agreeableness)
- **Neuroticismo** (neuroticism)

<!-- PENDIENTE: expandir con definición operacional de cada facet que
     usa Umbra, citando Goldberg. -->

## Funciones cognitivas de Jung

<!-- FUENTE: lib/knowledge/jung-functions.ts + Jung (1921) + Sauer (2020). -->

Umbra usa las 8 funciones directamente (Se, Si, Ne, Ni, Te, Ti, Fe, Fi)
**no** vía MBTI. La decisión está documentada en ADR-002 y se
fundamenta en Sauer (2020) "Rehabilitating Jung's Cognitive Function
Theory" que enmarca las funciones como la arquitectura cognitiva que
genera los rasgos conductuales del Big Five.

<!-- PENDIENTE: expandir cada función con definición operacional. -->

## Arquetipos aplicados (Pearson)

<!-- FUENTE: lib/knowledge/archetypes.ts + Pearson (1991). -->

Umbra usa el sistema de 6 arquetipos de Carol Pearson (*Awakening the
Heroes Within*, 1991): Hero, Sage, Explorer, Creator, Caregiver, Rebel.
La elección vs los arquetipos estructurales de Jung (Anima, Shadow, Self)
está documentada en ADR-007.

## Positive Computing

<!-- FUENTE: lib/knowledge/positive-computing.ts + Calvo & Peters (2014). -->

Calvo & Peters (2014) proponen que la tecnología puede activamente
promover el bienestar en vez de solo evitar daño. Umbra implementa los
principios operativos como do/don't rules en el system prompt del chat:

- **Autonomía**
- **Competencia**
- **Relación**
- **Mindfulness**
- **Emoción positiva**
- **Engagement**
- **Resiliencia**
- **Autocompasión**

## Metodología computacional (H1/H2)

<!-- FUENTE: docs/biz/VALIDATION.md + ADR-011 + ADR-014. -->

El modelo como instrumento: marco de evaluación donde un LLM actúa como
instrumento estocástico y los eval cases son estímulos fijos. Este
framing se usa para justificar la elección del OSF Standard Preregistration
en vez del secondary-data o human-subjects template (ADR-012).

## Referencias del capítulo

<!-- Auto-generadas desde 14-referencias.bib vía Pandoc + APA CSL. -->
