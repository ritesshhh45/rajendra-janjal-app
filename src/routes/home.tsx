import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Images, Bell, UserRound, Phone } from "lucide-react";
import { MobileShell } from "@/components/app/MobileShell";
import { LangToggle } from "@/components/app/LangToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/lib/content";
import { useI18n, type Key } from "@/lib/i18n";
import { useMe } from "@/lib/use-me";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Digital Ward" },
      { name: "description", content: "Your Digital Ward home: schemes, gallery, notifications and ward office contact." },
      { property: "og:title", content: "Home — Digital Ward" },
      { property: "og:description", content: "Schemes, gallery and updates from your ward." },
    ],
  }),
  component: HomePage,
});

const cards: { to: "/schemes" | "/gallery" | "/notifications" | "/about" | "/contact"; icon: typeof Bell; label: Key; wide?: boolean }[] = [
  { to: "/schemes", icon: FileText, label: "schemes", wide: true },
  { to: "/gallery", icon: Images, label: "gallery" },
  { to: "/notifications", icon: Bell, label: "notifications" },
  { to: "/about", icon: UserRound, label: "about" },
  { to: "/contact", icon: Phone, label: "contact" },
];

function HomePage() {
  const { t } = useI18n();
  const { data: s } = useSettings();
  const { data: me, isLoading } = useMe();

  return (
    <MobileShell>
      <section className="relative h-64 overflow-hidden rounded-b-[2rem]">
        {s ? (
          <img src={s.header_image_url} alt={s.leader_name} className="h-full w-full object-cover object-top" />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-scrim" />
        <div className="absolute right-3 top-3"><LangToggle /></div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
          <p className="font-display text-2xl font-bold leading-tight">{s?.leader_name}</p>
          <p className="text-sm opacity-90">{s?.leader_title}</p>
        </div>
      </section>

      <div className="px-5 pt-5">
        {isLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h2 className="animate-rise font-display text-2xl font-bold">
            {t("namaskar")}, <span className="text-primary">{me?.name?.split(" ")[0]}</span> 🙏
          </h2>
        )}
        <p className="text-muted-foreground">{t("updatesFrom")}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {cards.map(({ to, icon: Icon, label, wide }, i) => (
            <Link
              key={to}
              to={to}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`animate-rise flex min-h-28 flex-col justify-between rounded-2xl p-4 shadow-card active:scale-[0.98] ${
                wide ? "col-span-2 bg-saffron text-primary-foreground" : "bg-card"
              }`}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${wide ? "bg-card/20" : "bg-secondary text-primary"}`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="font-display text-lg font-semibold leading-tight">{t(label)}</span>
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
