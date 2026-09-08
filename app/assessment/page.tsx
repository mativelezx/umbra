import { redirect } from 'next/navigation';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { AssessmentEntry } from '@/components/assessment/AssessmentEntry';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode, DEMO_PROFILE_ID } from '@/lib/demo/seed';
import { extractSelfReport } from '@/lib/assessment/bfi2s';

export const dynamic = 'force-dynamic';
export default async function AssessmentPage() {
  if (isDemoMode()) return <LayoutShell><AssessmentEntry profileId={DEMO_PROFILE_ID} existing={false} /></LayoutShell>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: consent, error: consentError } = await supabase.from('consent_records').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  if (consentError || !consent) redirect('/consent');
  const { data: profile, error } = await supabase.from('psychological_profiles').select('id, analysis_raw').eq('user_id', user.id).eq('version', 1).maybeSingle();
  if (error) return <LayoutShell><p role="alert">No pudimos cargar tu perfil. Volvé a intentar en un momento.</p></LayoutShell>;
  if (!profile) redirect('/onboarding');
  return <LayoutShell><AssessmentEntry key={user.id} profileId={profile.id} existing={!!extractSelfReport(profile.analysis_raw)} /></LayoutShell>;
}
