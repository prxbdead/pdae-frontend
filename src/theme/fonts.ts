import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';

export interface AppFontsState {
  loaded: boolean;
  error: Error | null;
}

/**
 * Loads the five Nunito weights used by the type scale. Callers should keep
 * the splash visible until `loaded` is true and fall back to system fonts when
 * `error` is set rather than blocking the app.
 */
export function useAppFonts(): AppFontsState {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  return { loaded, error: error ?? null };
}
