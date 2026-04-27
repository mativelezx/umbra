# Umbra — defense and TP2-TP4 readiness

Estado de cierre del prototipo TP1 y base para TP2-TP4.

## Tesis central defendible

Umbra es un prototipo tecnológico de transformación digital para
autoconocimiento narrativo. No diagnostica, no reemplaza terapia y no
afirma validez psicométrica clínica. Integra:

- una capa analítica propia para Big Five con métricas y estado de
  confianza por dimensión;
- una capa narrativa con Claude para interpretación cuidadosa en español
  latinoamericano;
- consentimiento, exportación, opt-out de investigación y borrado de
  cuenta alineados con Ley 25.326;
- safety conversacional con clasificación de crisis y recursos de ayuda.

## Coherencia con TP1

- Big Five medido: IPIP-NEO / Big Five de dominio público, no NEO-PI-R
  propietario.
- Jung y Pearson: lectura narrativa/heurística, no medición automática.
- Positive Computing: criterio de diseño y límites de lenguaje.
- ML propio: DistilBERT congelado + Ridge, servido por FastAPI.
- LLM externo: generación narrativa, chat, plan y explicación.
- Datos sensibles: consentimiento expreso, hash de texto consentido,
  exportación y borrado.
- Validación: unit, E2E, axe, build productivo, RLS coverage, ML metrics.

## Riesgos mitigados

- **Accesibilidad**: contraste y links inline corregidos; axe E2E sin
  violaciones críticas/serias en las rutas cubiertas.
- **BBDD**: migraciones cubren 15 tablas usadas por la app; todas con RLS;
  service-role-only explícito para tablas sensibles.
- **Borrado de cuenta**: orden de cascada corregido para respetar FK entre
  `development_plans` y `psychological_profiles`.
- **ML**: Essays integrado; regresión y clasificación binaria reportadas
  por separado; dimensiones bajo umbral quedan `low_confidence`.
- **Seguridad npm**: vulnerabilidades críticas removidas; highs restantes
  requieren migración mayor Next/Vitest documentada.
- **E2E live**: flujos dependientes de Supabase/ML/Anthropic quedan opt-in
  con `E2E_REAL_FLOW=true`.

## TP2-TP4 recomendados

### TP2 — Validación técnica y datos

- Ampliar corpus es-AR a n>=300 con consentimiento e IPIP/BFI breve.
- Agregar PAN 2015 como validación de transferencia si licencia/acceso
  quedan verificados.
- Separar métricas continuas y binarias en la presentación.
- Cerrar suite E2E live reproducible con Supabase local + ML local.

### TP3 — Validación con usuarios

- Ejecutar protocolo SUS/UMUX-Lite/METUX/CUQ.
- Recolectar evidencia cualitativa anonimizada.
- Medir claridad de límites: "no es terapia", privacidad, confianza,
  utilidad percibida.
- Ajustar UX según hallazgos.

### TP4 — Defensa y producción controlada

- Deploy estable en Vercel.
- ML API local o Render/Fly con `ML_API_URL` configurado.
- Demo guionada con datos de prueba.
- Plan de contingencia: screenshots, export JSON/PDF, video corto del
  flujo completo.
- Migración mayor opcional para `npm audit --audit-level=high` limpio.

## Frase de defensa

> Umbra no pretende diagnosticar personalidad. Es un sistema de
> autoconocimiento asistido que separa medición, interpretación y cuidado:
> cuando una dimensión no alcanza umbral, el sistema la marca como baja
> confianza y evita presentarla como evidencia cuantitativa fuerte.

