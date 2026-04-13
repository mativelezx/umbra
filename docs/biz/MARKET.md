# Umbra — Market & Positioning

## The landscape (as of 2026)

Personality / self-knowledge apps are a crowded category. The competitive map
falls into three tiers:

### Tier 1 — Incumbents (hundreds of millions of users)
- **16personalities** — free MBTI-style test with identity descriptors. Dominant on SEO. Avatars and pop-psych framing. NOT Jung, despite claiming otherwise — uses MBTI.
- **Truity** — multi-test platform (TypeFinder, Big Five, Enneagram, Holland). Freemium. Academic-ish positioning.

### Tier 2 — AI-augmented entrants (2024-2026 wave)
- **Deep Personality** — 28 assessments in one experience. 50+ page AI-generated report. $19 one-time purchase. Big Five + HEXACO + PID-5-SF + Attachment + Dark Triad + clinical screens. Dominant "depth" positioning.
- **Depth Profile** — 9 research-backed assessments unified into one profile.
- **Know Me AI** — 7 assessments + generates custom AI instructions tuned to your personality.
- **Apt AI** — MBTI + Big Five + Enneagram with ML.
- **BigFiveLab** — dedicated Big Five with AI interpretation.
- **Freudly** — Big Five with AI-powered personality analysis.

### Tier 3 — Niche / specialty
- **Understand Myself** (Jordan Peterson) — Big Five deep dive. English only. Conservative positioning.
- **Traitify** — image-based personality tests. Employer use case.

## Where Umbra fits

Umbra is NOT trying to compete on breadth (number of assessments) or price
($19 one-time is hard to beat). Umbra differentiates on three axes:

### 1. Language + voice
- Spanish **rioplatense** (voseo, vocabulario argentino, no castellano neutro)
- No existing product in the landscape has native rioplatense output
- The narrative tone is reflective, warm, cálido — not clinical, not gamified

### 2. Academic rigor (verifiable)
- **Knowledge base is real** — sourced from IPIP-NEO, Jung (1921), Pearson, Calvo & Peters, with enforced citation comments
- **Eval suite is runnable** — anyone can clone the repo and reproduce H1 / H2 numbers against a committed cache snapshot
- **Paper preregistered on OSF** — hypotheses, metrics, analysis plan all timestamped before data collection
- The competition makes academic claims but nobody ships the receipts. Umbra ships the receipts.

### 3. Ethical posture (regulatory defensive)
- Permanent "no es terapia" banner with crisis routing to 135 / 911 / SOS
- Classifier with fail-closed safety semantics
- Ley 25.326 compliance with full data rights endpoints
- Pseudonymized research dataset with honest disclosure (not "anonymous" theater)
- Most AI therapy / self-knowledge chatbots are currently under regulatory scrutiny. Umbra is built to withstand that scrutiny.

## Differentiation matrix

| Feature | Umbra | 16personalities | Deep Personality | Know Me AI |
|---|---|---|---|---|
| Spanish rioplatense | ✓ | ✗ (castellano neutro) | ✗ | ✗ |
| Jung functions direct | ✓ | ✗ (MBTI-flavored) | ✗ | ✗ |
| Public academic sources | ✓ | ✗ | partial | ✗ |
| Preregistered paper | ✓ | ✗ | ✗ | ✗ |
| Crisis safety guardrails | ✓ (full) | n/a | ✗ | ✗ |
| Data rights compliant | ✓ (Ley 25.326) | GDPR | GDPR | unclear |
| Chat with profile context | ✓ | ✗ | ✗ | ✓ (custom AI instructions) |
| Evidence highlights | ✓ | ✗ | ✗ | ✗ |
| Open-source eval suite | ✓ | ✗ | ✗ | ✗ |
| Free | ✓ (MVP) | ✓ + paid reports | ✗ ($19) | ✓ + paid |

## Target user personas

### Primary — Ana, 28, UBA psicología grad
- Works in HR, interested in self-knowledge tools she can recommend
- Skeptical of MBTI ("es pseudociencia") but curious about Jung functions
- Reads Medium articles on Big Five, follows psych podcasts
- Wants depth, not gamification
- Lives in Buenos Aires, speaks voseo natively
- Values: academic rigor, emotional honesty, open source

### Secondary — Mateo, 35, software engineer
- Has tried 16personalities and found it shallow
- Curious about personal development but allergic to "wellness" branding
- Wants something instrumented — wants to see the reasoning
- Technical enough to appreciate the eval suite and preregistration
- Lives in Córdoba, works remote

### Tertiary — TFG advisor / tribunal
- Academic reviewer evaluating Umbra as thesis artifact
- Needs: clear methodology, verifiable claims, citation discipline, rigorous evaluation
- Expected outcome: thesis passes with distinction because rigor is not performative

## Monetization (out of TFG scope, documented for v2)

- **v1 (TFG)**: free, single-user, no payments
- **v1.5 (post-TFG if user demand)**: optional $5/month "extended" tier with longitudinal tracking (30/90/180 day re-analysis + narrative update)
- **v2.0 (platform)**: let researchers upload their own `lib/knowledge/*.ts` and run evals on their own data. Research collaboration mode.

No ads. No data selling. Consent form explicitly prohibits these.

## Competitive risks

1. **Deep Personality adds Spanish** — high likelihood, low timeline. They have the resources and Spanish is the #2 market globally.
2. **Regulatory crackdown on AI self-knowledge apps** — real risk. Umbra's safety posture is defensive against this.
3. **Claude pricing changes** — ADR-005 + ADR-014 pin model SKU. If pricing jumps, cost model breaks — mitigation is pre-committed `GLOBAL_DAILY_BUDGET_USD` cap.
4. **Academic rejection of "model as instrument" framing** — codex finding 6. Documented as acknowledged cathedral risk. Fallback: defend as SW engineering thesis (eval + methodology + code quality).

## Growth strategy (post-v1)

- **Organic SEO**: Spanish personality content (blog posts on Jung functions, Big Five in Argentine context) — future work.
- **Word of mouth in psych/academic Twitter/X** — the preregistered paper is the hook.
- **Reddit r/psicologia and r/spanish selfimprovement subreddits**
- **og:image social share** (deferred in TODOS.md, P2) — unlocks Instagram/X growth loop.

## References

- Sauer (2025) "Rehabilitating Jung's Cognitive Function Theory" — academic trend backing direct-Jung approach
- Stein (2019) "Evaluating MBTI validity" — the critique Umbra sides with
- Goldberg (1999) IPIP — public domain Big Five instrument
- [biz/TFG.md](TFG.md) — thesis deliverables
- [biz/ETHICS.md](ETHICS.md) — ethics review path
- [biz/LEGAL.md](LEGAL.md) — compliance
