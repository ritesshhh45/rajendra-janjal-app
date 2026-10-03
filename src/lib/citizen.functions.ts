import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const auth = z.object({ id: z.string().uuid(), token: z.string().uuid() });

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  address: z.string().trim().min(3).max(500),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  device_id: z.string().max(100).optional(),
});

// Registration step. When OTP is added, verify it here before issuing a session.
export const registerCitizen = createServerFn({ method: "POST" })
  .inputValidator((d) => registerSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("citizens")
      .select("id, session_token")
      .eq("mobile", data.mobile)
      .maybeSingle();
    if (existing) return { id: existing.id, token: existing.session_token, existing: true };
    const { data: row, error } = await supabaseAdmin
      .from("citizens")
      .insert({ ...data, device_id: data.device_id ?? null })
      .select("id, session_token")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, token: row.session_token, existing: false };
  });

async function loadCitizen(id: string, token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("citizens")
    .select("id, name, mobile, address, dob, created_at")
    .eq("id", id)
    .eq("session_token", token)
    .maybeSingle();
  return { supabaseAdmin, citizen: data };
}

export const getMe = createServerFn({ method: "POST" })
  .inputValidator((d) => auth.parse(d))
  .handler(async ({ data }) => (await loadCitizen(data.id, data.token)).citizen);

export const updateMe = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    auth
      .extend({ name: z.string().trim().min(2).max(100), address: z.string().trim().min(3).max(500) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, citizen } = await loadCitizen(data.id, data.token);
    if (!citizen) throw new Error("Not found");
    const { error } = await supabaseAdmin
      .from("citizens")
      .update({ name: data.name, address: data.address })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMe = createServerFn({ method: "POST" })
  .inputValidator((d) => auth.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin, citizen } = await loadCitizen(data.id, data.token);
    if (!citizen) return { ok: true };
    await supabaseAdmin.from("device_tokens").delete().eq("citizen_id", data.id);
    await supabaseAdmin.from("citizens").delete().eq("id", data.id);
    return { ok: true };
  });
