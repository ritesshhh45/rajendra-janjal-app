import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.rajendrajanjal.app",
  appName: "Rajendra Janjal",
  webDir: "dist/client",
  server: { androidScheme: "https" },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#FFF9F0",
      showSpinner: false,
      androidScaleType: "CENTER_INSIDE",
      splashFullScreen: false,
      splashImmersive: false,
    },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
  android: { backgroundColor: "#FFF9F0" },
};

export default config;
