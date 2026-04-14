'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InsightPing,
  OnboardingTurn,
  WorkingProfile,
} from '@/types';

interface OnboardingStore {
  sessionId: string | null;
  turns: OnboardingTurn[];
  workingProfile: WorkingProfile | null;
  insights: InsightPing[];
  done: boolean;

  startSession: (sessionId: string) => void;
  setTurns: (turns: OnboardingTurn[]) => void;
  applyProfileUpdate: (wp: WorkingProfile) => void;
  pushInsights: (pings: InsightPing[]) => void;
  clearInsights: () => void;
  markDone: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      sessionId: null,
      turns: [],
      workingProfile: null,
      insights: [],
      done: false,

      startSession: (sessionId) =>
        set({ sessionId, turns: [], insights: [], done: false }),
      setTurns: (turns) => set({ turns }),
      applyProfileUpdate: (wp) => set({ workingProfile: wp }),
      pushInsights: (pings) =>
        set((state) => ({ insights: [...state.insights, ...pings].slice(-6) })),
      clearInsights: () => set({ insights: [] }),
      markDone: () => set({ done: true }),
      reset: () =>
        set({
          sessionId: null,
          turns: [],
          workingProfile: null,
          insights: [],
          done: false,
        }),
    }),
    {
      name: 'umbra-onboarding',
      partialize: (state) => ({
        sessionId: state.sessionId,
        turns: state.turns,
        workingProfile: state.workingProfile,
        done: state.done,
      }),
    },
  ),
);
