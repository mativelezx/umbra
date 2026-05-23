# Workflow: Prompt Change

1. Identify prompt tier and user-facing risk.
2. Research model/provider changes if relevant.
3. Update co-located schemas and `_promptVersion`.
4. Sanitize all untrusted inputs.
5. Validate model output with Zod before use.
6. Add eval/regression fixture for high-risk prompts.
7. Run tests and document behavior change.
