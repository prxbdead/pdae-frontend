import { Redirect } from 'expo-router';

/**
 * Temporary landing: until the session/onboarding guard lands, the app opens
 * on the Learn tab so it is navigable.
 */
export default function Index() {
  return <Redirect href="/learn" />;
}
