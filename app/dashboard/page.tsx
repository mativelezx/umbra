import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { ArchetypeCard } from '@/components/dashboard/ArchetypeCard';
import { NarrativeSection } from '@/components/dashboard/NarrativeSection';
import { BigFiveRadar } from '@/components/dashboard/BigFiveRadar';
import { JungFunctions } from '@/components/dashboard/JungFunctions';
import { CartaFuturaCard } from '@/components/dashboard/CartaFuturaCard';
import { Card } from '@/components/ui/Card';
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

  return (
    <LayoutShell>
      <div className="flex flex-col gap-6 md:gap-8">
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

        <ArchetypeCard archetype={data.archetype} secondary={data.secondary} />

        <NarrativeSection
          profileId={data.profileId}
          initialContent={data.narrativeContent}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3 mb-4">
              Big Five
            </p>
            <BigFiveRadar bigFive={data.bigFive} />
          </Card>
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3 mb-4">
              Funciones cognitivas
            </p>
            <JungFunctions jungFunctions={data.jungFunctions} />
          </Card>
        </div>

        {data.letter && (
          <CartaFuturaCard
            letter={data.letter}
            snapshot={{ archetype: data.archetype, jungFunctions: data.jungFunctions }}
          />
        )}
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
        letter: letterRow ?? null,
      }}
    />
  );
}
