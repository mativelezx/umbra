import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatShell, type ChatShellProfile } from '@/components/chat/ChatShell';
import type { Archetype, BigFive, JungFunctions } from '@/types';
import { extractPerDimensionStatus } from '@/lib/profile/dimension-display';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: profileMeta }, { data: profileRow }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase
      .from('psychological_profiles')
      .select(
        'openness, conscientiousness, extraversion, agreeableness, neuroticism, jung_functions, archetype, analysis_raw',
      )
      .eq('user_id', user.id)
      .eq('version', 1)
      .maybeSingle(),
  ]);

  let profile: ChatShellProfile | null = null;
  if (profileRow) {
    const bigFive: BigFive = {
      openness: profileRow.openness ?? 50,
      conscientiousness: profileRow.conscientiousness ?? 50,
      extraversion: profileRow.extraversion ?? 50,
      agreeableness: profileRow.agreeableness ?? 50,
      neuroticism: profileRow.neuroticism ?? 50,
    };
    const jungFunctions: JungFunctions =
      (profileRow.jung_functions as JungFunctions) ?? {
        Se: 50,
        Si: 50,
        Ne: 50,
        Ni: 50,
        Te: 50,
        Ti: 50,
        Fe: 50,
        Fi: 50,
      };
    profile = {
      firstName: profileMeta?.full_name?.split(' ')[0] ?? null,
      perDimensionStatus: extractPerDimensionStatus(profileRow.analysis_raw),
      archetype: (profileRow.archetype ?? 'sage') as Archetype,
      bigFive,
      jungFunctions,
    };
  }

  return <ChatShell profile={profile} />;
}
