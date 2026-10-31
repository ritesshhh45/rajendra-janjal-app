import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle, BellRing, CheckCircle2, ClipboardList, Clock, FilePlus2, Hammer, Loader2, Megaphone, Smartphone, Users, type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { errMsg } from "@/lib/admin";

const DAY = 86_400_000;

export function OverviewTab({ go }: { go: (tab: string) => void }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "overview"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const [c, ci, dv] = await Promise.all([
        supabase.from("complaints")
          .select("id, message, status, created_at, citizens(name, mobile), service_categories(name_en, name_mr)")
          .order("created_at", { ascending: false }),
        supabase.from("citizens").select("id", { count: "exact", head: true }),
        supabase.from("device_tokens").select("id", { count: "exact", head: true }),
      ]);
      if (c.error) throw c.error;
      return { complaints: c.data, citizens: ci.count ?? 0, devices: dv.count ?? 0 };
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success(status === "resolved" ? "Marked resolved" : "Marked in progress");
    qc.invalidateQueries({ queryKey: ["admin", "overview"] });
    qc.invalidateQueries({ queryKey: ["admin", "complaints"] });
  };

  if (q.isLoading) return <Loader2 className="mx-auto mt-10 animate-spin" />;
  if (q.error) return <p className="text-destructive">{errMsg(q.error)}</p>;
  const { complaints, citizens, devices } = q.data!;

  const now = Date.now();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const total = complaints.length;
  const fresh = complaints.filter((c) => c.status === "submitted");
  const inProg = complaints.filter((c) => c.status === "in_progress");
  const done = complaints.filter((c) => c.status === "resolved");
  const thisMonth = complaints.filter((c) => new Date(c.created_at).getTime() >= monthStart).length;
  const stale = fresh.filter((c) => now - new Date(c.created_at).getTime() > 2 * DAY);
  const today = complaints.filter((c) => now - new Date(c.created_at).getTime() < DAY).length;
  const rate = total ? Math.round((done.length / total) * 100) : 0;

  const byCat = new Map<string, number>();
  complaints.forEach((c) => {
    const k = c.service_categories?.name_en ?? "Other";
    byCat.set(k, (byCat.get(k) ?? 0) + 1);
  });
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...cats.map(([, n]) => n));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i));
    const start = d.getTime();
    return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), n: complaints.filter((c) => { const t = new Date(c.created_at).getTime(); return t >= start && t < start + DAY; }).length };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.n));

  const attention: Array<{ icon: LucideIcon; text: string; sub: string; action: string; tab: string; hot: boolean }> = [
    { icon: Clock, text: `${stale.length} complaint${stale.length === 1 ? "" : "s"} waiting over 48 hours`, sub: stale.length ? "Citizens are still waiting for a response." : "Nothing is overdue. Great work.", action: "Review", tab: "Complaints", hot: stale.length > 0 },
    { icon: FilePlus2, text: `${fresh.length} new, not yet started`, sub: `${today} received in the last 24 hours.`, action: "Open", tab: "Complaints", hot: fresh.length > 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 p-4 ring-1 ring-orange-200">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><AlertTriangle className="h-5 w-5" /></span>
          <div>
            <p className="font-display font-bold leading-tight">Needs attention</p>
            <p className="text-xs text-muted-foreground">Resolution rate {rate}% · {thisMonth} complaints this month</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {attention.map((a) => (
            <div key={a.text} className="flex flex-col gap-2 rounded-2xl bg-card p-3 shadow-card">
              <p className="flex items-center gap-2 font-semibold"><a.icon className={`h-4 w-4 shrink-0 ${a.hot ? "text-red-500" : "text-green-600"}`} />{a.text}</p>
              <p className="text-sm text-muted-foreground">{a.sub}</p>
              <Button size="sm" variant={a.hot ? "saffron" : "outline"} className="w-fit rounded-full" onClick={() => go(a.tab)}>{a.action}</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat icon={ClipboardList} label="Total complaints" value={total} tint="bg-blue-50 text-blue-600" />
        <Stat icon={FilePlus2} label="New" value={fresh.length} tint="bg-red-50 text-red-600" />
        <Stat icon={Clock} label="In progress" value={inProg.length} tint="bg-amber-50 text-amber-600" />
        <Stat icon={CheckCircle2} label="Resolved" value={done.length} tint="bg-green-50 text-green-600" />
        <Stat icon={Users} label="Citizens registered" value={citizens} tint="bg-violet-50 text-violet-600" />
        <Stat icon={Smartphone} label="App devices (push)" value={devices} tint="bg-sky-50 text-sky-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-card p-4 shadow-card">
          <h3 className="mb-3 font-display text-lg font-bold">Complaints by category</h3>
          {cats.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
          <ul className="space-y-2.5">
            {cats.map(([name, n]) => (
              <li key={name}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{name}</span><span className="font-bold text-primary">{n}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-saffron" style={{ width: `${(n / maxCat) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl bg-card p-4 shadow-card">
          <h3 className="mb-3 font-display text-lg font-bold">Last 7 days</h3>
          <div className="flex h-40 items-end gap-2">
            {days.map((d) => (
              <div key={d.label + d.n} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs font-bold">{d.n}</span>
                <div className="w-full rounded-t-lg bg-saffron" style={{ height: `${Math.max(4, (d.n / maxDay) * 100)}px` }} />
                <span className="text-[11px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Recent complaints</h3>
          <button className="text-sm font-semibold text-primary" onClick={() => go("Complaints")}>View all →</button>
        </div>
        {complaints.length === 0 && <p className="text-sm text-muted-foreground">No complaints yet.</p>}
        <ul className="divide-y">
          {complaints.slice(0, 5).map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.service_categories?.name_en ?? "Other"} <span className="font-normal text-muted-foreground">· {c.citizens?.name}</span></p>
                <p className="truncate text-sm text-muted-foreground">{c.message || "No message"} · {new Date(c.created_at).toLocaleDateString("en-IN")}</p>
              </div>
              <StatusPill s={c.status} />
              {c.status === "submitted" && <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "in_progress")}>Start</Button>}
              {c.status !== "resolved" && <Button size="sm" variant="saffron" onClick={() => setStatus(c.id, "resolved")}>Resolve</Button>}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-card p-4 shadow-card">
        <h3 className="mb-3 font-display text-lg font-bold">Quick actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="saffron" className="rounded-full" onClick={() => go("Notifications")}><BellRing /> Send notification</Button>
          <Button variant="outline" className="rounded-full" onClick={() => go("Updates")}><Megaphone /> Post update</Button>
          <Button variant="outline" className="rounded-full" onClick={() => go("Works")}><Hammer /> Add work</Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: LucideIcon; label: string; value: number; tint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const m = s === "resolved" ? ["Resolved", "bg-green-100 text-green-700"] : s === "in_progress" ? ["In progress", "bg-amber-100 text-amber-700"] : ["New", "bg-red-100 text-red-700"];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${m[1]}`}>{m[0]}</span>;
}
