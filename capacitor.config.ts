import type { CapacitorConfig } from '@capacitor/cli';

// The app UI is bundled inside the APK (capacitor-www), so it opens instantly and works offline.
// Data comes from Supabase and is cached locally for offline use.
const config: CapacitorConfig = {
  appId: 'in.rajendrajanjal.app',
  appName: 'Rajendra Janjal',
  webDir: 'capacitor-www',
  android: { allowMixedContent: false },
  plugins: {
    SplashScreen: { launchAutoHide: true, launchShowDuration: 3000, launchFadeOutDuration: 150 },
  },
};

export default config;
