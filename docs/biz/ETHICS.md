# Umbra — Ethics Review

> Marco ético del proyecto: principios de Declaración de Helsinki
> aplicados al diseño y a la validación con usuarios, principios de
> Positive Computing (Calvo & Peters 2014) que regulan la voz del
> producto, líneas rojas explícitas y disclosure de conflicto de
> interés para la tesis.

## Por qué importa

Umbra procesa texto introspectivo sobre experiencia personal y emocional
de usuarios reales. Aún sin pretensión clínica, el sistema recibe
contenido sensible y debe diseñarse y validarse asumiendo esa
sensibilidad. Las decisiones éticas se toman antes del código y se
documentan con la misma disciplina que las decisiones arquitectónicas.

## Principios éticos aplicables

### Declaración de Helsinki (research ethics)

- **Beneficencia**: Umbra busca beneficiar al usuario aportando una
  lectura útil de sí mismo; no extrae valor a costa del usuario.
- **No maleficencia**: guardrails de crisis, disclaimer "no es
  terapia", clasificador fail-closed, líneas de ayuda visibles.
- **Autonomía**: consentimiento informado con mecanismo de retiro
  (cancelación con magic link); opt-in explícito para investigación.
- **Justicia**: acceso gratuito al producto, accesibilidad a11y
  verificada con axe-core en CI, español latinoamericano nativo.

### Positive Computing (Calvo & Peters 2014)

Umbra está construido **sobre** estos principios, no solo informado
por ellos:

- **Autonomía**: el usuario controla sus datos, puede borrar en
  cualquier momento, opta o no por investigación.
- **Competencia**: el perfil ayuda al usuario a entender sus patrones,
  no a patologizarlos.
- **Relación**: el chat se siente como un espejo, no como una
  autoridad.
- **Atención plena**: no hay dark patterns, ni streaks, ni
  gamificación.
- **Emoción positiva**: la narrativa es reflexiva y cálida, no
  clínica.
- **Engagement**: profundidad sobre amplitud, calidad sobre cantidad.
- **Resiliencia**: el plan de desarrollo enfoca crecimiento, no
  arreglar déficits.
- **Autocompasión**: no hay lenguaje vergonzante ni "tu debilidad
  es...".

El bloque de conocimiento `lib/knowledge/positive-computing.ts`
codifica estos ocho factores como reglas de "hacer" y "no hacer" que
el system prompt del chat referencia.

## Líneas rojas explícitas (Umbra NUNCA)

1. Usa el producto para identificar individuos más allá de su consentimiento.
2. Vende, alquila o comparte datos de usuarios con terceros con fines comerciales.
3. Expone datos individuales en la tesis (solo agregados, solo con opt-in).
4. Usa el chat para extraer más datos de los necesarios para la experiencia.
5. Agrega advertising, tracking pixels o behavioral analytics más allá de los defaults de Vercel.
6. Almacena el contenido de eventos de crisis (solo hashes salteados, ADR-008).
7. Hace afirmaciones clínicas ("vos tenés depresión").
8. Diagnostica, prescribe o recomienda intervenciones médicas.
9. Reemplaza terapia profesional; siempre dirige a recursos humanos en crisis.
10. Usa dark patterns para impedir el borrado de cuenta.

## Validación con usuarios (SUS en TP3/TP4)

Las sesiones SUS planificadas para TP3/TP4 (n=8-15, materiales en
`docs/research/`) son **usability testing**, no investigación clínica.
Las salvaguardas son:

- **Consentimiento informado** firmado antes de cada sesión, con
  texto verbatim disponible en `content/consent/research-m3-v1-es-AR.md`.
- **Voluntariedad** — el participante puede retirarse en cualquier
  momento; las grabaciones se borran a su pedido.
- **Anonimización** — las transcripciones se anonimizan (P1, P2…)
  antes de cualquier análisis o cita en la tesis.
- **Retención acotada** — grabaciones en carpeta privada fuera del
  repo; borrado a los 7 años post-defensa.
- **Riesgo mínimo** — el ejercicio es interactuar con un producto web
  consumer, no una intervención clínica.
- **Protocolo si surge malestar** — pausar, ofrecer terminar la
  sesión, entregar recursos de ayuda (135, 911, Salud Mental
  Responde, Centros de Salud Mental Comunitaria).
- **Conflicto de interés declarado** — el autor es desarrollador y, en
  la práctica, tiene relación previa con varios participantes
  potenciales. Se declara en la tesis y en el consentimiento.

## Pseudonimización del research dataset

Si el research opt-in está activado, los datos se pseudonimizan vía
HMAC con pepper versionado (ADR-013, ADR-021). El consentimiento
declara honestamente que la pseudonimización es reversible por quien
tenga acceso al pepper, y que los datos pueden ser borrados a pedido
del usuario.

## Conflict of interest disclosure (para la tesis)

> "El autor desarrolló Umbra como artefacto de software y como
> instrumento de la presente investigación. Las métricas reportadas
> (MSE, R², r por dimensión Big Five) se calculan sobre el split test
> definido determinísticamente en `ml/src/prepare_data.py`, y los
> artefactos serializados se commiteanen `ml/models/` junto con el
> commit hash usado para reproducir las métricas, con el objetivo de
> mitigar grados de libertad del investigador."

## Referencias

- [Declaración de Helsinki (WMA)](https://www.wma.net/policies-post/wma-declaration-of-helsinki-ethical-principles-for-medical-research-involving-human-subjects/)
- Calvo, R. A., & Peters, D. (2014). *Positive Computing*. MIT Press.
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory.
- [features/RESEARCH_MODE.md](../features/RESEARCH_MODE.md)
- [biz/LEGAL.md](LEGAL.md)
- [biz/TFG.md](TFG.md)
- [biz/VALIDATION.md](VALIDATION.md)
