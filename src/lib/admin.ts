import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

// Server-side actions (push sending) live on the Lovable-hosted copy; other hosts call it there.
// The admin login token is sent to this host: it MUST be your own deployed project. Set VITE_API_BASE to override.
const PUBLISHED = (import.meta.env["VITE_API_BASE"] as string | undefined) || "https://rajendra-bhau-app.lovable.app";
// Inside the Android app the page itself is served from https://localhost (bundled), which has no
// server routes, so the app must always call the hosted copy.
export const apiBase = () =>
  typeof window !== "undefined" &&
  !Capacitor.isNativePlatform() &&
  /lovable\.app$|lovableproject\.com$|localhost$/.test(window.location.hostname)
    ? ""
    : PUBLISHED;

/** Upload to the media bucket; returns a long-lived link usable by every citizen. */
export async function uploadImage(file: File, folder: string) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 20);
  if (e2 || !data) throw e2 ?? new Error("No link");
  return data.signedUrl;
}

export async function removeImage(url: string | null | undefined) {
  const m = url?.match(/\/object\/sign\/media\/([^?]+)/);
  if (m?.[1]) await supabase.storage.from("media").remove([decodeURIComponent(m[1])]);
}

export async function sendNotification(body: { title: string; message: string; image_url?: string | null }) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`${apiBase()}/api/public/send-notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(body),
  });
  const j = (await res.json().catch(() => ({}))) as { sent?: number; total?: number; error?: string | null };
  if (!res.ok) throw new Error(j.error || `Error ${res.status}`);
  return j;
}

export function errMsg(e: unknown) {
  const m = (e as { message?: string })?.message ?? String(e);
  console.error("[admin]", e);
  return m;
}
