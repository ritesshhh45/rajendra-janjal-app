
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.rajendrajanjal.app',
  appName: 'Rajendra Janjal',
  webDir: 'capacitor-www',
  server: {
    url: 'https://rajendra-janjal-app.vercel.app/home',
    cleartext: false
  }
};

export default config;
