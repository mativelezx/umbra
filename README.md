# Umbra

Plataforma de autoconocimiento basada en Jung + Big Five + Positive Computing.

## Setup rápido

```bash
# 1. Crear el proyecto Next.js (desde la carpeta padre)
cd ~/Desktop
npx create-next-app@14 umbra-app --typescript --tailwind --app --src-dir=false --import-alias="@/*"

# 2. Mover los archivos de config a la app
cp Umbra/UMBRA_MASTER_BUILD.md umbra-app/
cp Umbra/umbra-design-system.html umbra-app/
cp -r Umbra/.claude umbra-app/
cp -r Umbra/docs umbra-app/
cp -r Umbra/lib umbra-app/

# 3. Entrar y instalar deps
cd umbra-app
npm install zustand @supabase/supabase-js @supabase/auth-helpers-nextjs @anthropic-ai/sdk recharts zod html2pdf.js @phosphor-icons/react

# 4. Configurar .env.local con tus keys
# (ver UMBRA_MASTER_BUILD.md sección 0.4)

# 5. Abrir en VS Code
code .

# 6. En el terminal de VS Code, abrir Claude Code y decirle:
# "Leé UMBRA_MASTER_BUILD.md y ejecutá la Fase 1"
```

## Archivos clave

| Archivo | Qué es |
|---------|--------|
| `UMBRA_MASTER_BUILD.md` | Plan maestro completo — Claude Code lo lee para ejecutar |
| `.claude/CLAUDE.md` | Reglas del proyecto — Claude Code lo lee automáticamente |
| `umbra-design-system.html` | Design system visual — abrir en browser |

## Stack

Next.js 14 · TypeScript · Tailwind · Zustand · Supabase · Anthropic API · Recharts · Phosphor Icons
