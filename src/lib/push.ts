// Native (Capacitor) push registration. Does nothing in a normal browser.
import { supabase } from "@/integrations/supabase/client";
import type { CitizenSession } from "@/lib/session";

export async function registerPush(session: CitizenSession) {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;
    // Without Firebase (android/app/google-services.json) PushNotifications.register() crashes the app.
    // build-app.mjs sets VITE_ENABLE_PUSH=true automatically when that file exists.
    if (import.meta.env["VITE_ENABLE_PUSH"] !== "true") return;
    const { PushNotifications } = await import("@capacitor/push-notifications");
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt") perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return;
    await PushNotifications.removeAllListeners();
    await PushNotifications.addListener("registration", async ({ value }) => {
      const { error } = await supabase.rpc("register_device", {
        _id: session.id, _token: session.token, _fcm_token: value, _platform: Capacitor.getPlatform(),
      });
      if (error) console.error("[push] save token failed", error);
    });
    await PushNotifications.addListener("registrationError", (e) => console.error("[push] registration error", e));
    await PushNotifications.register();
  } catch (e) {
    console.error("[push] setup failed", e);
  }
}

/** Hide the native Android splash once the web splash is painted. Safe no-op in a browser. */
export async function hideNativeSplash() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 150 });
  } catch {
    /* ignore */
  }
}
