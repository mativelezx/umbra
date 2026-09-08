import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { ArchetypeCard } from '@/components/dashboard/ArchetypeCard';
import { NarrativeSection } from '@/components/dashboard/NarrativeSection';
import { BigFiveDimensions } from '@/components/dashboard/BigFiveDimensions';
import { JungAxisView } from '@/components/dashboard/JungAxisView';
import { ArchetypeMap } from '@/components/dashboard/ArchetypeMap';
import { CartaFuturaCard } from '@/components/dashboard/CartaFuturaCard';
import { ProfileWorkspace } from '@/components/dashboard/ProfileWorkspace';
import { SelfReportSummary } from '@/components/assessment/SelfReportSummary';
import { extractSelfReport } from '@/lib/assessment/bfi2s';
import { Info } from '@phosphor-icons/react/dist/ssr';
import styles from '@/components/dashboard/DashboardExperience.module.css';
import type { Archetype, BigFive, BigFiveSelfReport, JungFunctions as JF } from '@/types';
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
  selfReport?: BigFiveSelfReport | null;
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
  return (
    <LayoutShell>
      <header className={styles.pageHeading}>
        <h1>Mi resultado</h1>
        <p><Info size={18} aria-hidden="true" /><span>Tus respuestas al cuestionario y la interpretación de IA se muestran por separado. No es una evaluación clínica ni una medida de tu valor personal.</span></p>
      </header>
      <ProfileWorkspace
        firstName={data.fullName?.split(' ')[0]}
        questionnaire={<SelfReportSummary report={data.selfReport ?? null} />}
        reading={<NarrativeSection profileId={data.profileId} initialContent={data.narrativeContent} />}
        measurement={<BigFiveDimensions bigFive={data.bigFive} status={data.perDimensionStatus} hasSelfReport={Boolean(data.selfReport)} />}
        interpretation={<div className="symbolic-view">
          <div className="mb-7"><h2 className="focus-title">Una mirada simbólica</h2><p className="mt-4 max-w-2xl text-text-2">Jung y los arquetipos aportan un lenguaje para explorar el texto. Son interpretaciones de IA, no mediciones ni identidades que tengas que aceptar.</p></div>
          <ArchetypeCard archetype={data.archetype} secondary={data.secondary} />
          <details className="activity-rationale">
            <summary>Explorar funciones cognitivas y otros arquetipos</summary>
            <p className="my-5 text-sm text-text-2">Las intensidades de esta lectura son heurísticas del modelo generativo: no tienen respaldo psicométrico.</p>
            <JungAxisView jungFunctions={data.jungFunctions} />
            <div className="mt-8"><ArchetypeMap userArchetype={data.archetype} /></div>
          </details>
          {data.letter && <div className="mt-8"><CartaFuturaCard example={isDemoMode()} letter={data.letter} snapshot={{ archetype: data.archetype, jungFunctions: data.jungFunctions }} /></div>}
        </div>}
      />
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
    .eq('profile_id', profileRow.id)
    .gte('created_at', profileRow.updated_at)
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
        selfReport: extractSelfReport(profileRow.analysis_raw),
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
