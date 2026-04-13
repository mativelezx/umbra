# Umbra — Reglas del Proyecto

## Qué es Umbra
Plataforma web de autoconocimiento que triangula Jung (funciones cognitivas) + Big Five (OCEAN) + Positive Computing.
TFG de Ingeniería en Software — Universidad Siglo 21.

## Documento maestro
**UMBRA_MASTER_BUILD.md** en la raíz del proyecto contiene: arquitectura completa, tipos, schema SQL, prompts, knowledge base, design tokens y plan de ejecución por fases con QA checklists. LEELO antes de ejecutar cualquier fase.

## Stack
Next.js 14 (App Router) + TypeScript strict + Tailwind CSS 3.4 + Zustand 5 + Supabase (Auth + PostgreSQL + RLS) + Anthropic API (Claude) + Recharts + @phosphor-icons/react + Zod + html2pdf.js

## Design system
Archivo `umbra-design-system.html` en la raíz. Abrilo en browser para ver la referencia visual.
Tokens de diseño detallados en UMBRA_MASTER_BUILD.md sección 2.

## Convenciones de código

### Componentes
- React funcionales con hooks. PascalCase.
- Props tipadas con interface, nunca `any`.
- Un componente por archivo. Nombre del export = nombre del archivo.

### Archivos
- kebab-case para utilitarios, PascalCase para componentes.
- Imports con alias `@/*`.

### Tipos
- CENTRALIZADOS en `types/index.ts`. Nunca definir tipos inline.

### Prompts IA
- SIEMPRE en `lib/prompts/` con interface tipada.
- NUNCA prompts inline en API routes o componentes.
- Los prompts importan knowledge blocks de `lib/knowledge/`.

### Knowledge Base
- `lib/knowledge/` contiene la base teórica (Big Five, Jung, Arquetipos, Positive Computing).
- Cada archivo exporta un helper `*KnowledgeBlock()` que los prompts inyectan.
- Los `/* COMPLETAR */` se llenan con datos de investigación. No inventar.

### Estado
- Zustand en `lib/store/`. Un store por dominio (profile, onboarding, chat).
- No usar React Context para estado global — solo para providers (auth, theme).

### API Routes
- Edge runtime para routes que llaman a Claude.
- SIEMPRE validar input con Zod.
- SIEMPRE try/catch con respuestas de error tipadas.

### Estilos
- Tailwind utility-first. Tokens custom en tailwind.config.ts.
- Glass effects en globals.css.
- Fuentes: font-display (Instrument Serif), font-heading (Space Grotesk), font-body (Inter), font-mono (JetBrains Mono).
- Iconos: @phosphor-icons/react. NUNCA emoji.

## Seguridad
- NUNCA exponer ANTHROPIC_API_KEY en el cliente.
- SIEMPRE RLS en Supabase. Cada tabla DEBE tener policies.
- SIEMPRE validar input con Zod antes de enviar a Claude.

## Prohibiciones
- NO usar MBTI. Usamos funciones cognitivas de Jung directamente.
- NO usar lenguaje diagnóstico ni clínico en prompts ni UI.
- NO dejar console.log en producción.
- NO usar `any` en TypeScript.
- NO crear prompts inline.
- NO usar emoji en UI.

## QA por fase
Después de completar cada fase del UMBRA_MASTER_BUILD.md, ejecutar:
```bash
npx tsc --noEmit
npm run build
grep -r "console.log" app/ components/ lib/ --include="*.tsx" --include="*.ts" | grep -v node_modules
grep -r ": any" app/ components/ lib/ types/ --include="*.tsx" --include="*.ts"
```
