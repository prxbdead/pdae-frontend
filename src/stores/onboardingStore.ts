import { create } from 'zustand';

export interface OnboardingState {
  completed: boolean;
  markCompleted(): void;
  reset(): void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  completed: false,
  markCompleted: () => set({ completed: true }),
  reset: () => set({ completed: false }),
}));
