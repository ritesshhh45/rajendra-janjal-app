import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { errMsg } from "@/lib/admin";

export function AdminsTab({ isPrimary }: { isPrimary: boolean }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admins").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const act = async (id: string, approve: boolean) => {
    const { error } = approve
      ? await supabase.from("admins").update({ approved: true }).eq("user_id", id)
      : await supabase.from("admins").delete().eq("user_id", id);
    if (error) toast.error(errMsg(error)); else qc.invalidateQueries({ queryKey: ["admin", "admins"] });
  };
  if (q.isLoading) return <Loader2 className="mx-auto animate-spin" />;
  const pending = q.data?.filter((a) => !a.approved) ?? [];
  const approved = q.data?.filter((a) => a.approved) ?? [];
  return (
    <div className="space-y-5">
      {!isPrimary && <p className="rounded-xl bg-secondary p-3 text-sm">Only the primary admin can approve or remove admins.</p>}
      <section className="space-y-2">
        <h3 className="font-display text-lg font-bold">Pending requests</h3>
        {pending.length === 0 && <p className="text-muted-foreground">None.</p>}
        {pending.map((a) => (
          <div key={a.user_id} className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-card">
            <p className="min-w-0 flex-1 truncate">{a.email}</p>
            {isPrimary && <>
              <Button size="sm" variant="saffron" onClick={() => act(a.user_id, true)}><Check /> Approve</Button>
              <Button size="sm" variant="outline" onClick={() => act(a.user_id, false)}><X /> Reject</Button>
            </>}
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <h3 className="font-display text-lg font-bold">Approved admins</h3>
        {approved.map((a) => (
          <div key={a.user_id} className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-card">
            <p className="min-w-0 flex-1 truncate">{a.email} {a.is_primary && <span className="text-xs font-bold text-primary">· Primary</span>}</p>
            {isPrimary && !a.is_primary && <Button size="sm" variant="ghost" onClick={() => confirm("Remove admin?") && act(a.user_id, false)}>Remove</Button>}
          </div>
        ))}
      </section>
    </div>
  );
}
