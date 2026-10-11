import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, MessageCircle, Phone, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errMsg } from "@/lib/admin";
import { waLink } from "@/lib/content";

const statuses = [["submitted", "Submitted"], ["in_progress", "In Progress"], ["resolved", "Resolved"]] as const;

export function CitizensTab() {
  const [sub, setSub] = useState<"complaints" | "citizens">("complaints");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["complaints", "citizens"] as const).map((k) => (
          <Button key={k} variant={sub === k ? "saffron" : "outline"} onClick={() => setSub(k)} className="rounded-full capitalize">{k}</Button>
        ))}
      </div>
      {sub === "complaints" ? <Complaints /> : <Citizens />}
    </div>
  );
}

function Complaints() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints")
        .select("id, message, status, created_at, citizens(name, mobile), service_categories(name_en, name_mr)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (error) toast.error(errMsg(error)); else qc.invalidateQueries({ queryKey: ["admin", "complaints"] });
  };
  if (q.isLoading) return <Loader2 className="mx-auto animate-spin" />;
  if (q.error) return <p className="text-destructive">{errMsg(q.error)}</p>;
  if (!q.data?.length) return <p className="text-muted-foreground">No complaints yet.</p>;
  return (
    <div className="space-y-3">
      {q.data.map((c) => (
        <div key={c.id} className="space-y-2 rounded-2xl bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{c.citizens?.name} · {c.citizens?.mobile}</p>
            <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString("en-IN")}</p>
          </div>
          <p className="text-sm font-medium text-primary">{c.service_categories?.name_en} / {c.service_categories?.name_mr}</p>
          {c.message && <p className="text-sm">{c.message}</p>}
          <div className="flex flex-wrap gap-2">
            <Select value={c.status} onValueChange={(v) => setStatus(c.id, v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
            {c.citizens?.mobile && <>
              <Button asChild variant="outline"><a href={`tel:${c.citizens.mobile}`}><Phone /> Call</a></Button>
              <Button asChild variant="outline"><a href={waLink(c.citizens.mobile)} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a></Button>
            </>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Citizens() {
  const [term, setTerm] = useState("");
  const [bday, setBday] = useState<"all" | "today" | "month">("all");
  const q = useQuery({
    queryKey: ["admin", "citizens"],
    queryFn: async () => {
      const { data, error } = await supabase.from("citizens").select("id, name, mobile, address, dob, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const now = new Date();
  const md = (d: string | null) => (d ? d.slice(5) : "");
  const today = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const list = (q.data ?? []).filter((c) =>
    `${c.name} ${c.mobile} ${c.address}`.toLowerCase().includes(term.toLowerCase()) &&
    (bday === "all" || (bday === "today" ? md(c.dob) === today : md(c.dob).slice(0, 2) === today.slice(0, 2))),
  );
  const csv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = [["Name", "Mobile", "Address", "DOB", "Registered"], ...list.map((c) => [c.name, c.mobile, c.address, c.dob, c.created_at])]
      .map((r) => r.map(esc).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + body], { type: "text/csv" }));
    a.download = `citizens-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
  };
  return (
    <div className="space-y-3">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search name, mobile, address" className="pl-9" /></div>
      <div className="flex flex-wrap gap-2">
        {([["all", "All"], ["today", "Birthdays today"], ["month", "Birthdays this month"]] as const).map(([k, l]) => (
          <Button key={k} size="sm" variant={bday === k ? "saffron" : "outline"} className="rounded-full" onClick={() => setBday(k)}>{l}</Button>
        ))}
        <Button size="sm" variant="outline" onClick={csv}><Download /> CSV</Button>
      </div>
      {q.isLoading && <Loader2 className="mx-auto animate-spin" />}
      {q.error && <p className="text-destructive">{errMsg(q.error)}</p>}
      <p className="text-sm text-muted-foreground">{list.length} citizens</p>
      {list.map((c) => (
        <div key={c.id} className="rounded-2xl bg-card p-3 shadow-card">
          <p className="font-semibold">{c.name} · <a href={`tel:${c.mobile}`} className="text-primary">{c.mobile}</a></p>
          <p className="text-sm text-muted-foreground">{c.address} · DOB {c.dob ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}
