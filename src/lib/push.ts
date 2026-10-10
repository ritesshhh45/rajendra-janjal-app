// Native (Capacitor) push. Fully defensive: never throws, does nothing in a normal browser.
import { supabase } from "@/integrations/supabase/client";
import type { CitizenSession } from "@/lib/session";

const PENDING = "dw_push_pending_token";
const ENABLED = "dw_push_enabled";
const INBOX = "dw_push_inbox";
export const INBOX_EVENT = "dw-push-inbox";

export type InboxItem = { id: string; title: string; body: string; image?: string | null; created_at: string };

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* blocked */ } },
  del: (k: string) => { try { localStorage.removeItem(k); } catch { /* blocked */ } },
};

export const pushEnabled = () => ls.get(ENABLED) !== "0";
export function readInbox(): InboxItem[] {
  try { return JSON.parse(ls.get(INBOX) ?? "[]") as InboxItem[]; } catch { return []; }
}
function addToInbox(n: { id?: string; title?: string; body?: string; data?: Record<string, unknown> }) {
  if (!n.title && !n.body) return;
  const items = readInbox();
  const id = n.id || `${Date.now()}`;
  if (items.some((i) => i.id === id)) return;
  const image = typeof n.data?.["image"] === "string" ? (n.data["image"] as string) : null;
  items.unshift({ id, title: n.title ?? "", body: n.body ?? "", image, created_at: new Date().toISOString() });
  ls.set(INBOX, JSON.stringify(items.slice(0, 50)));
  window.dispatchEvent(new Event(INBOX_EVENT));
}

async function isNative() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform() ? Capacitor : null;
  } catch { return null; }
}

async function saveToken(session: CitizenSession | null, token: string, platform: string) {
  if (!session) { ls.set(PENDING, token); return; }
  const { error } = await supabase.rpc("register_device", { _id: session.id, _token: session.token, _fcm_token: token, _platform: platform });
  if (error) { console.error("[push] save token failed", error); ls.set(PENDING, token); } else ls.del(PENDING);
}

let running = false;
let current: CitizenSession | null = null;

/** Run after the first screen has rendered. Safe to call repeatedly. */
export async function initPush(session: CitizenSession | null, { force = false } = {}) {
  current = session;
  if (running || (!force && !pushEnabled())) return;
  running = true;
  try {
    const Cap = await isNative();
    if (!Cap) return;
    const platform = Cap.getPlatform();
    const pending = ls.get(PENDING);
    if (pending && session) await saveToken(session, pending, platform);

    const { PushNotifications } = await import("@capacitor/push-notifications");
    if (platform === "android") {
      await PushNotifications.createChannel({ id: "default", name: "Ward Updates", importance: 5, visibility: 1 }).catch((e) => console.error("[push] channel", e));
    }
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return;

    await PushNotifications.removeAllListeners();
    await PushNotifications.addListener("registration", ({ value }) => { void saveToken(current, value, platform); });
    await PushNotifications.addListener("registrationError", (e) => console.error("[push] registration error", e));
    await PushNotifications.addListener("pushNotificationReceived", (n) => addToInbox(n));
    await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
      addToInbox(a.notification);
      try { window.location.assign("/updates"); } catch { /* ignore */ }
    });
    await PushNotifications.register();
  } catch (e) {
    console.error("[push] setup failed", e);
  } finally {
    running = false;
  }
}

/** Profile toggle. Turning off unregisters this device from push on the phone. */
export async function setPushEnabled(on: boolean, session: CitizenSession | null) {
  ls.set(ENABLED, on ? "1" : "0");
  try {
    if (on) return await initPush(session, { force: true });
    if (!(await isNative())) return;
    const { PushNotifications } = await import("@capacitor/push-notifications");
    await PushNotifications.removeAllListeners();
    await PushNotifications.unregister();
  } catch (e) {
    console.error("[push] toggle failed", e);
  }
}

/** Hide the native launch screen once the first screen is on display. */
export async function hideNativeSplash() {
  try {
    if (!(await isNative())) return;
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch (e) {
    console.error("[splash] hide failed", e);
  }
}
