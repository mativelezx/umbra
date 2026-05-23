# AI Risk Register

This register keeps agentic AI risk visible for this project and for future projects cloned from this structure.

| Risk                                           | Impact                                                            | Default control                                                                       | Evidence                          |
| ---------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------- |
| Prompt injection from user or external content | Unsafe actions, data leakage, wrong outputs                       | Zod, normalization, `sanitizePromptInput(s)`, output schema validation, size limits   | API tests and prompt eval case    |
| Tool overreach                                 | MCP/shell performs unintended read/write/mutation                 | MCP registry, approval gates, least privilege, local vs production distinction        | Tool-risk review note             |
| Hallucinated research                          | Bad product, legal, vendor, or technical decision                 | Research skill, source links, date, credibility, what changed                         | Research transcript/summary       |
| Skill supply-chain compromise                  | Malicious or stale skill changes agent behavior                   | Core/reference/quarantine/deprecated registry, provenance check, no unaudited scripts | Skill registry diff and evals     |
| Agent drift                                    | Future model follows stale instructions or wrong hierarchy        | Authority order in `AGENT_OS.md`, eval cases, short skills                            | Agent eval result                 |
| Hidden business assumption                     | Founder ships the wrong bet efficiently                           | `premortem`, founder-ops review, success metric                                       | Premortem report or decision note |
| Customer data exposure                         | PII/secrets copied to logs, prompts, MCPs, or docs                | No secrets in repo, summarize sensitive logs, approval before customer data to MCP    | Security review note              |
| Model/provider change                          | API behavior, cost, rate limit, or policy changes break workflows | Current docs research before model/provider decisions                                 | Research source links             |
| Cost/latency runaway                           | AI feature becomes financially or operationally brittle           | Budget notes for AI routes, degraded fallback, mock mode                              | API map/docs and tests            |
| Design copying                                 | Reference tools turn into asset or pattern cloning                | Use references for patterns only, never proprietary assets/copy                       | Design review note                |

## Rule

Every important AI, MCP, prompt, or automation change must name the top risk it increases and the control that keeps it acceptable.
