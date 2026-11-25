import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SETTINGS_STORAGE_KEY = 'hodlo:v1:settings';

export type ThemeMode = 'system' | 'light' | 'dark';
export type FontMode = 'nunito' | 'system';
export type NotificationFrequency = 'daily' | 'weekly';

export interface SettingsValues {
  themeMode: ThemeMode;
  reducedMotion: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  fontMode: FontMode;
  notificationsEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  notificationsPausedUntil: string | null;
}

export interface SettingsState extends SettingsValues {
  /** True once the persisted settings have been read from storage. */
  hydrated: boolean;
  setSetting: <K extends keyof SettingsValues>(
    key: K,
    value: SettingsValues[K],
  ) => void;
  hydrate: () => Promise<void>;
}

const defaultSettings: SettingsValues = {
  themeMode: 'system',
  reducedMotion: false,
  soundEnabled: false,
  hapticsEnabled: true,
  fontMode: 'nunito',
  notificationsEnabled: false,
  notificationFrequency: 'daily',
  notificationsPausedUntil: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      hydrated: false,
      setSetting: (key, value) =>
        set({ [key]: value } as Partial<SettingsState>),
      hydrate: async () => {
        await useSettingsStore.persist.rehydrate();
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        reducedMotion: state.reducedMotion,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        fontMode: state.fontMode,
        notificationsEnabled: state.notificationsEnabled,
        notificationFrequency: state.notificationFrequency,
        notificationsPausedUntil: state.notificationsPausedUntil,
      }),
      onRehydrateStorage: () => () => {
        useSettingsStore.setState({ hydrated: true });
      },
    },
  ),
);
