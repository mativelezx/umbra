'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingMode } from '@/types';

interface OnboardingStore {
  mode: OnboardingMode | null;
  currentStep: number;
  texts: Record<string, string>;
  freeText: string;
  setMode: (mode: OnboardingMode) => void;
  setStep: (step: number) => void;
  setAreaText: (key: string, text: string) => void;
  setFreeText: (text: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      mode: null,
      currentStep: 0,
      texts: {},
      freeText: '',
      setMode: (mode) => set({ mode, currentStep: 0 }),
      setStep: (step) => set({ currentStep: step }),
      setAreaText: (key, text) =>
        set((state) => ({ texts: { ...state.texts, [key]: text } })),
      setFreeText: (text) => set({ freeText: text }),
      reset: () =>
        set({ mode: null, currentStep: 0, texts: {}, freeText: '' }),
    }),
    {
      name: 'umbra-onboarding',
      partialize: (state) => ({
        mode: state.mode,
        currentStep: state.currentStep,
        texts: state.texts,
        freeText: state.freeText,
      }),
    },
  ),
);
