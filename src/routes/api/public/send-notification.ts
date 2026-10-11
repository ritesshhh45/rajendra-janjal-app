import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

// Admin-only: called from the admin panel (also cross-origin from the Vercel copy of the app).
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const schema = z.object({
  title: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(1000),
  image_url: z.string().url().max(2000).nullable().optional(),
});

export const Route = createFileRoute("/api/public/send-notification")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const jwt = request.headers.get("authorization")?.replace(/^Bearer /, "");
        if (!jwt || jwt.split(".").length !== 3) return json({ error: "Unauthorized" }, 401);
        const url = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const userClient = createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${jwt}` } },
        });
        const { data: claims } = await userClient.auth.getClaims(jwt);
        const uid = claims?.claims?.sub;
        if (!uid) return json({ error: "Unauthorized" }, 401);
        const { data: isAdmin } = await userClient.rpc("is_admin", { _uid: uid });
        if (!isAdmin) return json({ error: "Forbidden" }, 403);

        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "Invalid input" }, 400);
        const { title, message, image_url } = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { FcmNotConfigured, sendToTokens } = await import("@/lib/fcm.server");
        const { data: rows } = await supabaseAdmin.from("device_tokens").select("fcm_token");
        const tokens = (rows ?? []).map((r) => r.fcm_token);

        let result = { sent: 0, dead: [] as string[], failed: 0 };
        let fcmError: string | null = null;
        try {
          if (tokens.length) result = await sendToTokens(tokens, { title, body: message, image: image_url ?? null });
          else if (!process.env["FCM_SERVICE_ACCOUNT"]) throw new FcmNotConfigured();
        } catch (e) {
          fcmError = e instanceof FcmNotConfigured ? "FCM not configured" : (e as Error).message;
          console.error("[send-notification]", fcmError);
        }
        if (result.dead.length) await supabaseAdmin.from("device_tokens").delete().in("fcm_token", result.dead);
        // The notice is always saved so it shows in the citizen app's Updates.
        await supabaseAdmin.from("notifications").insert({ title, message, image_url: image_url ?? null, type: "manual" });
        return json({ sent: result.sent, total: tokens.length, removed: result.dead.length, error: fcmError });
      },
    },
  },
});
