import type { UserProfile } from '@/api/contracts';
import {
  useSessionStore,
  type SessionStatus,
} from '@/auth/sessionStore';

export interface SessionValue {
  status: SessionStatus;
  user: UserProfile | null;
  isOffline: boolean;
  updateUser(user: UserProfile): void;
  signOut(): Promise<void>;
}

export function useSession(): SessionValue {
  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.user);
  const isOffline = useSessionStore((state) => state.isOffline);
  const updateUser = useSessionStore((state) => state.updateUser);
  const signOut = useSessionStore((state) => state.signOut);

  return { status, user, isOffline, updateUser, signOut };
}
