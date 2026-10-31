import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, AlertTriangle, ChevronRight } from "lucide-react";
import { MobileShell, SectionHead } from "@/components/app/MobileShell";
import { LangToggle } from "@/components/app/LangToggle";
import { LeaderCard } from "@/components/app/LeaderCard";
import { DbIcon } from "@/components/app/Icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings, fallbacks, useL, updatesQuery, worksQuery, schemesQuery, galleryQuery, useUnread } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { useMe } from "@/lib/use-me";
import { SafeImage } from "@/components/app/SafeImage";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Digital Ward" },
      { name: "description", content: "Updates, development works, complaints and schemes for Ward No. 22." },
      { property: "og:title", content: "Home — Digital Ward" },
      { property: "og:description", content: "Updates, works and schemes for Ward No. 22." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();
  const L = useL();
  const { data: s } = useSettings();
  const { data: me } = useMe();
  const updates = useQuery(updatesQuery);
  const works = useQuery(worksQuery);
  const schemes = useQuery(schemesQuery);
  const gallery = useQuery(galleryQuery);
  const unread = useUnread();
  const alert = updates.data?.find((u) => u.is_alert);
  const firstName = me?.name?.trim().split(/\s+/)[0];

  const header = (
    <header className="sticky top-0 z-20 flex pt-safe items-center gap-2 bg-background/95 px-4 pb-3 backdrop-blur">
      {s ? (
        <SafeImage src={s.header_photo_url} fallback={fallbacks.header} priority alt="" className="h-12 w-12 shrink-0 rounded-full border-2 border-primary object-cover object-top" />
      ) : (
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      )}
      <p className="min-w-0 flex-1 truncate font-display text-lg font-bold leading-tight">
        {t("namaskar")}{firstName ? `, ${firstName}` : ""} 🙏
      </p>
      {s && <SafeImage src={s.party_logo_url} fallback={fallbacks.logo} priority alt="" className="h-10 w-10 shrink-0 rounded-full object-contain" />}
      <Link to="/updates" aria-label={t("updates")} className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card shadow-card">
        <Bell className="h-5 w-5 text-primary" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </Link>
      <LangToggle />
    </header>
  );

  return (
    <MobileShell header={header} fab>
      {alert && (
        <Link to="/updates" className="mx-5 mb-4 flex items-center gap-3 rounded-2xl bg-saffron p-3 text-primary-foreground shadow-glow">
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{L(alert.title_mr, alert.title_en)}</p>
            <p className="truncate text-sm opacity-90">{L(alert.body_mr, alert.body_en)}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </Link>
      )}

      <LeaderCard />

      <SectionHead title={t("todayUpdates")} to="/updates" />
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
        {updates.isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-32 w-64 shrink-0 rounded-3xl" />)}
        {updates.data?.slice(0, 6).map((u) => (
          <Link key={u.id} to="/updates" className="w-64 shrink-0 rounded-3xl bg-card p-4 shadow-card">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${u.is_alert ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {L(u.category_mr, u.category_en)}
            </span>
            <p className="mt-2 line-clamp-1 font-display font-bold">{L(u.title_mr, u.title_en)}</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">{L(u.body_mr, u.body_en)}</p>
          </Link>
        ))}
        {updates.data?.length === 0 && <p className="text-muted-foreground">{t("empty")}</p>}
      </div>

      <SectionHead title={t("works")} />
      <div className="space-y-3 px-5">
        {works.isLoading && <Skeleton className="h-20 rounded-3xl" />}
        {works.data?.slice(0, 4).map((w) => (
          <div key={w.id} className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-card">
            {w.photo_url ? (
              <img src={w.photo_url} alt="" decoding="async" loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary text-primary">
                <DbIcon label={`${w.title_mr} ${w.title_en}`} className="h-full w-full" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold leading-snug">{L(w.title_mr, w.title_en)}</p>
              <p className="line-clamp-1 text-sm text-muted-foreground">{L(w.description_mr, w.description_en)}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${/complete|पूर्ण/i.test(w.status_en + w.status_mr) ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {L(w.status_mr, w.status_en)}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-5 mt-7 rounded-3xl bg-saffron p-5 text-primary-foreground shadow-glow">
        <p className="font-display text-2xl font-bold">{t("complaintTitle")}</p>
        <p className="text-sm opacity-90">{t("complaintSub")}</p>
        <Link to="/services" className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-card px-5 font-bold text-primary">
          {t("chooseIssue")} →
        </Link>
      </div>

      <SectionHead title={t("schemes")} to="/schemes" />
      <div className="grid grid-cols-2 gap-3 px-5">
        {schemes.isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        {schemes.data?.slice(0, 4).map((sc) => (
          <Link key={sc.id} to="/schemes/$id" params={{ id: sc.id }} className="flex min-h-32 flex-col gap-2 rounded-3xl bg-card p-4 shadow-card">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-secondary text-primary">
              <DbIcon name={sc.icon} label={`${sc.title_mr} ${sc.title_en}`} className="h-full w-full" />
            </span>
            <p className="line-clamp-3 font-display text-sm font-bold leading-snug">{L(sc.title_mr, sc.title_en)}</p>
          </Link>
        ))}
      </div>

      <SectionHead title={t("photos")} to="/gallery" />
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
        {gallery.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-28 shrink-0 rounded-2xl" />)}
        {gallery.data?.slice(0, 8).map((g) => (
          <Link key={g.id} to="/gallery" className="shrink-0">
            <img src={g.image_url} alt={L(g.caption_mr, g.caption_en)} className="h-28 w-28 rounded-2xl object-cover" loading="lazy" decoding="async" />
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}
