'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowClockwise, Footprints } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingDimension';
import { createClient } from '@/lib/supabase/client';
import { ActivityWorkspace } from '@/components/plan/ActivityWorkspace';
import type { DevelopmentArea as Area } from '@/types';


export default function PlanPage() {
  const [planId, setPlanId] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);

      // Demo mode: load seed plan
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        const seed = await import('@/lib/demo/seed');
        setProfileId(seed.DEMO_PROFILE_ID);
        setPlanId('demo-plan-0000-0000-000000000001');
        setAreas(seed.DEMO_PLAN.areas as Area[]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('No autenticado');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('psychological_profiles')
        .select('id, updated_at')
        .eq('user_id', user.id)
        .eq('version', 1)
        .maybeSingle();

      if (!profile) {
        setError('Primero completá el onboarding.');
        setLoading(false);
        return;
      }
      setProfileId(profile.id);

      const { data: existing } = await supabase
        .from('development_plans')
        .select('id, areas')
        .eq('user_id', user.id)
        .eq('profile_id', profile.id)
        .gte('created_at', profile.updated_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        setPlanId(existing.id);
        setAreas(existing.areas as Area[]);
      }
      setLoading(false);
    }
    init();
  }, []);

  async function generatePlan(regenerate: boolean) {
    if (!profileId || profileId.startsWith('demo-') || savingRef.current || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, regenerate }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? 'plan_failed');
      }
      setPlanId(data.data.planId);
      setAreas(data.data.areas);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setGenerating(false);
    }
  }

  async function toggleMicroGoal(areaId: string, actionId: string, goalId: string) {
    if (!areas || !planId || savingRef.current || generating) return;
    const previousAreas = areas;
    setError(null);
    const newAreas = areas.map((area) =>
      area.id !== areaId
        ? area
        : {
            ...area,
            actions: area.actions.map((action) =>
              action.id !== actionId
                ? action
                : {
                    ...action,
                    microGoals: action.microGoals.map((goal) =>
                      goal.id !== goalId ? goal : { ...goal, completed: !goal.completed },
                    ),
                  },
            ),
          },
    );
    setAreas(newAreas);

    // Demo mode: state-only, no persistence
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return;

    savingRef.current = true;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('session_expired');
      const { data: saved, error: saveError } = await supabase.from('development_plans')
        .update({ areas: newAreas }).eq('id', planId).eq('user_id', user.id)
        .select('id').single();
      if (saveError || !saved) throw new Error('save_failed');
    } catch {
      setAreas(previousAreas);
      setError('No pudimos guardar el cambio. Volvimos al estado anterior; podés intentarlo de nuevo.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <LayoutShell>
      <div className="plan-experience flex flex-col gap-8">
        <header className="activity-library-heading">
          <h1>Actividades</h1>
          <p className="experience-lead">Una idea se vuelve un paso.</p>
          <p className="experience-caption">Propuestas de reflexión generadas por IA. Elegí una que te sirva; no hace falta hacerlas todas.</p>
          <p className="activity-library-note"><Footprints size={20} aria-hidden="true" />{isDemo ? 'En este ejemplo, las casillas cambian solo en esta pantalla. No se guarda tu progreso.' : 'Marcá los pasos que hiciste. Tu progreso queda guardado, sin rachas ni metas obligatorias.'}</p>
        </header>

        {loading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        )}

        {!loading && !areas && (
          <Card>
            <p className="font-body text-text-2">
              Todavía no generaste tu plan. Requiere que tu perfil esté listo.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => generatePlan(false)}
                loading={generating}
                disabled={!profileId}
                size="lg"
              >
                Generar mi plan
              </Button>
            </div>
          </Card>
        )}

        {error && (
          <div role="alert" className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
            {error}
          </div>
        )}

        {areas && (
          <>
            <ActivityWorkspace areas={areas} onToggle={toggleMicroGoal} saving={saving || generating} />

            {!isDemo && <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => generatePlan(true)}
                loading={generating}
                disabled={saving}
              >
                <ArrowClockwise size={14} />
                Regenerar plan
              </Button>
            </div>}
          </>
        )}
      </div>
    </LayoutShell>
  );
}
