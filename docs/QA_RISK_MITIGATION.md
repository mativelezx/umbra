# Umbra — QA risk mitigation plan

Este documento convierte los riesgos residuales del QA fullstack en
controles verificables para TP2-TP4 y defensa oral.

## 1. pnpm audit high/moderate

Estado actual:

- Vulnerabilidades criticas removidas con `html2pdf.js@0.14.0`.
- Persisten high/moderate que pnpm reporta con migraciones mayores:
  `next@16`, `eslint-config-next@16`, `vitest@4`.

Mitigacion total:

1. Crear rama `hardening/next16-vitest4`.
2. Subir Node runtime a `>=20.9`.
3. Migrar:
   - `next` y `eslint-config-next`;
   - ESLint 8 -> 9;
   - Vitest 2 -> 4 y `@vitest/ui` compatible.
4. Ejecutar gates:
   - `pnpm audit --audit-level=high`;
   - `pnpm typecheck`;
   - `pnpm lint`;
   - `pnpm test`;
   - `pnpm build`;
   - `pnpm test:e2e`.

Criterio de cierre:

- `pnpm audit --audit-level=high` sale 0.
- Todas las suites pasan sin cambios de comportamiento.

## 2. E2E live flows

Estado actual:

- Suite deterministica pasa.
- Flujos reales largos quedan opt-in con `E2E_REAL_FLOW=true` porque
  requieren Supabase, ML API y Anthropic vivos.

Mitigacion total:

1. Levantar Supabase local via CLI.
2. Seedear usuario confirmado con Admin API o desactivar confirmacion de
   email solo en entorno local.
3. Levantar ML API local en `localhost:8000`.
4. Usar claves Anthropic/Resend de entorno controlado.
5. Ejecutar:

```bash
E2E_REAL_FLOW=true pnpm test:e2e -- --project=chromium
```

Criterio de cierre:

- Los flows register -> consent -> onboarding -> dashboard -> narrative
  -> plan pasan en entorno local reproducible.
- La suite sin `E2E_REAL_FLOW` sigue pasando en CI sin dependencias
  externas.

## 3. ML thresholds y datasets

Estado actual:

- Essays esta integrado y aporta `n=2467`.
- La version abierta de Essays tiene etiquetas binarias 0/1 por rasgo,
  normalizadas a 0/100.
- La regresion continua queda bajo umbral; la evaluacion binaria ya
  reporta AUC/F1/balanced accuracy cuando corresponde.
- Corpus es-AR actual es demasiado chico para validacion estadistica.

Mitigacion total:

1. Mantener regresion con R2/r solo para datasets con score continuo.
2. Usar AUC/F1/balanced accuracy para datasets binarios como Essays.
3. Agregar PAN 2015 como transferencia multilingue si licencia/acceso
   queda verificado.
4. Ampliar corpus propio es-AR:
   - minimo 300 casos;
   - ideal 500-1000;
   - consentimiento versionado;
   - texto introspectivo + IPIP/BFI breve;
   - particion por usuario.

Criterio de cierre:

- `ml/eval_metrics.json` distingue regresion vs binario.
- `check_eval_thresholds.py` no permite incoherencias entre metricas y
  `per_dimension_status`.
- Ninguna dimension bajo umbral se presenta como medicion cuantitativa
  fuerte en la app ni en la tesis.

