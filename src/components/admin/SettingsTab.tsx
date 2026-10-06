import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errMsg } from "@/lib/admin";
import { ImageField } from "./ImageField";

const images = [
  ["splash_logo_url", "Splash logo"], ["leader_photo_url", "Leader photo"], ["header_photo_url", "Header photo"],
  ["party_logo_url", "Party logo"], ["app_icon_url", "App icon"],
] as const;
const pairs = [
  ["name", "Name"], ["designation", "Designation"], ["ward", "Ward"], ["slogan", "Slogan"], ["tagline", "Tagline"], ["party_name", "Party name"],
] as const;

type S = Record<string, string | number | null>;

export function SettingsTab() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as unknown as S;
    },
  });
  const [s, setS] = useState<S | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (q.data) setS(q.data); }, [q.data]);
  if (!s) return q.error ? <p className="text-destructive">{errMsg(q.error)}</p> : <Loader2 className="mx-auto animate-spin" />;
  const set = (k: string, v: string | number | null) => setS({ ...s, [k]: v });
  const txt = (k: string) => ({ value: (s[k] as string) ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value) });

  const save = async () => {
    setBusy(true);
    const { id: _i, updated_at: _u, ...rest } = s;
    const { error } = await supabase.from("app_settings").update({ ...rest, updated_at: new Date().toISOString() } as never).eq("id", 1);
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <h3 className="font-display text-lg font-bold">Images</h3>
        {images.map(([k, l]) => (
          <div key={k} className="space-y-1"><Label>{l}</Label><ImageField value={s[k] as string | null} onChange={(v) => set(k, v)} folder="settings" /></div>
        ))}
      </section>
      <section className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <h3 className="font-display text-lg font-bold">Text (मराठी / English)</h3>
        {pairs.map(([k, l]) => (
          <div key={k} className="grid gap-2 sm:grid-cols-2">
            <div><Label>{l} — मराठी</Label><Input {...txt(`${k}_mr`)} /></div>
            <div><Label>{l} — English</Label><Input {...txt(`${k}_en`)} /></div>
          </div>
        ))}
        <div><Label>App name</Label><Input {...txt("app_name")} /></div>
      </section>
      <section className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <h3 className="font-display text-lg font-bold">Office</h3>
        <div><Label>Address</Label><Textarea {...txt("office_address")} /></div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div><Label>Phone</Label><Input type="tel" {...txt("office_phone")} /></div>
          <div><Label>WhatsApp</Label><Input type="tel" {...txt("office_whatsapp")} /></div>
          <div><Label>Latitude</Label><Input type="number" step="any" value={s["office_lat"] ?? ""} onChange={(e) => set("office_lat", e.target.value === "" ? null : Number(e.target.value))} /></div>
          <div><Label>Longitude</Label><Input type="number" step="any" value={s["office_lng"] ?? ""} onChange={(e) => set("office_lng", e.target.value === "" ? null : Number(e.target.value))} /></div>
        </div>
      </section>
      <Button variant="saffron" size="xl" className="w-full" onClick={save} disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save settings</Button>
    </div>
  );
}
