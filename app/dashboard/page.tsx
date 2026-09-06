import { redirect } from 'next/navigation';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { createClient } from '@/lib/supabase/server';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { ArchetypeCard } from '@/components/dashboard/ArchetypeCard';
import { NarrativeSection } from '@/components/dashboard/NarrativeSection';
import { DashboardDepth } from '@/components/dashboard/DashboardDepth';
import { BigFiveDimensions } from '@/components/dashboard/BigFiveDimensions';
import { JungAxisView } from '@/components/dashboard/JungAxisView';
import { QuickGlance } from '@/components/dashboard/QuickGlance';
import { ArchetypeMap } from '@/components/dashboard/ArchetypeMap';
import { CartaFuturaCard } from '@/components/dashboard/CartaFuturaCard';
import { Card } from '@/components/ui/Card';
import { ARCHETYPE_INFO } from '@/types';
import type { Archetype, BigFive, JungFunctions as JF } from '@/types';
import {
  extractPerDimensionStatus,
  RIDGE_V1_STATUS,
  type PerDimensionStatus,
} from '@/lib/profile/dimension-display';
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
  perDimensionStatus: PerDimensionStatus;
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
      <div className="flex flex-col gap-6 md:gap-8">
        {/* HEADER */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div>
            <h1 className="mt-2 text-balance font-heading font-bold text-4xl not-italic text-text-1 md:text-5xl">
              Mi resultado
            </h1>
            <p className="mt-2 max-w-xl text-pretty font-body text-base text-text-3">
              {data.fullName ? `${data.fullName.split(' ')[0]}, esta` : 'Esta'} es una lectura para explorar con calma. Partí de lo que te resuena y volvé a tus respuestas cuando lo necesites.
            </p>
            <p className="mt-3 font-body text-xs tabular-nums text-text-4">
              {data.profileId.startsWith('demo-') ? 'Resultado ilustrativo · datos ficticios' : `Cuenta creada hace ${createdDays} ${createdDays === 1 ? 'día' : 'días'}`}
            </p>
          </div>
        </div>

        {/* ARCHETYPE HERO */}
        <ArchetypeCard
          archetype={data.archetype}
          secondary={data.secondary}
          confidence={data.confidence}
          turnsCount={data.turnsCount}
        />

        <a href="/plan" className="group flex items-center justify-between gap-5 rounded-2xl bg-white p-5 transition-colors hover:bg-umbra-shadow md:p-6">
          <span><span className="block text-lg font-bold">Ver actividades</span><span className="mt-1 block text-sm text-text-2">Elegí una propuesta y empezá por un paso pequeño.</span></span>
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-text-1 text-white"><ArrowRight size={20} /></span>
        </a>

        {/* Sources stay visibly separate from the symbolic reading. */}
        <div className="dash-enter dash-enter-2 rounded-2xl border border-violet-400/15 p-5 md:p-6">
        <QuickGlance
          bigFive={data.bigFive}
          jungFunctions={data.jungFunctions}
          archetypeName={archetypeName}
          confidence={data.confidence}
          turnsCount={data.turnsCount}
          perDimensionStatus={data.perDimensionStatus}
        />
        </div>

        {/* NARRATIVA — sectioned with iconography + sticky TOC on desktop.
            TOC only renders when the narrative has at least one `##` heading,
            because legacy narratives (pre-5-section prompt) parse as a single
            fallback block with no section ids to spy on — rendering the TOC
            anyway would leave it pointing at nothing. */}
        <div className="dash-enter dash-enter-3">
        {data.narrativeContent && /^##\s+/m.test(data.narrativeContent) ? (
          <div>
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

        {/* VISTA PROFUNDA — opt-in progressive disclosure.
            El usuario ve el archetype hero + quick glance + narrativa por
            default. Los datos más densos (radar Big Five, 4 ejes Jung,
            mapa comparativo de arquetipos, carta futura) se revelan al
            expandir. Reduce carga cognitiva inicial y crea un momento de
            "exploración elegida" en vez de bombardeo. */}
        </div>

        <div className="dash-enter dash-enter-4">
        <DashboardDepth collapsedLabel="Ver detalles del resultado" expandedLabel="Ocultar detalles del resultado">
          {/* DATA VIZ — 2 columns */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <p className="font-body text-sm normal-case tracking-normal text-text-3">
                Cinco grandes rasgos
              </p>
              <p className="mt-2 max-w-prose text-pretty font-body text-sm leading-relaxed text-text-2">
                Las cinco dimensiones del modelo Big Five (también llamado OCEAN). Solo mostramos la cifra de las dimensiones que el módulo de análisis midió con la confianza comprometida; las demás se declaran con su estado, sin número. No son percentiles ni diagnósticos.
              </p>
              <div className="mt-4">
                <BigFiveDimensions bigFive={data.bigFive} status={data.perDimensionStatus} />
              </div>
            </Card>
            <Card>
              <p className="font-body text-sm normal-case tracking-normal text-text-3">
                Cómo procesás la información
              </p>
              <p className="mt-2 max-w-prose text-pretty font-body text-sm leading-relaxed text-text-2">
                Una lectura inspirada en las ocho funciones cognitivas que describió Jung en 1921. Lo usamos como espejo interpretativo, no como tipología cerrada.
              </p>
              <div className="mt-4">
                <JungAxisView jungFunctions={data.jungFunctions} />
              </div>
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
          perDimensionStatus: RIDGE_V1_STATUS,
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

  const supabase = await createClient();
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
  const perDimensionStatus = extractPerDimensionStatus(profileRow.analysis_raw);
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
        perDimensionStatus,
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
