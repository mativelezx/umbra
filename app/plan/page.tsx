'use client';

import { useEffect, useState } from 'react';
import { ArrowClockwise, Check } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingDimension';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface MicroGoal {
  id: string;
  text: string;
  completed: boolean;
}

interface Action {
  id: string;
  title: string;
  description: string;
  microGoals: MicroGoal[];
}

interface Area {
  id: string;
  name: string;
  rationale: string;
  actions: Action[];
}

export default function PlanPage() {
  const [planId, setPlanId] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

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
    if (!profileId) return;
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
      <div className="flex flex-col gap-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3">
            Tu plan de desarrollo
          </p>
          <h1 className="mt-2 text-balance font-display text-4xl italic text-text-1 md:text-5xl">
            Caminos para explorar
          </h1>
          <p className="mt-3 max-w-2xl text-pretty font-body text-lg leading-relaxed text-text-2">
            Tres áreas de crecimiento, pensadas a partir de tu perfil. Pequeños pasos chequeables. Ningún plazo te apura — el ritmo lo ponés vos. Tildá los pasos a medida que los hacés; se guardan solos.
          </p>
        </div>

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
            <div className="flex flex-col gap-6">
              {areas.map((area, index) => (
                <article key={area.id} className="card-glow rounded-lg p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-violet-400/15 font-display text-2xl text-violet-200">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-2xl italic text-text-1 md:text-3xl">
                        {area.name}
                      </h2>
                      <p className="mt-2 font-body text-sm text-text-2">
                        {area.rationale}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-5">
                    {area.actions.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-md border border-violet-400/10 bg-umbra-shadow/30 p-5"
                      >
                        <h3 className="font-heading text-sm font-semibold text-text-1">
                          {action.title}
                        </h3>
                        <p className="mt-1 font-body text-sm text-text-2">
                          {action.description}
                        </p>
                        <ul className="mt-4 flex flex-col gap-2">
                          {action.microGoals.map((goal) => (
                            <li key={goal.id}>
                              <label
                                className={cn(
                                  'flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2 text-left transition-colors',
                                  goal.completed
                                    ? 'bg-accent-emerald/5 text-text-2 hover:bg-accent-emerald/10'
                                    : 'hover:bg-violet-400/5',
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={goal.completed}
                                  onChange={() =>
                                    toggleMicroGoal(area.id, action.id, goal.id)
                                  }
                                />
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-umbra-void',
                                    goal.completed
                                      ? 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald'
                                      : 'border-violet-400/40',
                                  )}
                                >
                                  {goal.completed && <Check size={12} weight="bold" />}
                                </span>
                                <span
                                  className={cn(
                                    'font-body text-sm',
                                    goal.completed && 'line-through',
                                  )}
                                >
                                  {goal.text}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={() => generatePlan(true)}
                loading={generating}
              >
                <ArrowClockwise size={14} />
                Regenerar plan
              </Button>
            </div>
          </>
        )}
      </div>
    </LayoutShell>
  );
}
