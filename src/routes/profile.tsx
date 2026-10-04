import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Shield, ScrollText, Trash2, Images, UserRound, Phone, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LeaderCard } from "@/components/app/LeaderCard";
import { galleryQuery, useL } from "@/lib/content";
import { MobileShell } from "@/components/app/MobileShell";
import { LangToggle } from "@/components/app/LangToggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useMe } from "@/lib/use-me";
import { updateMe, deleteMe, myComplaints } from "@/lib/citizen.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Digital Ward" },
      { name: "description", content: "Manage your Digital Ward profile and language." },
      { property: "og:title", content: "Profile — Digital Ward" },
      { property: "og:description", content: "Manage your Digital Ward profile." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { t } = useI18n();
  const { session, setSession } = useSession();
  const { data: me, isLoading } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const update = useServerFn(updateMe);
  const del = useServerFn(deleteMe);
  const listComplaints = useServerFn(myComplaints);
  const L = useL();
  const complaints = useQuery({ queryKey: ["complaints", session?.id], queryFn: () => listComplaints({ data: session! }), enabled: !!session });
  const gallery = useQuery(galleryQuery);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me) { setName(me.name); setAddress(me.address); }
  }, [me]);

  const save = async () => {
    if (!session || name.trim().length < 2 || address.trim().length < 3) { toast.error(t("required")); return; }
    setBusy(true);
    try {
      await update({ data: { ...session, name, address } });
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(t("saved"));
    } catch { toast.error("Error"); } finally { setBusy(false); }
  };

  const remove = async () => {
    if (session) await del({ data: session });
    qc.clear();
    setSession(null);
    navigate({ to: "/register", replace: true });
  };

  return (
    <MobileShell title={t("profile")}>
      <div className="space-y-5 p-5">
        {isLoading ? <Skeleton className="h-64 rounded-2xl" /> : (
          <div className="space-y-4 rounded-3xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-saffron font-display text-2xl font-bold text-primary-foreground">
                {me?.name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold">{me?.name}</p>
                <p className="text-sm text-muted-foreground">+91 {me?.mobile}{me?.dob ? ` · ${me.dob}` : ""}</p>
              </div>
            </div>
            <div className="space-y-1.5"><Label>{t("fullName")}</Label><Input className="h-12 text-base" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>{t("address")}</Label><Textarea className="text-base" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <Button variant="saffron" size="xl" className="w-full" onClick={save} disabled={busy}>{t("save")}</Button>
          </div>
        )}

        <div className="-mx-5"><LeaderCard /></div>

        <section className="rounded-3xl bg-card p-4 shadow-card">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><ClipboardList className="h-5 w-5 text-primary" />{t("myComplaints")}</h2>
          {complaints.isLoading && <Skeleton className="h-16 rounded-2xl" />}
          {complaints.data?.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
          <ul className="space-y-2">
            {complaints.data?.map((c) => (
              <li key={c.id} className="flex items-start gap-3 rounded-2xl bg-muted p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{L(c.service_categories?.name_mr, c.service_categories?.name_en)}</p>
                  {c.message && <p className="line-clamp-2 text-sm text-muted-foreground">{c.message}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${c.status === "resolved" ? "bg-success text-success-foreground" : c.status === "in_progress" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {t(`st_${c.status}` as "st_submitted")}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-card p-4 shadow-card">
          <Link to="/gallery" className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Images className="h-5 w-5 text-primary" />{t("photos")}<ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" /></Link>
          <div className="grid grid-cols-3 gap-1.5">
            {gallery.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
            {gallery.data?.slice(0, 6).map((g) => (
              <Link key={g.id} to="/gallery"><img src={g.image_url} alt="" className="aspect-square w-full rounded-xl object-cover" loading="lazy" /></Link>
            ))}
          </div>
        </section>

        <div className="overflow-hidden rounded-3xl bg-card shadow-card">
          <Row to="/about" icon={UserRound} label={t("about")} />
          <Row to="/contact" icon={Phone} label={t("contact")} />
        </div>

        <div className="flex items-center justify-between rounded-3xl bg-card p-4 shadow-card">
          <span className="font-semibold">{t("language")}</span><LangToggle />
        </div>

        <div className="overflow-hidden rounded-3xl bg-card shadow-card">
          <Row to="/privacy" icon={Shield} label={t("privacy")} />
          <Row to="/terms" icon={ScrollText} label={t("terms")} />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="xl" className="w-full border-destructive text-destructive">
              <Trash2 /> {t("deleteAccount")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteAccount")}</AlertDialogTitle>
              <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground">{t("confirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MobileShell>
  );
}

function Row({ to, icon: Icon, label }: { to: "/privacy" | "/terms" | "/about" | "/contact"; icon: typeof Shield; label: string }) {
  return (
    <Link to={to} className="flex min-h-14 items-center gap-3 border-b border-border px-4 last:border-0 active:bg-muted">
      <Icon className="h-5 w-5 text-primary" /><span className="flex-1">{label}</span><ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
