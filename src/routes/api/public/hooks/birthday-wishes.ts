import { createFileRoute } from "@tanstack/react-router";

// Called daily at 8:00 AM IST by the scheduler. Idempotent: a citizen gets at most one wish per day,
// so replaying the call never sends duplicates.
export const Route = createFileRoute("/api/public/hooks/birthday-wishes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Verifies the real cron secret (LOVABLE_CRON_SECRET). Before, ANY "Bearer x" header was accepted.
        const { authenticateCronRequest } = await import("@/integrations/supabase/cron-auth");
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { FcmNotConfigured, sendToTokens } = await import("@/lib/fcm.server");

        // Today's date in India
        const ist = new Date(Date.now() + 5.5 * 3600_000);
        const y = ist.getUTCFullYear(), m = ist.getUTCMonth() + 1, d = ist.getUTCDate();
        const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        const dayStartUtc = new Date(Date.UTC(y, m - 1, d) - 5.5 * 3600_000).toISOString();

        const { data: citizens } = await supabaseAdmin.from("citizens").select("id, name, dob").not("dob", "is", null);
        const todays = (citizens ?? []).filter((c) => {
          const [, cm, cd] = String(c.dob).split("-").map(Number);
          if (cm === m && cd === d) return true;
          return !leap && m === 2 && d === 28 && cm === 2 && cd === 29;
        });
        if (!todays.length) return Response.json({ wished: 0, sent: 0 });

        const { data: already } = await supabaseAdmin
          .from("notifications").select("citizen_id").eq("type", "birthday").gte("created_at", dayStartUtc)
          .in("citizen_id", todays.map((c) => c.id));
        const done = new Set((already ?? []).map((r) => r.citizen_id));

        let wished = 0, sent = 0;
        let fcmError: string | null = null;
        for (const c of todays.filter((c) => !done.has(c.id))) {
          const title = `वाढदिवसाच्या हार्दिक शुभेच्छा ${c.name}! 🎂`;
          const message = "आपणास आरोग्यदायी आणि आनंदी वर्षाच्या शुभेच्छा. - राजेंद्र जंजाळ, उपमहापौर";
          await supabaseAdmin.from("notifications").insert({ title, message, type: "birthday", citizen_id: c.id });
          wished++;
          const { data: toks } = await supabaseAdmin.from("device_tokens").select("fcm_token").eq("citizen_id", c.id);
          if (!toks?.length || fcmError) continue;
          try {
            const r = await sendToTokens(toks.map((t) => t.fcm_token), { title, body: message });
            sent += r.sent;
            if (r.dead.length) await supabaseAdmin.from("device_tokens").delete().in("fcm_token", r.dead);
          } catch (e) {
            fcmError = e instanceof FcmNotConfigured ? "FCM not configured" : (e as Error).message;
          }
        }
        return Response.json({ wished, sent, error: fcmError });
      },
    },
  },
});
