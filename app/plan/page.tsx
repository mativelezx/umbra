'use client';

import { useEffect, useState } from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingDimension';
import { createClient } from '@/lib/supabase/client';
import { ReflectionArt } from '@/components/ui/ReflectionArt';
import { ActivityWorkspace } from '@/components/plan/ActivityWorkspace';
import type { DevelopmentArea as Area } from '@/types';


export default function PlanPage() {
  const [planId, setPlanId] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
        .select('id')
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
    if (!profileId || profileId.startsWith('demo-')) return;
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
    if (!areas || !planId) return;
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

    const supabase = createClient();
    await supabase.from('development_plans').update({ areas: newAreas }).eq('id', planId);
  }

  return (
    <LayoutShell>
      <div className="plan-experience flex flex-col gap-8">
        <header className="experience-heading">
          <div>
          <h1>
            Actividades
          </h1>
          <p className="experience-lead">Lo que leíste,<br />en un pequeño paso.</p>
          <p className="experience-caption">Propuestas de reflexión generadas por IA. Elegí una que te sirva; no hace falta hacerlas todas.</p>
          <p className="mt-4 text-sm text-text-3">{isDemo ? 'En este ejemplo, las casillas cambian solo en esta pantalla. No se guarda tu progreso.' : 'Podés marcar los pasos que hiciste. No hay rachas ni metas obligatorias.'}</p>
          </div>
          <div className="reflection-composition activity-heading-art" aria-hidden="true"><ReflectionArt variant="steps" reveal /></div>
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
          <div className="rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
            {error}
          </div>
        )}

        {areas && (
          <>
            <ActivityWorkspace areas={areas} onToggle={toggleMicroGoal} />

            {!isDemo && <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => generatePlan(true)}
                loading={generating}
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
