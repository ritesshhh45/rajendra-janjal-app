import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Save, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errMsg, removeImage, uploadImage } from "@/lib/admin";

type G = { id: string; image_url: string; caption_mr: string | null; caption_en: string | null; video_link: string | null; sort_order: number };

export function GalleryTab() {
  const qc = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Partial<G>>>({});
  const q = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data as G[];
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "gallery"] }); qc.invalidateQueries({ queryKey: ["gallery"] }); };
  const items = q.data ?? [];

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const start = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
      for (const [i, f] of [...files].entries()) {
        const url = await uploadImage(f, "gallery");
        const { error } = await supabase.from("gallery").insert({ image_url: url, sort_order: start + i });
        if (error) throw error;
      }
      toast.success("Uploaded");
      refresh();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };
  const move = async (idx: number, d: number) => {
    const a = items[idx], b = items[idx + d];
    if (!a || !b) return;
    const list = items.map((x, i) => ({ id: x.id, sort_order: i }));
    list[idx]!.sort_order = idx + d; list[idx + d]!.sort_order = idx;
    await Promise.all([list[idx]!, list[idx + d]!].map((x) => supabase.from("gallery").update({ sort_order: x.sort_order }).eq("id", x.id)));
    await Promise.all(list.filter((_, i) => i !== idx && i !== idx + d).map((x) => supabase.from("gallery").update({ sort_order: x.sort_order }).eq("id", x.id)));
    refresh();
  };
  const save = async (g: G) => {
    const { error } = await supabase.from("gallery").update(drafts[g.id] ?? {}).eq("id", g.id);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("Saved"); setDrafts({ ...drafts, [g.id]: {} }); refresh();
  };
  const del = async (g: G) => {
    if (!confirm("Delete photo?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", g.id);
    if (error) { toast.error(errMsg(error)); return; }
    await removeImage(g.image_url).catch(() => {});
    refresh();
  };

  return (
    <div className="space-y-3">
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
      <Button variant="saffron" onClick={() => ref.current?.click()} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Upload />} {busy ? "Uploading…" : "Upload photos"}</Button>
      {q.isLoading && <Loader2 className="mx-auto animate-spin" />}
      {q.error && <p className="text-destructive">{errMsg(q.error)}</p>}
      {items.map((g, i) => {
        const d = { ...g, ...drafts[g.id] };
        const set = (k: keyof G, v: string) => setDrafts({ ...drafts, [g.id]: { ...drafts[g.id], [k]: v } });
        return (
          <div key={g.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
            <img src={g.image_url} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Input placeholder="Caption (मराठी)" value={d.caption_mr ?? ""} onChange={(e) => set("caption_mr", e.target.value)} />
              <Input placeholder="Caption (English)" value={d.caption_en ?? ""} onChange={(e) => set("caption_en", e.target.value)} />
              <Input placeholder="Video link (optional)" type="url" value={d.video_link ?? ""} onChange={(e) => set("video_link", e.target.value)} />
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp /></Button>
                <Button size="icon" variant="ghost" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown /></Button>
                <Button size="icon" variant="ghost" aria-label="Save" onClick={() => save(g)}><Save /></Button>
                <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => del(g)}><Trash2 className="text-destructive" /></Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
