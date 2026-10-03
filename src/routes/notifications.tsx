import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { MobileShell, EmptyState } from "@/components/app/MobileShell";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationsQuery } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Digital Ward" },
      { name: "description", content: "Latest announcements from Rajendra Janjal's office." },
      { property: "og:title", content: "Notifications — Digital Ward" },
      { property: "og:description", content: "Latest ward announcements." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { t, lang } = useI18n();
  const { data, isLoading } = useQuery(notificationsQuery);
  return (
    <MobileShell title={t("notifications")}>
      <div className="space-y-3 p-4">
        {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        {!isLoading && !data?.length && <EmptyState icon={Bell} text={t("empty")} />}
        {data?.map((n) => (
          <article key={n.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
            {n.image_url && <img src={n.image_url} alt="" className="w-full object-cover" />}
            <div className="p-4">
              <p className="text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString(lang === "mr" ? "mr-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <h3 className="font-display text-lg font-bold leading-snug">{n.title}</h3>
              <p className="whitespace-pre-line text-muted-foreground">{n.message}</p>
            </div>
          </article>
        ))}
      </div>
    </MobileShell>
  );
}
