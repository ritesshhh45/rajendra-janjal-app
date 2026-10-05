// Citizen actions run as database functions via the public client, so they work on any host
// (Lovable, Vercel, etc.) without server secrets. Identity = citizen id + session token.
import { supabase } from "@/integrations/supabase/client";

type Auth = { id: string; token: string };
type PgErr = { message?: string; code?: string; details?: string; hint?: string } | null;

export class CitizenError extends Error {
  constructor(public kind: "network" | "permission" | "mobile" | "other", message: string) {
    super(message);
  }
}

function fail(error: PgErr | unknown, where: string): never {
  const e = (error ?? {}) as NonNullable<PgErr>;
  console.error(`[citizen] ${where} failed`, { message: e.message, code: e.code, details: e.details, hint: e.hint });
  const msg = e.message ?? String(error);
  if (/fetch|network|Failed to fetch|Load failed/i.test(msg)) throw new CitizenError("network", msg);
  if (e.code === "42501" || /permission|row-level/i.test(msg)) throw new CitizenError("permission", msg);
  if (msg.includes("invalid_mobile")) throw new CitizenError("mobile", msg);
  throw new CitizenError("other", msg);
}

async function call<T>(where: string, p: PromiseLike<{ data: T; error: PgErr }>): Promise<T> {
  try {
    const { data, error } = await p;
    if (error) fail(error, where);
    return data;
  } catch (e) {
    if (e instanceof CitizenError) throw e;
    fail(e, where);
  }
}

export async function registerCitizen({ data }: { data: { name: string; mobile: string; address: string; dob: string; device_id?: string } }) {
  const rows = await call("register", supabase.rpc("register_citizen", {
    _name: data.name, _mobile: data.mobile, _address: data.address, _dob: data.dob, _device_id: data.device_id ?? null,
  } as never));
  const r = (rows as unknown as { id: string; token: string; existing: boolean }[])[0];
  if (!r) fail({ message: "No row returned" }, "register");
  return r;
}

export async function getMe({ data }: { data: Auth }) {
  const rows = await call("getMe", supabase.rpc("citizen_me", { _id: data.id, _token: data.token }));
  return (rows as { id: string; name: string; mobile: string; address: string; dob: string | null; created_at: string }[])[0] ?? null;
}

export async function submitComplaint({ data }: { data: Auth & { category_id: string; message: string } }) {
  await call("submitComplaint", supabase.rpc("citizen_submit_complaint", {
    _id: data.id, _token: data.token, _category_id: data.category_id, _message: data.message,
  }));
  return { ok: true };
}

export async function myComplaints({ data }: { data: Auth }) {
  const rows = await call("myComplaints", supabase.rpc("citizen_complaints", { _id: data.id, _token: data.token }));
  return ((rows ?? []) as { id: string; message: string; status: string; created_at: string; name_mr: string | null; name_en: string | null }[]).map(
    (r) => ({ ...r, service_categories: { name_mr: r.name_mr, name_en: r.name_en } }),
  );
}

export async function updateMe({ data }: { data: Auth & { name: string; address: string } }) {
  await call("updateMe", supabase.rpc("citizen_update", { _id: data.id, _token: data.token, _name: data.name, _address: data.address }));
  return { ok: true };
}

export async function deleteMe({ data }: { data: Auth }) {
  await call("deleteMe", supabase.rpc("citizen_delete", { _id: data.id, _token: data.token }));
  return { ok: true };
}
