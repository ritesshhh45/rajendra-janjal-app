import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, MessageCircle } from "lucide-react";
import { MobileShell, EmptyState, ErrorState } from "@/components/app/MobileShell";
import { DbIcon } from "@/components/app/Icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { categoriesQuery, useL, useSettings, waLink } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useMe } from "@/lib/use-me";
import { submitComplaint } from "@/lib/citizen.functions";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Citizen Services — Digital Ward" },
      { name: "description", content: "Report water, road, drainage, electricity and other issues to the Ward No. 22 office." },
      { property: "og:title", content: "Citizen Services — Digital Ward" },
      { property: "og:description", content: "Report ward issues directly to the office." },
    ],
  }),
  component: Services,
});

function Services() {
  const { t } = useI18n();
  const L = useL();
  const { data, isLoading, isError } = useQuery(categoriesQuery);
  const { data: s } = useSettings();
  const { data: me } = useMe();
  const { session } = useSession();
  const qc = useQueryClient();
  const submit = useServerFn(submitComplaint);
  const [cat, setCat] = useState<NonNullable<typeof data>[number] | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!cat || !session) return;
    setBusy(true);
    // Open the WhatsApp window synchronously so mobile browsers don't block it.
    const text = `नमस्कार साहेब 🙏\nनाव: ${me?.name ?? ""}\nमोबाईल: ${me?.mobile ?? ""}\nसेवा: ${cat.name_mr}\n\n${msg}`;
    const win = s?.office_whatsapp ? window.open(waLink(s.office_whatsapp, text), "_blank") : null;
    try {
      await submit({ data: { ...session, category_id: cat.id, message: msg } });
      qc.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(t("complaintSaved"));
      setCat(null);
      setMsg("");
    } catch {
      win?.close();
      toast.error(t("loadError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobileShell title={t("services")} fab>
      <p className="px-5 text-muted-foreground">{t("servicesSub")}</p>
      <div className="grid grid-cols-2 gap-3 p-5">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        {data?.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c)}
            className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-3xl bg-card p-4 text-center shadow-card active:scale-[0.97]"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
              <DbIcon name={c.icon} className="h-7 w-7" />
            </span>
            <span className="font-display font-bold leading-tight">{L(c.name_mr, c.name_en)}</span>
          </button>
        ))}
      </div>
      {isError && <ErrorState />}
      {data?.length === 0 && <EmptyState icon={LayoutGrid} text={t("empty")} />}

      <Drawer open={!!cat} onOpenChange={(o) => !o && setCat(null)}>
        <DrawerContent className="mx-auto max-w-[430px]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-3 font-display text-xl">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary">
                <DbIcon name={cat?.icon} className="h-6 w-6" />
              </span>
              {cat && L(cat.name_mr, cat.name_en)}
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-8">
            <Textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value.slice(0, 1000))}
              placeholder={t("messageOptional")}
              className="min-h-28 text-base"
            />
            <Button onClick={send} disabled={busy} size="xl" className="w-full bg-success font-display font-bold text-success-foreground hover:bg-success/90">
              <MessageCircle /> {t("sendWhatsapp")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </MobileShell>
  );
}
