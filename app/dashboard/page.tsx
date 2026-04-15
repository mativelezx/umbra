import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { ArchetypeCard } from '@/components/dashboard/ArchetypeCard';
import { NarrativeSection } from '@/components/dashboard/NarrativeSection';
import { NarrativeTOC } from '@/components/dashboard/NarrativeTOC';
import { DashboardDepth } from '@/components/dashboard/DashboardDepth';
import { BigFiveRadar } from '@/components/dashboard/BigFiveRadar';
import { JungAxisView } from '@/components/dashboard/JungAxisView';
import { QuickGlance } from '@/components/dashboard/QuickGlance';
import { ArchetypeMap } from '@/components/dashboard/ArchetypeMap';
import { CartaFuturaCard } from '@/components/dashboard/CartaFuturaCard';
import { Card } from '@/components/ui/Card';
import { ARCHETYPE_INFO } from '@/types';
import type { Archetype, BigFive, JungFunctions as JF } from '@/types';
import {
  DEMO_BIG_FIVE,
  DEMO_JUNG_FUNCTIONS,
  DEMO_ARCHETYPE,
  DEMO_ARCHETYPE_SECONDARY,
  DEMO_PROFILE_ID,
  DEMO_NARRATIVE,
  DEMO_CARTA_LETTER,
  DEMO_USER,
  isDemoMode,
} from '@/lib/demo/seed';

export const dynamic = 'force-dynamic';

interface DashboardData {
  fullName: string | null;
  createdAt: string;
  bigFive: BigFive;
  jungFunctions: JF;
  archetype: Archetype;
  secondary: string;
  profileId: string;
  narrativeContent: string | null;
  confidence: number | null;
  turnsCount: number | null;
  letter: {
    id: string;
    content: string;
    unlock_at: string;
    written_at: string;
  } | null;
}

function DashboardView({ data }: { data: DashboardData }) {
  const createdDays = Math.floor(
    (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  const archetypeName = ARCHETYPE_INFO[data.archetype].name;

  return (
    <LayoutShell>
      <div className="flex flex-col gap-10 md:gap-12">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
              Hola{data.fullName ? `, ${data.fullName.split(' ')[0]}` : ''}
            </p>
            <h1 className="mt-2 font-display text-4xl italic text-text-1 md:text-5xl">
              Tu perfil interior
            </h1>
            <p className="mt-1 font-mono text-xs text-text-4">
              Analizaste hace {createdDays} {createdDays === 1 ? 'día' : 'días'}
            </p>
          </div>
          <a
            href="/export"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-violet-400/20 bg-umbra-shadow/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-2 transition-all duration-200 hover:border-violet-400/50 hover:bg-violet-400/10 hover:text-text-1"
            aria-label="Descargar perfil en PDF"
          >
            <span>Descargar PDF</span>
          </a>
        </div>

        {/* ARCHETYPE HERO */}
        <ArchetypeCard
          archetype={data.archetype}
          secondary={data.secondary}
          confidence={data.confidence}
          turnsCount={data.turnsCount}
        />

        {/* QUICK GLANCE — 3 cards above the fold */}
        <QuickGlance
          bigFive={data.bigFive}
          jungFunctions={data.jungFunctions}
          archetypeName={archetypeName}
          confidence={data.confidence}
          turnsCount={data.turnsCount}
        />

        {/* NARRATIVA — sectioned with iconography + sticky TOC on desktop.
            TOC only renders when the narrative has at least one `##` heading,
            because legacy narratives (pre-5-section prompt) parse as a single
            fallback block with no section ids to spy on — rendering the TOC
            anyway would leave it pointing at nothing. */}
        {data.narrativeContent && /^##\s+/m.test(data.narrativeContent) ? (
          <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-10">
            <NarrativeTOC />
            <NarrativeSection
              profileId={data.profileId}
              initialContent={data.narrativeContent}
            />
          </div>
        ) : (
          <NarrativeSection
            profileId={data.profileId}
            initialContent={data.narrativeContent}
          />
        )}

        {/* VISTA PROFUNDA — opt-in progressive disclosure (Fase 3.1 + ADR-025).
            El usuario ve el archetype hero + quick glance + narrativa por
            default. Los datos más densos (radar Big Five, 4 ejes Jung,
            mapa comparativo de arquetipos, carta futura) se revelan al
            expandir. Reduce carga cognitiva inicial y crea un momento de
            "exploración elegida" en vez de bombardeo. */}
        <DashboardDepth>
          {/* DATA VIZ — 2 columns */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
                Big Five · radar
              </p>
              <BigFiveRadar bigFive={data.bigFive} />
            </Card>
            <Card>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
                Cómo tu mente trabaja · 4 ejes
              </p>
              <JungAxisView jungFunctions={data.jungFunctions} />
            </Card>
          </div>

          {/* ARCHETYPE MAP — comparison with the other 5 */}
          <ArchetypeMap userArchetype={data.archetype} />

          {data.letter && (
            <CartaFuturaCard
              letter={data.letter}
              snapshot={{ archetype: data.archetype, jungFunctions: data.jungFunctions }}
            />
          )}
        </DashboardDepth>
      </div>
    </LayoutShell>
  );
}

export default async function DashboardPage() {
  if (isDemoMode()) {
    return (
      <DashboardView
        data={{
          fullName: DEMO_USER.full_name,
          createdAt: DEMO_USER.created_at,
          bigFive: DEMO_BIG_FIVE,
          jungFunctions: DEMO_JUNG_FUNCTIONS,
          archetype: DEMO_ARCHETYPE,
          secondary: DEMO_ARCHETYPE_SECONDARY,
          profileId: DEMO_PROFILE_ID,
          narrativeContent: DEMO_NARRATIVE,
          confidence: 82,
          turnsCount: 14,
          letter: {
            id: DEMO_CARTA_LETTER.id,
            content: DEMO_CARTA_LETTER.content,
            unlock_at: DEMO_CARTA_LETTER.unlock_at,
            written_at: DEMO_CARTA_LETTER.written_at,
          },
        }}
      />
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileRow } = await supabase
    .from('psychological_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('version', 1)
    .maybeSingle();

  if (!profileRow) {
    redirect('/onboarding');
  }

  const bigFive: BigFive = {
    openness: profileRow.openness ?? 50,
    conscientiousness: profileRow.conscientiousness ?? 50,
    extraversion: profileRow.extraversion ?? 50,
    agreeableness: profileRow.agreeableness ?? 50,
    neuroticism: profileRow.neuroticism ?? 50,
  };

  const jungFunctions: JF = (profileRow.jung_functions as JF) ?? {
    Se: 50,
    Si: 50,
    Ne: 50,
    Ni: 50,
    Te: 50,
    Ti: 50,
    Fe: 50,
    Fi: 50,
  };

  const archetype = (profileRow.archetype ?? 'sage') as Archetype;
  const secondary = profileRow.archetype_secondary ?? '';

  // Extract confidence from analysis_raw (Claude analyzer output).
  // Stored as JSONB; narrow with a typed view rather than `any`.
  // Defensive normalization: the analyzer stores 0-100 after clamp(), but
  // legacy or seeded rows may hold a 0-1 decimal. Anything <= 1 is treated
  // as a decimal and multiplied, so the UI never renders "0.68%".
  const analysisRaw = profileRow.analysis_raw as
    | { confidence?: number }
    | null;
  const rawConfidence =
    typeof analysisRaw?.confidence === 'number' ? analysisRaw.confidence : null;
  // Strict `< 1` so a legitimate integer `1` (meaning 1%) does not get
  // conflated with a legacy `1.0` decimal and multiplied to `100`.
  const confidence =
    rawConfidence == null
      ? null
      : rawConfidence < 1
        ? Math.round(rawConfidence * 100)
        : Math.round(rawConfidence);

  // Number of introspective text inputs that backed the analysis. Surfaced as
  // transparency ("basado en N respuestas") per PAIR Explainability heuristics.
  const inputTextsRaw = profileRow.input_texts as string[] | null;
  const turnsCount = Array.isArray(inputTextsRaw) ? inputTextsRaw.length : null;

  const { data: profileMeta } = await supabase
    .from('profiles')
    .select('full_name, created_at')
    .eq('id', user.id)
    .single();

  const { data: narrativeRow } = await supabase
    .from('narratives')
    .select('content')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: letterRow } = await supabase
    .from('future_letters')
    .select('id, content, unlock_at, written_at')
    .eq('user_id', user.id)
    .order('written_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <DashboardView
      data={{
        fullName: profileMeta?.full_name ?? null,
        createdAt: profileMeta?.created_at ?? profileRow.created_at,
        bigFive,
        jungFunctions,
        archetype,
        secondary,
        profileId: profileRow.id,
        narrativeContent: narrativeRow?.content ?? null,
        confidence,
        turnsCount,
        letter: letterRow ?? null,
      }}
    />
  );
}
