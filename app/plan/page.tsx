'use client';

import { useEffect, useState } from 'react';
import { ArrowClockwise, Check } from '@phosphor-icons/react';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingDimension';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { ReflectionArt } from '@/components/ui/ReflectionArt';

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
      <div className="flex flex-col gap-8">
        <div className="relative">
          <ReflectionArt variant="steps" className="float-right ml-5 w-20 md:w-28" />
          <h1 className="mt-2 text-balance font-heading font-bold text-4xl text-text-1 md:text-5xl">
            Actividades
          </h1>
          <p className="mt-3 max-w-2xl text-pretty font-body text-lg leading-relaxed text-text-2">
            Elegí una propuesta y empezá por un paso pequeño. Son sugerencias de reflexión generadas por IA a partir de tu perfil; el ritmo lo ponés vos.
          </p>
          <p className="mt-4 text-sm text-text-3">{isDemo ? 'En este ejemplo, las casillas cambian solo en esta pantalla. No se guarda tu progreso.' : 'Marcá los pasos que completaste para actualizar tu progreso.'}</p>
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
              {areas.map((area) => (
                <article key={area.id} className="border-t border-violet-400/20 py-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h2 className="font-heading font-semibold text-2xl not-italic text-text-1 md:text-3xl">
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
                        className="rounded-lg bg-white p-5 md:p-6"
                      >
                        <h3 className="font-heading text-lg font-bold text-text-1">
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
                                  'flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-md px-3 py-3 text-left transition-colors',
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
                                    'goal-mark mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-umbra-void',
                                    goal.completed
                                      ? 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald'
                                      : 'border-violet-400/40',
                                  )}
                                >
                                  {goal.completed && <span className="goal-check inline-flex"><Check size={12} weight="bold" /></span>}
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
