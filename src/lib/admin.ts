import { supabase } from "@/integrations/supabase/client";

// Server-side actions (push sending) live on the Lovable-hosted copy; other hosts call it there.
const PUBLISHED = "https://rajendra-janjal-app.lovable.app";
export const apiBase = () =>
  typeof window !== "undefined" && /lovable\.app$|lovableproject\.com$|localhost$/.test(window.location.hostname)
    ? ""
    : PUBLISHED;

/** Resize in the browser and convert to WebP so big phone photos never reach storage. */
export async function compressImage(file: File, maxWidth: number): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bmp.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.8));
  return blob && blob.size < file.size ? blob : file;
}

/** Upload to the media bucket; returns a long-lived link usable by every citizen. */
export async function uploadImage(file: File, folder: string) {
  const blob = await compressImage(file, folder === "gallery" ? 1280 : 1080);
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, blob, { contentType: blob.type || file.type, upsert: false });
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
