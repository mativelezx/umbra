import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { ArchetypeCard } from '@/components/dashboard/ArchetypeCard';
import { NarrativeSection } from '@/components/dashboard/NarrativeSection';
import { BigFiveRadar } from '@/components/dashboard/BigFiveRadar';
import { JungFunctions } from '@/components/dashboard/JungFunctions';
import { CartaFuturaCard } from '@/components/dashboard/CartaFuturaCard';
import { Card } from '@/components/ui/Card';
import { ARCHETYPE_INFO } from '@/types';
import type { Archetype, BigFive, JungFunctions as JF } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
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

  const createdDays = profileMeta?.created_at
    ? Math.floor(
        (Date.now() - new Date(profileMeta.created_at).getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <LayoutShell>
      <div className="flex flex-col gap-6 md:gap-8">
        {/* Greeting */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Hola{profileMeta?.full_name ? `, ${profileMeta.full_name.split(' ')[0]}` : ''}
          </p>
          <h1 className="mt-2 font-display text-4xl italic text-text-1 md:text-5xl">
            Tu perfil interior
          </h1>
          <p className="mt-1 font-mono text-xs text-text-4">
            Analizaste hace {createdDays} {createdDays === 1 ? 'día' : 'días'}
          </p>
        </div>

        {/* PRIMARY — archetype */}
        <ArchetypeCard archetype={archetype} secondary={secondary} />

        {/* SECONDARY — narrative */}
        <NarrativeSection
          profileId={profileRow.id}
          initialContent={narrativeRow?.content ?? null}
        />

        {/* TERTIARY — radar + Jung (2-col on desktop) */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3 mb-4">
              Big Five
            </p>
            <BigFiveRadar bigFive={bigFive} />
          </Card>
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3 mb-4">
              Funciones cognitivas
            </p>
            <JungFunctions jungFunctions={jungFunctions} />
          </Card>
        </div>

        {/* QUATERNARY — carta al futuro */}
        {letterRow && (
          <CartaFuturaCard
            letter={letterRow}
            snapshot={{ archetype, jungFunctions }}
          />
        )}
      </div>
    </LayoutShell>
  );
}
