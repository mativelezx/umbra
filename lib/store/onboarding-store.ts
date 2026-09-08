'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InsightPing,
  OnboardingTurn,
  WorkingProfile,
} from '@/types';

interface OnboardingStore {
  ownerId: string | null;
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
  bindUser: (userId: string | null) => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ownerId: null,
      sessionId: null,
      turns: [],
      workingProfile: null,
      insights: [],
      done: false,

      bindUser: (ownerId) => set((state) => ownerId && state.ownerId === ownerId ? state : {
        ownerId, sessionId: null, turns: [], workingProfile: null, insights: [], done: false,
      }),

      startSession: (sessionId) =>
        set({ sessionId, turns: [], workingProfile: null, insights: [], done: false }),
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
        ownerId: state.ownerId,
        sessionId: state.sessionId,
        turns: state.turns,
        workingProfile: state.workingProfile,
        done: state.done,
      }),
    },
  ),
);
