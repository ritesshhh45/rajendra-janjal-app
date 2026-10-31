import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errMsg, sendNotification } from "@/lib/admin";
import { ImageField } from "./ImageField";

const CATS: Array<[string, string]> = [["Notice", "सूचना"], ["Water", "पाणी"], ["Development", "विकासकामे"], ["Cleanliness", "स्वच्छता"], ["Health", "आरोग्य"], ["Event", "कार्यक्रम"]];

export function NoticesTab() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [onHome, setOnHome] = useState(true);
  const [important, setImportant] = useState(false);
  const [cat, setCat] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const hist = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
  const devices = useQuery({
    queryKey: ["admin", "devices"],
    queryFn: async () => (await supabase.from("device_tokens").select("id", { count: "exact", head: true })).count ?? 0,
  });

  const send = async () => {
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }
    setBusy(true); setResult(null);
    try {
      const r = await sendNotification({ title, message, image_url: image });
      if (onHome) {
        const { error: ue } = await supabase.from("updates").insert({
          title_mr: title, title_en: title, body_mr: message, body_en: message,
          category_en: CATS[cat]![0], category_mr: CATS[cat]![1], is_alert: important,
        });
        if (ue) toast.error(`Notification sent, but Home update failed: ${errMsg(ue)}`);
        qc.invalidateQueries({ queryKey: ["updates"] });
      }
      const text = r.error ? `Saved to Updates. Push not sent: ${r.error}` : `Sent to ${r.sent} of ${r.total} devices`;
      setResult(text);
      r.error ? toast.warning(text) : toast.success(text);
      setTitle(""); setMessage(""); setImage(null); setImportant(false);
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      qc.invalidateQueries({ queryKey: ["notices"] });
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) toast.error(errMsg(error)); else qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <h3 className="font-display text-lg font-bold">Send notification</h3>
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} /></div>
        <div><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} /></div>
        <div><Label>Image (optional)</Label><ImageField value={image} onChange={setImage} folder="notices" /></div>
        <label className="flex items-start gap-3 rounded-xl bg-muted p-3 text-sm">
          <input type="checkbox" className="mt-1 h-4 w-4" checked={onHome} onChange={(e) => setOnHome(e.target.checked)} />
          <span><b>Also show on Home → Today's Updates</b><br /><span className="text-muted-foreground">Appears as a colourful card for every citizen.</span></span>
        </label>
        {onHome && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <select className="h-11 w-full rounded-md border bg-background px-3" value={cat} onChange={(e) => setCat(Number(e.target.value))}>
                {CATS.map((c, i) => <option key={c[0]} value={i}>{c[0]} / {c[1]}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm sm:mt-6">
              <input type="checkbox" className="h-4 w-4" checked={important} onChange={(e) => setImportant(e.target.checked)} />
              <span><b>Mark as important</b> <span className="text-muted-foreground">(red banner on Home)</span></span>
            </label>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Registered devices: {devices.data ?? "…"}</p>
        <Button variant="saffron" size="xl" className="w-full" onClick={send} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Send />} Send to All
        </Button>
        {result && <p className="rounded-xl bg-secondary p-3 text-sm font-medium">{result}</p>}
      </section>
      <section className="space-y-2">
        <h3 className="font-display text-lg font-bold">History</h3>
        {hist.isLoading && <Loader2 className="mx-auto animate-spin" />}
        {hist.data?.map((n) => (
          <div key={n.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{n.title} <span className="text-xs font-normal text-muted-foreground">· {n.type}</span></p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{n.message}</p>
              <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("en-IN")}</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => del(n.id)}><Trash2 className="text-destructive" /></Button>
          </div>
        ))}
      </section>
    </div>
  );
}
