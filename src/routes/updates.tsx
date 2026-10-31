import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Bell, AlertTriangle } from "lucide-react";
import { MobileShell, EmptyState, ErrorState } from "@/components/app/MobileShell";
import { Skeleton } from "@/components/ui/skeleton";
import { updatesQuery, noticesQuery, useL, markSeen } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Ward Updates — Digital Ward" },
      { name: "description", content: "Latest announcements and alerts from the Ward No. 22 office." },
      { property: "og:title", content: "Ward Updates — Digital Ward" },
      { property: "og:description", content: "Latest ward announcements and alerts." },
    ],
  }),
  component: Updates,
});

type Item = { id: string; created_at: string; chip: string; title: string; body: string; alert: boolean; image?: string | null };

function Updates() {
  const { t, lang } = useI18n();
  const L = useL();
  const u = useQuery(updatesQuery);
  const n = useQuery(noticesQuery);
  useEffect(() => {
    if (u.data && n.data) markSeen();
  }, [u.data, n.data]);

  const items: Item[] = [
    ...(u.data ?? []).map((x) => ({ id: x.id, created_at: x.created_at, chip: L(x.category_mr, x.category_en), title: L(x.title_mr, x.title_en), body: L(x.body_mr, x.body_en), alert: x.is_alert })),
    ...(n.data ?? [])
      .filter((x) => !(u.data ?? []).some((y) => (y.title_en === x.title || y.title_mr === x.title) && (y.body_en === x.message || y.body_mr === x.message)))
      .map((x) => ({ id: x.id, created_at: x.created_at, chip: t("notice"), title: x.title, body: x.message, alert: false, image: x.image_url })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const loading = u.isLoading || n.isLoading;

  return (
    <MobileShell title={t("updates")} back fab>
      <div className="space-y-4 p-5 pt-2">
        {loading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        {u.isError && <ErrorState />}
        {!loading && !u.isError && items.length === 0 && <EmptyState icon={Bell} text={t("empty")} />}
        {items.map((x) => (
          <article key={x.id} className={`overflow-hidden rounded-3xl bg-card shadow-card ${x.alert ? "ring-2 ring-primary" : ""}`}>
            {x.image && <img src={x.image} alt="" className="w-full object-cover" />}
            <div className="space-y-2 p-5">
              <div className="flex flex-wrap gap-2">
                {x.alert && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" /> {t("important")}
                  </span>
                )}
                {x.chip && <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">{x.chip}</span>}
              </div>
              <h3 className="font-display text-xl font-bold leading-snug">{x.title}</h3>
              <p className="whitespace-pre-line text-muted-foreground">{x.body}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(x.created_at).toLocaleString(lang === "mr" ? "mr-IN" : "en-IN", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </div>
          </article>
        ))}
      </div>
    </MobileShell>
  );
}
