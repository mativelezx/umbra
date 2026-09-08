'use client';
import { useRouter } from 'next/navigation';
import { SelfReportForm } from './SelfReportForm';
import { useAuth } from '@/lib/providers/auth-context';
export function AssessmentEntry({ profileId, existing }: { profileId: string; existing: boolean }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (!demo && loading) return <p role="status">Verificando tu sesión…</p>;
  if (!demo && !user) return <p role="status">Iniciá sesión para responder.</p>;
  return <SelfReportForm key={demo ? 'demo' : user?.id} profileId={profileId} existing={existing} onContinue={() => { router.push('/dashboard'); router.refresh(); }} />;
}
