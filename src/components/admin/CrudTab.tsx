import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { errMsg } from "@/lib/admin";
import { ImageField } from "./ImageField";

export type Field = { key: string; label: string; type?: "text" | "textarea" | "bool" | "number" | "image" | "url" };
type Row = Record<string, unknown> & { id: string };

export function CrudTab({
  table, fields, titleKey, subKey, order = "created_at", ascending = false, invalidate, folder,
}: {
  table: "updates" | "works" | "schemes" | "service_categories";
  fields: Field[]; titleKey: string; subKey?: string; order?: string; ascending?: boolean; invalidate: string; folder: string;
}) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order(order, { ascending });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });
  const [edit, setEdit] = useState<Partial<Row> | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", table] });
    qc.invalidateQueries({ queryKey: [invalidate] });
  };

  const save = async () => {
    if (!edit) return;
    setBusy(true);
    try {
      const { id, created_at: _c, ...rest } = edit as Row;
      const payload = Object.fromEntries(Object.entries(rest).filter(([k]) => fields.some((f) => f.key === k)));
      const { error } = id
        ? await supabase.from(table).update(payload as never).eq("id", id)
        : await supabase.from(table).insert(payload as never);
      if (error) throw error;
      toast.success("Saved");
      setEdit(null);
      refresh();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const del = async (r: Row) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) toast.error(errMsg(error)); else refresh();
  };

  if (edit) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setEdit(null)}><ChevronLeft /> Back</Button>
        {fields.map((f) => {
          const v = edit[f.key];
          const set = (val: unknown) => setEdit({ ...edit, [f.key]: val });
          return (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label}</Label>
              {f.type === "textarea" ? <Textarea value={(v as string) ?? ""} onChange={(e) => set(e.target.value)} className="min-h-24" />
              : f.type === "bool" ? <div><Switch checked={!!v} onCheckedChange={set} /></div>
              : f.type === "number" ? <Input type="number" value={(v as number) ?? 0} onChange={(e) => set(Number(e.target.value))} />
              : f.type === "image" ? <ImageField value={v as string | null} onChange={set} folder={folder} />
              : <Input value={(v as string) ?? ""} onChange={(e) => set(e.target.value)} type={f.type === "url" ? "url" : "text"} />}
            </div>
          );
        })}
        <Button variant="saffron" size="xl" className="w-full" onClick={save} disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Save
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button variant="saffron" onClick={() => setEdit({})}><Plus /> Add new</Button>
      {q.isLoading && <Loader2 className="mx-auto animate-spin" />}
      {q.error && <p className="text-destructive">{errMsg(q.error)}</p>}
      {q.data?.length === 0 && <p className="text-muted-foreground">Nothing yet.</p>}
      {q.data?.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{String(r[titleKey] ?? "")}</p>
            {subKey && <p className="truncate text-sm text-muted-foreground">{String(r[subKey] ?? "")}</p>}
          </div>
          <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEdit(r)}><Pencil /></Button>
          <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => del(r)}><Trash2 className="text-destructive" /></Button>
        </div>
      ))}
    </div>
  );
}
