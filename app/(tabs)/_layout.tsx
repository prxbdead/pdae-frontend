import { Slot } from 'expo-router';

import { AppShell } from '@/components/layout/AppShell';

export default function TabsLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
