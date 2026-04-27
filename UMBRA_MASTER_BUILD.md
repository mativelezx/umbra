# UMBRA — Master Build Document

> **Qué es esto**: La fuente de verdad de la fase de construcción inicial (scaffolding, autenticación, consentimiento, onboarding, dashboard, chat con guardrails, plan, export). Describe la arquitectura web, los tipos, el schema SQL, los prompts y los design tokens.
>
> Para el estado actual del proyecto y las decisiones posteriores, complementar con:
>
> - **[`docs/biz/IMPLEMENTATION_PLAN.md`](docs/biz/IMPLEMENTATION_PLAN.md)** — plan operativo con QA gate y timeline
> - **[`docs/biz/VALIDATION.md`](docs/biz/VALIDATION.md)** — plan de validación (métricas ML por dimensión, unit, E2E, axe, SUS)
> - **[`docs/biz/TFG.md`](docs/biz/TFG.md)** — estructura de tesis y cronograma
> - **[`docs/DECISIONS.md`](docs/DECISIONS.md)** — Architecture Decision Records
> - **[`docs/features/*.md`](docs/features/)** — feature specs detallados
> - **[`README.md`](README.md)** — entry point con setup y arquitectura híbrida
> - **[`thesis/`](thesis/)** — esqueleto de tesis con 16 capítulos
> - **[`ml/`](ml/)** — módulo analítico propio (DistilBERT + Ridge + MLflow + DVC + FastAPI)
>
> Este documento describe el frontend Next.js. La capa cuantitativa Big Five se inferencia en el módulo analítico propio en `ml/` (ADR-026); este documento se concentra en el resto del sistema. La defensa académica se apoya en métricas reproducibles del módulo ML, axe-core en CI, unit + E2E con Vitest y Playwright, y SUS adaptado al español latinoamericano (Brooke 1996) planificado para TP3/TP4 con n=8-15 participantes.
>
> **Ubicación del proyecto**: `~/Desktop/Umbra`

---

## 0. SETUP INICIAL

### 0.1 Pre-requisitos (el developer hace esto manualmente)

```
1. Crear proyecto en Supabase → copiar SUPABASE_URL + SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY
2. Obtener ANTHROPIC_API_KEY desde console.anthropic.com (key nueva, separada de younic)
3. Tener Node.js 18+ y npm instalados
4. Tener Git configurado
```

### 0.2 Primer comando en terminal VS Code

```bash
cd ~/Desktop
npx create-next-app@14 Umbra --typescript --tailwind --app --src-dir=false --import-alias="@/*"
cd Umbra
git init
```

### 0.3 Dependencias

```bash
npm install zustand @supabase/supabase-js @supabase/auth-helpers-nextjs @anthropic-ai/sdk recharts zod html2pdf.js @phosphor-icons/react
npm install -D @types/node
```

### 0.4 .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=<tu-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
ANTHROPIC_API_KEY=<tu-anthropic-api-key>
```

### 0.5 .gitignore (agregar)

```
.env.local
.env*.local
```

---

## 1. ARQUITECTURA

### 1.1 Visión del Producto

Plataforma web de autoconocimiento que triangula psicología junguiana (8 funciones cognitivas), Big Five (OCEAN) y Positive Computing para generar perfiles profundos, narrativas personalizadas y planes de desarrollo — impulsado por Claude API.

**User Journey**: Registrarse → Onboarding (guiado o texto libre) → Análisis IA → Dashboard con perfil → Narrativa personalizada → Chat contextualizado → Plan de desarrollo → Export PDF

### 1.2 Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | strict mode |
| Estilos | Tailwind CSS | 3.4 |
| Iconos | Phosphor Icons | @phosphor-icons/react |
| State | Zustand | 5.x |
| Backend | Supabase (Auth + PostgreSQL + RLS) | latest |
| IA | Anthropic API (Claude) | claude-sonnet-4-20250514 |
| Charts | Recharts | latest |
| PDF | html2pdf.js | latest |
| Validación | Zod | latest |
| Deploy | Vercel | — |

### 1.3 Fuentes teóricas y knowledge base

> **CRÍTICO**: Umbra no usa el conocimiento general de Claude para analizar. Usa una knowledge base estructurada derivada de fuentes académicas. Esto garantiza rigor, trazabilidad y consistencia.

**Modelo de funciones cognitivas**: Jung directo — *Tipos Psicológicos* (1921). Las 8 funciones como actitudes de la consciencia (Se, Si, Ne, Ni, Te, Ti, Fe, Fi).

**Big Five**: IPIP-NEO / Big Five de dominio público (Goldberg, 1999), no NEO-PI-R propietario. 5 factores × 6 facetas equivalentes para uso académico y repositorio abierto.

**Arquetipos**: Definidos según la fuente que el developer elija en su investigación (Jung estructurales o Pearson aplicados). La estructura del código soporta ambos.

**Positive Computing**: Calvo & Peters (2014). Principios de bienestar digital aplicados a la interacción.

**Cómo se alimenta**: El developer investiga en NotebookLM, extrae la información y la estructura en archivos TypeScript en `lib/knowledge/`. Los prompts de IA inyectan automáticamente esta data.

### 1.4 Estructura de carpetas

```
Umbra/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout + providers
│   ├── globals.css                 # Tailwind + custom tokens
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── chat/
│   │   └── page.tsx
│   ├── plan/
│   │   └── page.tsx
│   ├── export/
│   │   └── page.tsx
│   └── api/
│       ├── analyze/route.ts
│       ├── narrative/route.ts
│       ├── chat/route.ts
│       ├── plan/route.ts
│       └── export/route.ts
│
├── components/
│   ├── ui/                         # Componentes base
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── GlassCard.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── DimensionBar.tsx
│   │   ├── ProgressDots.tsx
│   │   └── LoadingDimension.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── TabBar.tsx              # Mobile bottom nav
│   │   └── LayoutShell.tsx
│   ├── onboarding/
│   │   ├── ModeSelector.tsx
│   │   ├── GuidedFlow.tsx
│   │   ├── FreeTextInput.tsx
│   │   └── ProgressiveLoad.tsx
│   ├── dashboard/
│   │   ├── BigFiveRadar.tsx
│   │   ├── JungFunctions.tsx
│   │   ├── ArchetypeCard.tsx
│   │   └── NarrativeSection.tsx
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatThread.tsx
│   └── plan/
│       ├── DevelopmentArea.tsx
│       ├── ActionCard.tsx
│       └── MicroGoal.tsx
│
├── lib/
│   ├── knowledge/                  # Base teórica (extraída de NotebookLM)
│   │   ├── big-five.ts             # 5 factores + 30 facets + indicadores
│   │   ├── jung-functions.ts       # 8 funciones cognitivas + definiciones
│   │   ├── archetypes.ts           # Arquetipos + criterios de asignación
│   │   └── positive-computing.ts   # Principios y reglas de bienestar
│   ├── prompts/
│   │   ├── interpret-narrative.ts  # Pass 1.5: lectura interpretativa Jung + arquetipo a partir del Big Five medido por el módulo ML
│   │   ├── analyze-evidence.ts     # Pass 2: highlights de evidencia textual
│   │   ├── generate-narrative.ts
│   │   ├── chat-context.ts
│   │   └── development-plan.ts
│   ├── ml-client.ts                # Cliente HTTP del módulo analítico (lib → ml/)
│   ├── providers/
│   │   ├── auth-context.tsx
│   │   └── theme.tsx
│   ├── store/
│   │   ├── profile-store.ts
│   │   ├── onboarding-store.ts
│   │   └── chat-store.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── claude/
│   │   └── client.ts
│   └── utils.ts
│
├── types/
│   └── index.ts
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── docs/
│   ├── FEATURE_MAP.md
│   ├── API_MAP.md
│   └── DECISIONS.md
│
└── .claude/
    └── CLAUDE.md
```

---

## 2. DESIGN SYSTEM — Tokens de referencia

> Fuente: `umbra-design-system.html` v3 — Dirección SOMORA + Instrument Serif

### 2.1 Colores → Tailwind config

```javascript
// tailwind.config.ts — extend colors
const colors = {
  umbra: {
    void:       '#050510',
    abyss:      '#08081A',
    fog:        '#0C091A',
    deep:       '#0E0E2A',
    shadow:     '#16163A',
    mist:       '#1E1E4A',
    surface:    '#28285A',
    elevated:   '#32326A',
  },
  violet: {
    50:  '#F5ECFF',
    100: '#E8D5FF',
    200: '#D4B3FF',
    300: '#CEA7FF',
    400: '#B466FF',  // PRIMARY
    500: '#9B3FEB',
    600: '#7B2FCC',
    700: '#5A1FA6',
    800: '#3D1575',
    900: '#1E0A3A',
  },
  accent: {
    indigo:  '#6366F1',
    cyan:    '#06B6D4',
    emerald: '#10B981',
    amber:   '#F59E0B',
    rose:    '#F43F5E',
  },
  text: {
    1: '#F0ECFF',
    2: '#A8A0C8',
    3: '#8A82AE',
    4: '#7D75A3',
  }
}
```

### 2.2 Tipografía → Google Fonts + Tailwind

```
Display/Headings: Instrument Serif (serif) — @import google fonts
UI Labels:        Space Grotesk (sans-serif)
Body:             Inter (sans-serif) — ya viene con Next.js
Mono/Data:        JetBrains Mono (monospace)
```

```javascript
// tailwind.config.ts — extend fontFamily
fontFamily: {
  display: ['Instrument Serif', 'Georgia', 'serif'],
  heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
  body:    ['Inter', 'system-ui', 'sans-serif'],
  mono:    ['JetBrains Mono', 'monospace'],
}
```

### 2.3 Efectos

```css
/* Glass effect */
.glass {
  background: rgba(180, 102, 255, 0.04);
  border: 1px solid rgba(180, 102, 255, 0.10);
  backdrop-filter: blur(12px);
}
.glass:hover {
  background: rgba(180, 102, 255, 0.08);
  border-color: rgba(180, 102, 255, 0.20);
}

/* Glow card */
.card-glow {
  background: linear-gradient(135deg, rgba(180,102,255,0.06), rgba(99,102,241,0.03));
  border-color: rgba(180,102,255,0.18);
  box-shadow: 0 0 60px rgba(180,102,255,0.04);
}

/* Noise overlay — aplicar en body::before */
background-image: url("data:image/svg+xml,...fractalNoise...");
opacity: 0.03;

/* Gradient orbs — posicionar como absolutos en el layout */
radial-gradient(circle, rgba(180,102,255,0.12), transparent 65%);
filter: blur(80px);
```

### 2.4 Border Radius

```javascript
borderRadius: {
  sm:   '8px',
  md:   '14px',
  lg:   '20px',
  xl:   '28px',
  full: '9999px',
}
```

### 2.5 Iconos — Phosphor Icons

Librería: `@phosphor-icons/react`. Estilo: Regular.

Mapa de iconos del sistema:
| Contexto | Icono | Import |
|----------|-------|--------|
| Navegación home | House | `import { House } from "@phosphor-icons/react"` |
| Insights | Sparkle | `import { Sparkle } from "@phosphor-icons/react"` |
| Sesión/noche | MoonStars | `import { MoonStars } from "@phosphor-icons/react"` |
| Estadísticas | ChartBar | `import { ChartBar } from "@phosphor-icons/react"` |
| Perfil | User | `import { User } from "@phosphor-icons/react"` |
| Arquetipo | Compass | `import { Compass } from "@phosphor-icons/react"` |
| Chat | ChatCircle | `import { ChatCircle } from "@phosphor-icons/react"` |
| Cuestionario | NotePencil | `import { NotePencil } from "@phosphor-icons/react"` |
| Modo híbrido | Target | `import { Target } from "@phosphor-icons/react"` |
| Settings | Gear | `import { Gear } from "@phosphor-icons/react"` |
| Back nav | ArrowLeft | `import { ArrowLeft } from "@phosphor-icons/react"` |
| Send message | ArrowUp | `import { ArrowUp } from "@phosphor-icons/react"` |
| More options | DotsThree | `import { DotsThree } from "@phosphor-icons/react"` |
| Cerebro/mente | Brain | `import { Brain } from "@phosphor-icons/react"` |
| Visión | Eye | `import { Eye } from "@phosphor-icons/react"` |
| Energía | Lightning | `import { Lightning } from "@phosphor-icons/react"` |
| Camino | Path | `import { Path } from "@phosphor-icons/react"` |

---

## 3. TYPES — types/index.ts

```typescript
// ═══════════════════════════════════════
// UMBRA — Tipos centralizados
// ═══════════════════════════════════════

// ─── Big Five ───
export interface BigFive {
  openness: number;          // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// ─── Jung Cognitive Functions ───
export interface JungFunctions {
  Se: number; Si: number;    // Sensing (E/I)
  Ne: number; Ni: number;    // Intuition (E/I)
  Te: number; Ti: number;    // Thinking (E/I)
  Fe: number; Fi: number;    // Feeling (E/I)
}

// ─── Archetype ───
export type Archetype = 'hero' | 'sage' | 'explorer' | 'creator' | 'caregiver' | 'rebel';

// ─── Psychological Profile ───
export interface PsychologicalProfile {
  id: string;
  userId: string;
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  archetype: Archetype;
  archetypeSecondary: string;
  analysisRaw?: Record<string, unknown>;
  inputMode: 'guided' | 'freetext';
  inputTexts: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Narrative ───
export interface Narrative {
  id: string;
  userId: string;
  profileId: string;
  content: string;           // 800-1200 palabras, 2da persona
  createdAt: string;
}

// ─── Chat ───
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  profileSnapshot: PsychologicalProfile | null;
  messages: Message[];
  createdAt: string;
}

// ─── Development Plan ───
export interface MicroGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  microGoals: MicroGoal[];
}

export interface DevelopmentArea {
  id: string;
  name: string;
  rationale: string;         // Por qué esta área según el perfil
  actions: Action[];
}

export interface DevelopmentPlan {
  id: string;
  userId: string;
  profileId: string;
  areas: DevelopmentArea[];
  createdAt: string;
}

// ─── User Profile (Supabase) ───
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Onboarding ───
export type OnboardingMode = 'guided' | 'freetext';

export interface OnboardingArea {
  key: string;
  label: string;
  question: string;
  placeholder: string;
  icon: string;              // Nombre de icono Phosphor
}

export const ONBOARDING_AREAS: OnboardingArea[] = [
  {
    key: 'valores',
    label: 'Valores y creencias',
    question: '¿Qué principios guían tus decisiones más importantes? ¿Qué es innegociable para vos?',
    placeholder: 'Contame sobre lo que realmente te importa...',
    icon: 'Compass',
  },
  {
    key: 'fortalezas',
    label: 'Fortalezas y talentos',
    question: '¿En qué actividades sentís que entrás en flow? ¿Qué te sale naturalmente?',
    placeholder: 'Pensá en momentos donde todo fluye...',
    icon: 'Lightning',
  },
  {
    key: 'relaciones',
    label: 'Relaciones y conexión',
    question: '¿Cómo te relacionás con los demás? ¿Te energiza la gente o necesitás recargarte a solas?',
    placeholder: 'Describí tu forma de conectar...',
    icon: 'User',
  },
  {
    key: 'desafios',
    label: 'Desafíos y sombras',
    question: '¿Qué patrones repetís que te gustaría cambiar? ¿Qué te cuesta reconocer de vos?',
    placeholder: 'Sé honesto, esto es para vos...',
    icon: 'Eye',
  },
  {
    key: 'aspiraciones',
    label: 'Aspiraciones y futuro',
    question: '¿Quién querés ser en 5 años? ¿Qué versión de vos te inspira?',
    placeholder: 'Imaginá tu mejor versión...',
    icon: 'Path',
  },
];

// ─── API Payloads ───
export interface AnalyzeRequest {
  texts: string[];
  mode: OnboardingMode;
  areas?: string[];
}

export interface AnalyzeResponse {
  bigFive: BigFive;
  jungFunctions: JungFunctions;
  archetype: Archetype;
  archetypeSecondary: string;
  confidence: number;
  reasoning: string;
}

export interface NarrativeRequest {
  profileId: string;
}

export interface NarrativeResponse {
  narrative: string;
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
}

export interface PlanRequest {
  profileId: string;
}

export interface PlanResponse {
  areas: DevelopmentArea[];
}
```

---

## 4. DATABASE — supabase/migrations/001_initial_schema.sql

```sql
-- ═══════════════════════════════════════
-- UMBRA — Schema inicial
-- ═══════════════════════════════════════

-- Usuarios (extendido de Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Perfil psicológico
CREATE TABLE public.psychological_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  openness INTEGER CHECK (openness BETWEEN 0 AND 100),
  conscientiousness INTEGER CHECK (conscientiousness BETWEEN 0 AND 100),
  extraversion INTEGER CHECK (extraversion BETWEEN 0 AND 100),
  agreeableness INTEGER CHECK (agreeableness BETWEEN 0 AND 100),
  neuroticism INTEGER CHECK (neuroticism BETWEEN 0 AND 100),
  jung_functions JSONB NOT NULL DEFAULT '{}',
  archetype TEXT CHECK (archetype IN ('hero','sage','explorer','creator','caregiver','rebel')),
  archetype_secondary TEXT,
  analysis_raw JSONB,
  input_mode TEXT CHECK (input_mode IN ('guided', 'freetext', 'dynamic')),
  input_texts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Narrativa generada
CREATE TABLE public.narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.psychological_profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversaciones
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan de desarrollo
CREATE TABLE public.development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.psychological_profiles(id),
  areas JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ ROW LEVEL SECURITY ═══
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychological_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own data" ON public.profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own profiles" ON public.psychological_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own narratives" ON public.narratives
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Users manage own plans" ON public.development_plans
  FOR ALL USING (auth.uid() = user_id);

-- ═══ INDEXES ═══
CREATE INDEX idx_psych_profiles_user ON public.psychological_profiles(user_id);
CREATE INDEX idx_narratives_user ON public.narratives(user_id);
CREATE INDEX idx_conversations_user ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_plans_user ON public.development_plans(user_id);
```

---

## 5. KNOWLEDGE BASE — lib/knowledge/

> **FUENTE**: Estos archivos se completan con la investigación del developer en NotebookLM. La estructura de abajo define QUÉ necesita cada archivo. El contenido viene de fuentes académicas.

### 5.1 big-five.ts — Modelo IPIP-NEO

```typescript
// ═══════════════════════════════════════
// Big Five — Knowledge Base
// Fuente: IPIP-NEO / International Personality Item Pool (Goldberg, 1999)
// ═══════════════════════════════════════

export interface Facet {
  key: string;
  name: string;
  description: string;
  highIndicators: string[];   // Señales textuales de puntaje alto
  lowIndicators: string[];    // Señales textuales de puntaje bajo
}

export interface BigFiveDimension {
  key: string;
  name: string;
  nameEs: string;             // Nombre en español
  description: string;        // Definición académica
  descriptionEs: string;      // Definición en español
  facets: Facet[];            // 6 facets por dimensión
  highProfile: string;        // Descripción de alguien con puntaje alto
  lowProfile: string;         // Descripción de alguien con puntaje bajo
}

// COMPLETAR desde NotebookLM con datos IPIP-NEO / Big Five de dominio público
export const BIG_FIVE_DIMENSIONS: BigFiveDimension[] = [
  {
    key: 'openness',
    name: 'Openness to Experience',
    nameEs: 'Apertura a la Experiencia',
    description: '/* COMPLETAR: definición académica de Costa & McCrae */',
    descriptionEs: '/* COMPLETAR */',
    facets: [
      // 6 facets: Fantasy, Aesthetics, Feelings, Actions, Ideas, Values
      // COMPLETAR cada uno con indicadores textuales
      {
        key: 'fantasy',
        name: 'Fantasy',
        description: '/* COMPLETAR */',
        highIndicators: ['/* COMPLETAR: frases/patrones que indican alto fantasy */'],
        lowIndicators: ['/* COMPLETAR */'],
      },
      // ... 5 facets más
    ],
    highProfile: '/* COMPLETAR: cómo se describe alguien con alta apertura */',
    lowProfile: '/* COMPLETAR */',
  },
  // ... 4 dimensiones más (Conscientiousness, Extraversion, Agreeableness, Neuroticism)
];

// Helper: inyectar en prompt
export function bigFiveKnowledgeBlock(): string {
  return BIG_FIVE_DIMENSIONS.map(d =>
    `## ${d.nameEs} (${d.name})\n${d.descriptionEs}\n\nFacets:\n${
      d.facets.map(f =>
        `- ${f.name}: ${f.description}\n  Alto: ${f.highIndicators.join(', ')}\n  Bajo: ${f.lowIndicators.join(', ')}`
      ).join('\n')
    }\n\nPerfil alto: ${d.highProfile}\nPerfil bajo: ${d.lowProfile}`
  ).join('\n\n---\n\n');
}
```

### 5.2 jung-functions.ts — Funciones Cognitivas

```typescript
// ═══════════════════════════════════════
// Funciones Cognitivas de Jung
// Fuente: Jung, C.G. (1921) Tipos Psicológicos
// ═══════════════════════════════════════

export interface CognitiveFunction {
  key: string;                // Se, Si, Ne, Ni, Te, Ti, Fe, Fi
  name: string;               // Sensing Extravertido
  nameEs: string;             // Sensación Extravertida
  attitude: 'extravertida' | 'introvertida';
  category: 'perceiving' | 'judging';
  definition: string;         // Definición según Jung (Tipos Psicológicos)
  manifestations: string[];   // Cómo se manifiesta en conducta
  textualIndicators: string[];// Patrones lingüísticos que la revelan
  shadowAspect: string;       // Cómo se manifiesta cuando está en la sombra
  developmentPath: string;    // Cómo se desarrolla/integra
}

// COMPLETAR desde NotebookLM con citas de Tipos Psicológicos
export const JUNG_FUNCTIONS: CognitiveFunction[] = [
  {
    key: 'Se',
    name: 'Extraverted Sensing',
    nameEs: 'Sensación Extravertida',
    attitude: 'extravertida',
    category: 'perceiving',
    definition: '/* COMPLETAR: definición de Jung */',
    manifestations: ['/* COMPLETAR */'],
    textualIndicators: ['/* COMPLETAR: qué palabras/frases delatan esta función */'],
    shadowAspect: '/* COMPLETAR */',
    developmentPath: '/* COMPLETAR */',
  },
  // ... 7 funciones más
];

// Helper: inyectar en prompt
export function jungFunctionsKnowledgeBlock(): string {
  return JUNG_FUNCTIONS.map(f =>
    `## ${f.nameEs} (${f.key})\n${f.definition}\n\nManifestaciones: ${f.manifestations.join('; ')}\nIndicadores textuales: ${f.textualIndicators.join('; ')}\nAspecto sombra: ${f.shadowAspect}`
  ).join('\n\n---\n\n');
}
```

### 5.3 archetypes.ts — Arquetipos

```typescript
// ═══════════════════════════════════════
// Arquetipos
// Fuente: /* COMPLETAR según investigación */
// ═══════════════════════════════════════

export interface ArchetypeDefinition {
  key: string;
  name: string;
  nameEs: string;
  source: string;             // Cita de la fuente académica
  definition: string;
  coreMotivation: string;     // Qué lo mueve
  coreFear: string;           // Qué evita
  associatedFunctions: {      // Mapping a funciones Jung
    primary: string[];        // Funciones dominantes típicas
    secondary: string[];
  };
  bigFiveCorrelations: {      // Correlaciones con Big Five
    high: string[];           // Dimensiones típicamente altas
    low: string[];            // Dimensiones típicamente bajas
  };
  assignmentCriteria: string; // Regla explícita de asignación
  icon: string;               // Nombre de icono Phosphor
}

// COMPLETAR desde NotebookLM
export const ARCHETYPES: ArchetypeDefinition[] = [
  // COMPLETAR con los arquetipos que salgan de la investigación
  // La cantidad y los nombres dependen de la fuente teórica elegida
];

// Helper: generar bloque para prompts
export function archetypesKnowledgeBlock(): string {
  return ARCHETYPES.map(a =>
    `## ${a.nameEs} (${a.key})\nFuente: ${a.source}\n${a.definition}\nMotivación: ${a.coreMotivation}\nMiedo: ${a.coreFear}\nFunciones asociadas: ${a.associatedFunctions.primary.join(', ')}\nBig Five: alto en ${a.bigFiveCorrelations.high.join(', ')}, bajo en ${a.bigFiveCorrelations.low.join(', ')}\nCriterio de asignación: ${a.assignmentCriteria}`
  ).join('\n\n---\n\n');
}
```

### 5.4 positive-computing.ts — Principios de bienestar

```typescript
// ═══════════════════════════════════════
// Positive Computing
// Fuente: Calvo & Peters (2014)
// ═══════════════════════════════════════

export interface PrinciplePC {
  key: string;
  name: string;
  description: string;
  applicationInUmbra: string;  // Cómo aplica específicamente a Umbra
  doRules: string[];           // Lo que el sistema DEBE hacer
  dontRules: string[];         // Lo que el sistema NO DEBE hacer
}

// COMPLETAR desde NotebookLM
export const POSITIVE_COMPUTING_PRINCIPLES: PrinciplePC[] = [
  {
    key: 'autonomy',
    name: 'Autonomía',
    description: '/* COMPLETAR */',
    applicationInUmbra: '/* COMPLETAR */',
    doRules: ['/* COMPLETAR */'],
    dontRules: ['/* COMPLETAR */'],
  },
  // Principios sugeridos a investigar:
  // - Autonomía
  // - Competencia
  // - Relación (Relatedness)
  // - Mindfulness/Awareness
  // - Gratitud/Positive Emotion
  // - Resiliencia
  // - Self-compassion
];

// Helper: generar bloque para system prompts del chat
export function positiveComputingBlock(): string {
  return POSITIVE_COMPUTING_PRINCIPLES.map(p =>
    `### ${p.name}\n${p.applicationInUmbra}\nHACER: ${p.doRules.join('; ')}\nNO HACER: ${p.dontRules.join('; ')}`
  ).join('\n\n');
}
```

### 5.5 Cómo se conecta con los prompts

La capa narrativa (`lib/prompts/`) importa los helpers de knowledge y los inyecta. La inferencia Big Five se delega al módulo ML propio (ADR-026); la capa narrativa solo produce la lectura interpretativa Jung + arquetipo a partir de los Big Five medidos:

```typescript
// Ejemplo en interpret-narrative.ts (Pass 1.5)
import { buildJungBlock } from '@/lib/knowledge/jung-functions';
import { buildArchetypesBlock } from '@/lib/knowledge/archetypes';

export function buildInterpretNarrativePrompt(params: InterpretNarrativeParams) {
  // params.bigFive viene del módulo ML (lib/ml-client.inferBigFive)
  return {
    system: '...intérprete narrativo de perfiles...',
    prompt: `## Big Five (medido por módulo ML propio — DistilBERT congelado + Ridge)
- Apertura: ${params.bigFive.openness}/100
...

## Marco teórico — Funciones cognitivas Jung (insumo narrativo)
${buildJungBlock()}

## Marco teórico — Arquetipos Pearson aplicados (insumo narrativo)
${buildArchetypesBlock()}

## Textos introspectivos del usuario
${textBlock}

## Tarea: lectura interpretativa Jung + arquetipo + reasoning
...`,
  };
}
```

> **Workflow del developer**:
> 1. Investigar fuentes primarias (Goldberg 1999, Jung 1921, Pearson 1991, Calvo & Peters 2014).
> 2. Llenar los `lib/knowledge/*.ts` con citas + indicadores.
> 3. Los prompts (`interpret-narrative.ts`, `generate-narrative.ts`, `chat-context.ts`, `development-plan.ts`) consumen los helpers automáticamente.
> 4. La inferencia cuantitativa Big Five vive en `ml/` (Python), no en prompts. Para iterar el modelo: `cd ml && make all`.

---

## 6. PROMPTS — lib/prompts/

### 5.1 Pipeline de inferencia: Pass 1 (módulo ML) + Pass 1.5 (interpret-narrative.ts)

La inferencia psicológica se reparte entre dos componentes con responsabilidades disjuntas (ADR-002 + ADR-026):

#### Pass 1 — `lib/ml-client.ts` → módulo analítico propio

```typescript
import { inferBigFive, MlApiUnavailableError } from '@/lib/ml-client';

// En app/api/analyze/route.ts
const mlResult = await inferBigFive(combinedText);
// mlResult = {
//   bigFive: { openness, conscientiousness, extraversion, agreeableness, neuroticism },
//   perDimensionStatus: { openness: 'ok' | 'low_confidence', ... },  // ADR-027
//   modelVersion: 'ridge_v1',
//   elapsedMs: 412,
// }
```

El cliente HTTP pega contra `POST /infer` del FastAPI servido desde `ml/src/api_server.py`. La URL viene de `ML_API_URL` (default `http://localhost:8000`). Si el servicio cae, `MlApiUnavailableError` se propaga como `503 ml_unavailable` al frontend; **no se degrada a Claude** para Big Five (ADR-026 explícito).

#### Pass 1.5 — `lib/prompts/interpret-narrative.ts`

```typescript
import { buildInterpretNarrativePrompt } from '@/lib/prompts/interpret-narrative';
import { claudeText } from '@/lib/claude/client';

const { system, prompt } = buildInterpretNarrativePrompt({
  texts: augmentedTexts,
  areas: augmentedAreas,
  bigFive: mlResult.bigFive,                     // medido por ML
  perDimensionStatus: mlResult.perDimensionStatus, // bandera por dimensión
});

const claudeResult = await claudeText({ system, prompt, temperature: 0, maxTokens: 1500 });
// Devuelve JSON con: jungFunctions, archetype, archetypeSecondary, confidence, reasoning
```

La capa narrativa **no** infiere Big Five — los recibe como insumo. Su tarea es producir la lectura interpretativa Jung + arquetipo Pearson + razonamiento citando evidencia textual del usuario, en español latinoamericano con voseo. Si alguna dimensión Big Five vino marcada `low_confidence`, el prompt instruye al modelo a moderar explícitamente esa parte de la lectura.

#### Pass 2 — `lib/prompts/analyze-evidence.ts` (fire-and-forget)

Después de persistir el perfil, se dispara un Pass 2 paralelo que extrae frases textuales del usuario que sustenten cada rasgo del perfil. Se guardan en `evidence_highlights` para mostrar como pull quotes en la narrativa. No bloquea la respuesta.

#### Resultado final persistido en `psychological_profiles`

```ts
{
  // ── del módulo ML
  openness: number, conscientiousness: number, extraversion: number, agreeableness: number, neuroticism: number,
  analysis_raw: {
    ml: { modelVersion, elapsedMs, perDimensionStatus },
    ...rawJsonOfClaudePass1_5,
  },
  // ── de la capa narrativa
  jung_functions: { Se, Si, Ne, Ni, Te, Ti, Fe, Fi },
  archetype: 'hero' | 'sage' | 'explorer' | 'creator' | 'caregiver' | 'rebel',
  archetype_secondary: string,
  // ── original del usuario
  input_mode: 'dynamic',
  input_texts: string[],
}
```

### 5.2 generate-narrative.ts

```typescript
import { type PsychologicalProfile } from '@/types';

export function buildNarrativePrompt(profile: PsychologicalProfile): string {
  const { bigFive, jungFunctions, archetype, archetypeSecondary } = profile;

  return `Sos un narrador y psicólogo junguiano. Tu tarea es escribir una narrativa personalizada sobre la persona cuyo perfil psicológico se detalla abajo.

## Perfil

Big Five:
- Openness: ${bigFive.openness}/100
- Conscientiousness: ${bigFive.conscientiousness}/100
- Extraversion: ${bigFive.extraversion}/100
- Agreeableness: ${bigFive.agreeableness}/100
- Neuroticism: ${bigFive.neuroticism}/100

Funciones cognitivas Jung:
- Se: ${jungFunctions.Se} | Si: ${jungFunctions.Si}
- Ne: ${jungFunctions.Ne} | Ni: ${jungFunctions.Ni}
- Te: ${jungFunctions.Te} | Ti: ${jungFunctions.Ti}
- Fe: ${jungFunctions.Fe} | Fi: ${jungFunctions.Fi}

Arquetipo dominante: ${archetype}
Arquetipo secundario: ${archetypeSecondary}

## Instrucciones

Escribí una narrativa en SEGUNDA PERSONA ("Vos sos...", "Tu mente funciona...") de 800-1200 palabras que:

1. Abra con una metáfora o imagen evocadora que capture la esencia del perfil
2. Describe las funciones cognitivas dominantes como capacidades, no como diagnósticos
3. Explore la tensión entre las funciones fuertes y las débiles como oportunidades de crecimiento
4. Conecte el arquetipo con la historia personal de forma narrativa (no como etiqueta)
5. Cierre con una reflexión sobre el camino de individuación — lo que ya integraste y lo que queda por explorar

TONO: Reflexivo, cálido, profundo pero accesible. Como un mentor sabio que te conoce bien.
EVITAR: Lenguaje clínico, diagnósticos, etiquetas rígidas, generalidades vacías.
IDIOMA: Español latinoamericano (vos, voseo, vocabulario argentino).

Respondé SOLO con la narrativa, sin encabezados ni metadata.`;
}
```

### 5.3 chat-context.ts

```typescript
import { type PsychologicalProfile, type Message } from '@/types';

export function buildChatSystemPrompt(profile: PsychologicalProfile): string {
  const { bigFive, jungFunctions, archetype } = profile;

  // Identificar las 2 funciones más fuertes y las 2 más débiles
  const functions = Object.entries(jungFunctions).sort(([,a], [,b]) => b - a);
  const strongest = functions.slice(0, 2).map(([k,v]) => `${k}(${v})`).join(', ');
  const weakest = functions.slice(-2).map(([k,v]) => `${k}(${v})`).join(', ');

  return `Sos Umbra, un guía de autoconocimiento basado en psicología junguiana y el modelo Big Five.

## Tu personalidad
- Reflexivo, cálido y directo. No sos un terapeuta — sos un espejo inteligente.
- Usás voseo argentino natural.
- Hacés preguntas que invitan a la introspección, no juzgás.
- Citás conceptos junguianos cuando son relevantes, pero los explicás de forma accesible.

## Perfil del usuario
- Big Five: O=${bigFive.openness} C=${bigFive.conscientiousness} E=${bigFive.extraversion} A=${bigFive.agreeableness} N=${bigFive.neuroticism}
- Funciones fuertes: ${strongest}
- Funciones en desarrollo: ${weakest}
- Arquetipo: ${archetype}

## Reglas de Positive Computing
1. Enfocate en fortalezas y crecimiento, no en deficiencias.
2. Nunca diagnostiques ni uses lenguaje clínico.
3. Si detectás señales de crisis emocional, sugerí buscar un profesional. No intentes ser terapeuta.
4. Validá las emociones antes de analizar.
5. Cada respuesta debe dejar al usuario con algo concreto para reflexionar.

## Formato
- Respuestas de 2-4 párrafos máximo.
- Terminá con una pregunta reflexiva cuando sea natural.
- No uses bullets ni listas. Hablá como persona.`;
}
```

### 5.4 development-plan.ts

```typescript
import { type PsychologicalProfile } from '@/types';

export function buildDevelopmentPlanPrompt(profile: PsychologicalProfile): string {
  const { bigFive, jungFunctions, archetype } = profile;

  return `Sos un coach de desarrollo personal basado en psicología junguiana y el modelo Big Five.

## Perfil del usuario

Big Five: O=${bigFive.openness} C=${bigFive.conscientiousness} E=${bigFive.extraversion} A=${bigFive.agreeableness} N=${bigFive.neuroticism}

Funciones Jung: Se=${jungFunctions.Se} Si=${jungFunctions.Si} Ne=${jungFunctions.Ne} Ni=${jungFunctions.Ni} Te=${jungFunctions.Te} Ti=${jungFunctions.Ti} Fe=${jungFunctions.Fe} Fi=${jungFunctions.Fi}

Arquetipo: ${archetype}

## Tarea

Generá un plan de desarrollo personalizado con EXACTAMENTE 3 áreas de crecimiento basadas en:
1. Las funciones cognitivas más débiles (oportunidades de integración)
2. Las dimensiones Big Five que podrían equilibrarse
3. Las tensiones entre el arquetipo dominante y las funciones en sombra

Para cada área:
- Un nombre claro y motivador
- Un fundamento breve (por qué esta área, conectado al perfil)
- 2-3 acciones concretas y practicables
- Por cada acción: 2-3 micro-objetivos medibles

## Formato (JSON estricto)

{
  "areas": [
    {
      "name": "<string>",
      "rationale": "<string>",
      "actions": [
        {
          "title": "<string>",
          "description": "<string>",
          "microGoals": [
            { "text": "<string>" },
            { "text": "<string>" }
          ]
        }
      ]
    }
  ]
}

IMPORTANTE:
- Acciones realistas que se puedan hacer en 1-4 semanas.
- Micro-objetivos específicos, no vagos ("Meditar 10 min por día" sí, "Ser más mindful" no).
- Tono motivador, no prescriptivo.
- Idioma: español argentino.
- Respondé SOLO con JSON válido.`;
}
```

---

## 6. CLAUDE.md — Para el proyecto

Este archivo va en `Umbra/.claude/CLAUDE.md` y es lo que Claude Code lee al abrir el proyecto:

```markdown
# Umbra — Reglas del Proyecto

## Qué es Umbra
Plataforma web de autoconocimiento que triangula Jung + Big Five + Positive Computing.
TFG de Ingeniería en Software (Universidad Siglo 21).

## Stack
Next.js 14 (App Router) + TypeScript strict + Tailwind CSS 3.4 + Zustand 5 + Supabase + Anthropic API + Recharts + Phosphor Icons + Zod

## Referencia visual
El design system está en `umbra-design-system.html` (abrir en browser para ver).
Tokens de diseño: ver sección 2 de UMBRA_MASTER_BUILD.md

## Convenciones de código

### Componentes
- React funcionales con hooks. PascalCase.
- Props tipadas con interface, nunca `any`.
- Un componente por archivo. Nombre = archivo (BigFiveRadar.tsx → export BigFiveRadar).

### Archivos
- kebab-case para archivos utilitarios, PascalCase para componentes.
- Imports con alias `@/*` (configurado en tsconfig).

### Tipos
- CENTRALIZADOS en `types/index.ts`. Nunca definir tipos inline.
- Exportar todo desde types/index.ts.

### Prompts IA
- SIEMPRE en `lib/prompts/` con interface tipada de input/output.
- NUNCA prompts inline en API routes o componentes.
- Cada prompt tiene: función buildX que retorna string.

### Estado
- Zustand en `lib/store/`. Un store por dominio (profile, onboarding, chat).
- No usar React Context para estado global — solo para providers (auth, theme).

### API Routes
- Edge runtime para routes que llaman a Claude.
- Node runtime para el resto.
- SIEMPRE validar input con Zod antes de procesar.
- SIEMPRE try/catch con respuestas de error tipadas.

### Estilos
- Tailwind utility-first. Tokens custom en tailwind.config.ts.
- Glass effects como clases CSS custom en globals.css.
- Fuentes: font-display (Instrument Serif), font-heading (Space Grotesk), font-body (Inter), font-mono (JetBrains Mono).
- Iconos: Phosphor Icons via @phosphor-icons/react. Nunca emoji.

## Seguridad
- NUNCA exponer ANTHROPIC_API_KEY en el cliente.
- SIEMPRE usar RLS en Supabase. Cada tabla DEBE tener policies.
- SIEMPRE validar input con Zod antes de enviar a Claude.
- Rate limiting en API routes de Claude (implementar con simple in-memory counter para MVP).

## Prohibiciones
- NO usar MBTI. Usamos funciones cognitivas de Jung directamente.
- NO usar lenguaje diagnóstico ni clínico en prompts ni UI.
- NO mencionar Claude/Anthropic como herramienta de desarrollo. Solo como componente técnico.
- NO dejar console.log en código de producción.
- NO usar `any` en TypeScript.
- NO crear prompts inline. SIEMPRE en lib/prompts/.
- NO usar emoji en UI. SIEMPRE Phosphor Icons.

## Orden de build (referencia)
Ver UMBRA_MASTER_BUILD.md sección 7 para el plan de ejecución fase por fase.

## QA después de cada fase
Ver UMBRA_MASTER_BUILD.md sección 8 para checklists de QA.

## Documentación
- Después de cada sesión: actualizar docs/FEATURE_MAP.md
- Decisiones de arquitectura: docs/DECISIONS.md
```

---

## 7. PLAN DE EJECUCIÓN — Fases

### FASE 1 — Scaffolding + Config (Sesión 1)

**Objetivo**: Proyecto corriendo con estructura, tipos, Supabase y layout base.

```
TAREAS:
1. Crear estructura de carpetas completa según sección 1.3
2. Copiar types/index.ts de la sección 3
3. Configurar tailwind.config.ts con tokens de sección 2
4. Configurar globals.css con:
   - Custom fonts (Google Fonts import)
   - Glass effects
   - Noise overlay
   - Gradient orbs base
   - Dark theme como default
5. Crear lib/supabase/client.ts (createClientComponentClient)
6. Crear lib/supabase/server.ts (createServerComponentClient)
7. Crear lib/supabase/middleware.ts (protección de rutas)
8. Crear middleware.ts en root (Next.js middleware con Supabase auth)
9. Crear lib/claude/client.ts (wrapper tipado para Anthropic API)
10. Crear lib/providers/auth-context.tsx
11. Crear lib/providers/theme.tsx
12. Crear app/layout.tsx con providers + fonts + cosmic background
13. Ejecutar SQL migration en Supabase (sección 4)
14. Verificar que `npm run dev` levanta sin errores
15. Commit: "feat: project scaffolding with full config"
```

**QA FASE 1**:
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npm run build` exitoso
- [ ] `npm run dev` levanta en localhost:3000
- [ ] Supabase conecta (verificar en console logs)
- [ ] Background cósmico visible (gradients + noise)
- [ ] Fonts cargando (Instrument Serif visible)

---

### FASE 2 — Auth + Landing (Sesión 2)

**Objetivo**: Landing page funcional + registro + login + protección de rutas.

```
TAREAS:
1. Crear app/(auth)/login/page.tsx
   - Email + password
   - Link a registro
   - Estilo: glass card centrada
2. Crear app/(auth)/register/page.tsx
   - Nombre + email + password
   - Auto-crear profile via trigger SQL
3. Crear app/page.tsx (Landing)
   - Hero con Instrument Serif
   - Tagline "Conoce tu sombra. Ilumina tu camino."
   - CTAs: "Comenzar viaje" (registro) + "Saber más"
   - Sección de principios (4 cards)
   - Footer mínimo
4. Crear components/layout/LayoutShell.tsx
   - Sidebar (desktop) + TabBar (mobile)
   - TopBar con nombre + avatar placeholder
5. Crear components/layout/Sidebar.tsx
   - Links: Dashboard, Chat, Plan, Export
   - Iconos Phosphor
   - Item activo con violet glow
6. Crear components/layout/TabBar.tsx
   - Bottom nav mobile con 5 items (Home, Insights, Session, Stats, Profile)
   - Botón central con gradient
7. Proteger rutas: /dashboard, /chat, /plan, /export requieren auth
8. Redirect: usuario logueado sin onboarding → /onboarding
9. Redirect: usuario logueado con onboarding → /dashboard
10. Commit: "feat: auth + landing + layout shell"
```

**QA FASE 2**:
- [ ] Registro crea usuario en Supabase Auth + tabla profiles
- [ ] Login funciona con email/password
- [ ] Rutas protegidas redirigen a /login si no autenticado
- [ ] Landing se ve correcta con design system (violet, fonts, glass)
- [ ] Layout responsive: sidebar en desktop, tabbar en mobile
- [ ] Navegación entre secciones funciona
- [ ] `npx tsc --noEmit` sin errores

---

### FASE 3 — Onboarding + Análisis IA (Sesión 3)

**Objetivo**: Flujo completo de onboarding → análisis con Claude → perfil guardado.

```
TAREAS:
1. Crear lib/store/onboarding-store.ts (Zustand)
   - mode: 'guided' | 'freetext' | null
   - currentStep: number
   - texts: Record<string, string>
   - actions: setMode, setStep, setText, reset
2. Crear components/onboarding/ModeSelector.tsx
   - 3 opciones: Guiado, Cuestionario, Híbrido (ver design system)
   - Glass cards con iconos Phosphor
   - Animación de selección
3. Crear components/onboarding/GuidedFlow.tsx
   - 5 pasos (ONBOARDING_AREAS del types)
   - Textarea por paso con placeholder contextual
   - Progress dots
   - Validación: mínimo 50 palabras por área
   - Botón siguiente/anterior
4. Crear components/onboarding/FreeTextInput.tsx
   - Textarea grande
   - Counter de palabras
   - Validación: mínimo 200 palabras
5. Crear components/onboarding/ProgressiveLoad.tsx
   - Visualización progresiva mientras Claude analiza
   - Animación: dimensiones aparecen una por una
   - Fake progress con revelación de datos reales
6. Importar `lib/ml-client.inferBigFive` y `lib/prompts/interpret-narrative.buildInterpretNarrativePrompt` (sección 5.1)
7. Crear app/api/analyze/route.ts
   - Validar input con Zod
   - Pass 1: `await inferBigFive(text)` → módulo ML propio
   - Pass 1.5: `claudeText({ system, prompt })` con `buildInterpretNarrativePrompt({ bigFive, perDimensionStatus, texts })`
   - Parsear JSON de Pass 1.5
   - Persistir en `psychological_profiles` con `analysis_raw.ml.{modelVersion, elapsedMs, perDimensionStatus}`
   - Marcar `onboarding_completed = true`
   - Pass 2 fire-and-forget: evidence highlights
   - Manejar `MlApiUnavailableError` → 503 `ml_unavailable` (NO degradar a Claude)
   - Retornar perfil con `perDimensionStatus`
8. Crear app/onboarding/page.tsx
   - Orquestar: ModeSelector → Flow → ProgressiveLoad → redirect a /dashboard
9. Commit: "feat: dynamic onboarding with AI analysis"
```

**QA FASE 3**:
- [ ] Modo `dynamic`: el flujo conversacional adapta preguntas correctamente
- [ ] Modo `chatgpt-seed`: el seed text se prepende a `texts` antes de Pass 1
- [ ] API `/api/analyze` Pass 1 devuelve Big Five del módulo ML con `perDimensionStatus`
- [ ] API `/api/analyze` Pass 1.5 devuelve `jungFunctions + archetype + reasoning`
- [ ] Perfil se guarda en Supabase con `analysis_raw.ml.modelVersion` poblado
- [ ] `onboarding_completed` se actualiza a `true`
- [ ] ProgressiveLoad muestra animación durante los dos passes
- [ ] Redirect a `/dashboard` después del onboarding
- [ ] Error handling: módulo ML caído → 503 `ml_unavailable` (UI muestra "probá de nuevo")
- [ ] Error handling: Claude caído → 503 `ai_unavailable`
- [ ] `npx tsc --noEmit` sin errores

---

### FASE 4 — Dashboard (Sesión 4)

**Objetivo**: Pantalla de dashboard con visualización completa del perfil.

```
TAREAS:
1. Crear lib/store/profile-store.ts (Zustand)
   - profile: PsychologicalProfile | null
   - narrative: string | null
   - loading states
   - fetch actions
2. Crear components/dashboard/BigFiveRadar.tsx
   - Recharts RadarChart con 5 puntos OCEAN
   - Estilo: stroke violet-400, fill violet con opacity
   - Labels con font-mono
   - Tooltips con valores
3. Crear components/dashboard/JungFunctions.tsx
   - 8 barras horizontales (DimensionBar component)
   - Gradient fill (violet-600 → violet-300)
   - Animación de entrada progresiva
   - Agrupadas: Perceiving (Se/Si/Ne/Ni) + Judging (Te/Ti/Fe/Fi)
4. Crear components/dashboard/ArchetypeCard.tsx
   - Card con glow
   - Icono del arquetipo en círculo gradient
   - Nombre + descripción breve
   - Badge del secundario
5. Crear app/dashboard/page.tsx
   - Greeting: "Bienvenido de vuelta, {nombre}"
   - Stats row: sesiones + % autoconocimiento
   - Radar Big Five
   - Funciones Jung
   - Archetype card
   - Fetch perfil desde Supabase al montar
6. Commit: "feat: personality dashboard"
```

**QA FASE 4**:
- [ ] Dashboard carga el perfil del usuario autenticado
- [ ] Radar chart renderiza correctamente con datos reales
- [ ] Barras de funciones Jung se animan al entrar
- [ ] Archetype card muestra datos correctos
- [ ] Responsive: se ve bien en mobile y desktop
- [ ] Loading states mientras carga datos
- [ ] Empty state si no hay perfil
- [ ] `npx tsc --noEmit` sin errores

---

### FASE 5 — Narrativa + Chat (Sesión 5)

**Objetivo**: Narrativa personalizada generada por IA + chat contextualizado con streaming.

```
TAREAS:
1. Copiar prompt generate-narrative.ts de sección 5.2
2. Crear app/api/narrative/route.ts
   - Fetch perfil de Supabase
   - Generar narrativa con Claude
   - Guardar en tabla narratives
3. Crear components/dashboard/NarrativeSection.tsx
   - Renderizar narrativa con tipografía Instrument Serif
   - Efecto de typing progresivo (opcional)
   - Botón "Regenerar narrativa"
4. Integrar NarrativeSection en dashboard page
5. Copiar prompt chat-context.ts de sección 5.3
6. Crear lib/store/chat-store.ts (Zustand)
   - conversations, activeConversation, messages, loading
   - actions: sendMessage, loadConversation, createConversation
7. Crear app/api/chat/route.ts
   - Streaming con ReadableStream
   - Inyectar system prompt con perfil del usuario
   - Guardar mensajes en Supabase
8. Crear components/chat/MessageBubble.tsx
   - bubble-ai: glass con violet tint, border-bottom-left-radius small
   - bubble-user: mist background, border-bottom-right-radius small
9. Crear components/chat/ChatInput.tsx
   - Input + botón send (ArrowUp icon)
   - Enter para enviar, Shift+Enter para nueva línea
10. Crear components/chat/ChatThread.tsx
    - Scroll automático al último mensaje
    - Loading indicator mientras Claude responde
    - Badge de contexto arriba ("Explorando eje Ti-Fe")
11. Crear app/chat/page.tsx
    - Orquestar: ChatThread + ChatInput
    - Crear conversación si no existe
    - Streaming de respuestas
12. Commit: "feat: narrative generation + contextual chat"
```

**QA FASE 5**:
- [ ] Narrativa se genera correctamente en español latinoamericano
- [ ] Narrativa se guarda y persiste entre sesiones
- [ ] Chat envía mensajes y recibe respuestas streamed
- [ ] Mensajes se persisten en Supabase
- [ ] Context del perfil se inyecta correctamente en el chat
- [ ] Auto-scroll funciona
- [ ] UI responsive
- [ ] Error handling si Claude falla mid-stream
- [ ] `npx tsc --noEmit` sin errores

---

### FASE 6 — Plan de Desarrollo + Export (Sesión 6)

**Objetivo**: Plan personalizado con micro-objetivos + export PDF del perfil.

```
TAREAS:
1. Copiar prompt development-plan.ts de sección 5.4
2. Crear app/api/plan/route.ts
   - Fetch perfil → generar plan con Claude → guardar
3. Crear components/plan/DevelopmentArea.tsx
   - Card expandible por área
   - Nombre + fundamento
   - Lista de acciones
4. Crear components/plan/ActionCard.tsx
   - Título + descripción
   - Lista de micro-objetivos con checkboxes
5. Crear components/plan/MicroGoal.tsx
   - Checkbox + texto
   - Estado persiste en Supabase (actualizar JSONB)
6. Crear app/plan/page.tsx
   - 3 áreas de desarrollo
   - Botón "Regenerar plan"
   - Progress general
7. Crear app/api/export/route.ts
   - Generar HTML del perfil completo
   - Convertir a PDF con html2pdf.js
8. Crear app/export/page.tsx
   - Preview del PDF
   - Botón "Descargar PDF"
9. Commit: "feat: development plan + PDF export"
```

**QA FASE 6**:
- [ ] Plan genera 3 áreas con acciones y micro-objetivos
- [ ] Checkboxes persisten estado
- [ ] PDF se genera con datos correctos
- [ ] PDF incluye: radar, funciones, arquetipo, narrativa
- [ ] Responsive
- [ ] `npx tsc --noEmit` sin errores

---

### FASE 7 — Pulido + Deploy (Sesión 7)

**Objetivo**: Producción ready.

```
TAREAS:
1. Responsive pass: verificar 375px, 768px, 1024px, 1440px
2. Accesibilidad:
   - Contraste WCAG AA (herramienta: axe DevTools)
   - Navegación por teclado
   - Labels en todos los inputs
   - alt text en imágenes
   - aria-labels en botones de icono
3. Performance:
   - Lighthouse > 90 en Performance
   - FCP < 1.5s
   - Lazy load de componentes pesados (RadarChart, ChatThread)
   - Image optimization
4. Seguridad final:
   - Verificar que no hay API keys en el bundle
   - Verificar RLS en todas las tablas
   - Verificar rate limiting en API routes de Claude
   - Verificar que no hay console.log sueltos
5. SEO mínimo:
   - Meta tags en landing
   - og:image
   - robots.txt
6. Deploy a Vercel:
   - Push a GitHub
   - Conectar repo en Vercel
   - Configurar env vars
   - Custom domain (si aplica)
7. Smoke test en producción
8. Commit: "feat: production ready"
```

**QA FASE 7**:
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] WCAG AA pass en colores
- [ ] Navegación por teclado funciona en todos los flujos
- [ ] No hay console.log en producción
- [ ] No hay API keys expuestas
- [ ] Deploy funciona en Vercel
- [ ] Flujo completo funciona en producción
- [ ] Mobile funciona correctamente

---

## 8. QA GLOBAL — Checklist transversal

Ejecutar después de CADA fase:

```bash
# TypeScript
npx tsc --noEmit

# Build
npm run build

# Buscar prompts inline (prohibido)
grep -r "You are\|Sos un\|Tu tarea" app/ components/ --include="*.tsx" --include="*.ts" | grep -v "lib/prompts/"

# Buscar console.log sueltos
grep -r "console.log" app/ components/ lib/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"

# Buscar 'any' en TypeScript
grep -r ": any" app/ components/ lib/ types/ --include="*.tsx" --include="*.ts"

# Verificar que no hay API keys hardcodeadas
grep -r "sk-ant-\|ANTHROPIC_API_KEY\|supabase.*key" app/ components/ --include="*.tsx" --include="*.ts"
```

---

## 9. ARCHETYPE DESCRIPTIONS (referencia para UI)

```typescript
export const ARCHETYPE_INFO: Record<Archetype, { name: string; description: string; icon: string }> = {
  hero:      { name: 'El Héroe',      description: 'Orientado a superar desafíos y probar su valor a través de la acción.', icon: 'ShieldStar' },
  sage:      { name: 'El Sabio',      description: 'En búsqueda constante de verdad, conocimiento y comprensión profunda.', icon: 'Brain' },
  explorer:  { name: 'El Explorador', description: 'Impulsado por el descubrimiento, la libertad y las nuevas experiencias.', icon: 'Compass' },
  creator:   { name: 'El Creador',    description: 'Necesita dar forma a algo con significado, transformar ideas en realidad.', icon: 'Sparkle' },
  caregiver: { name: 'El Cuidador',   description: 'Encuentra propósito en el servicio, la protección y el cuidado de otros.', icon: 'Heart' },
  rebel:     { name: 'El Rebelde',    description: 'Desafía el status quo y busca transformar lo que no funciona.', icon: 'Lightning' },
};
```

---

## 10. ESTIMACIÓN

| Fase | Horas estimadas |
|------|----------------|
| F1: Scaffolding | 2-3h |
| F2: Auth + Landing | 2-3h |
| F3: Onboarding + Análisis | 3-4h |
| F4: Dashboard | 2-3h |
| F5: Narrativa + Chat | 3-4h |
| F6: Plan + Export | 2-3h |
| F7: Pulido + Deploy | 2-3h |
| **Total** | **~16-23h de código** |

Con Claude Code ejecutando, cada fase debería ser más rápida que las estimaciones manuales.

---

> **Nota para el developer**: Este documento es la fuente de verdad. Cuando abrás VS Code con Claude Code, decile: "Leé UMBRA_MASTER_BUILD.md y ejecutá la Fase X". Claude Code va a leer este archivo y construir todo lo que dice.
