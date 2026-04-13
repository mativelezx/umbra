'use client';

import { create } from 'zustand';
import type { PsychologicalProfile, Narrative } from '@/types';

interface ProfileStore {
  profile: PsychologicalProfile | null;
  narrative: string | null;
  loading: boolean;
  setProfile: (profile: PsychologicalProfile | null) => void;
  setNarrative: (narrative: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  narrative: null,
  loading: false,
  setProfile: (profile) => set({ profile }),
  setNarrative: (narrative) => set({ narrative }),
  setLoading: (loading) => set({ loading }),
}));
