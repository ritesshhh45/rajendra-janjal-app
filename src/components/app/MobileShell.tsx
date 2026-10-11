import { Link, useNavigate } from "@tanstack/react-router";
import { Home, LayoutGrid, Landmark, Bell, User, ChevronLeft, MessageCircle, AlertCircle } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useI18n, type Key } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useSettings, waLink } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";

const tabs: { to: "/home" | "/services" | "/schemes" | "/updates" | "/profile"; icon: typeof Home; label: Key }[] = [
  { to: "/home", icon: Home, label: "home" },
  { to: "/services", icon: LayoutGrid, label: "services" },
  { to: "/schemes", icon: Landmark, label: "schemes" },
  { to: "/updates", icon: Bell, label: "updates" },
  { to: "/profile", icon: User, label: "profile" },
];

export function PhoneFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background">{children}</div>;
}

/** Wraps citizen screens: requires a registered device, shows bottom nav. */
export function MobileShell({
  children,
  title,
  back,
  requireSession = true,
  header,
  fab,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  requireSession?: boolean;
  header?: ReactNode;
  fab?: boolean;
}) {
  const { t } = useI18n();
  const { session, ready } = useSession();
  const { data: s } = useSettings();
  const navigate = useNavigate();
  const router = useRouter();
  useEffect(() => {
    if (requireSession && ready && !session) navigate({ to: "/register", replace: true });
  }, [ready, session, requireSession, navigate]);

  return (
    <PhoneFrame>
      {header}
      {title && !header && (
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-background/95 px-3 backdrop-blur">
          {back && (
            <Button variant="ghost" size="icon"
              onClick={() => router.history.canGoBack() ? router.history.back() : void navigate({ to: "/home", replace: true })}
              aria-label={t("back")}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full active:bg-muted"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <h1 className="truncate px-1 font-display text-2xl font-bold">{title}</h1>
        </header>
      )}
      <main className="pb-28">{children}</main>
      {fab && s?.office_whatsapp && (
        <a
          href={waLink(s.office_whatsapp, "नमस्कार साहेब 🙏")}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="fixed bottom-24 z-30 grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground shadow-card [right:max(1rem,calc(50vw-215px+1rem))]"
        >
          <MessageCircle className="h-8 w-8" />
        </a>
      )}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-border bg-card">
        <ul className="grid grid-cols-5">
          {tabs.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex min-h-[64px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground"
                activeProps={{ className: "text-primary" }}
              >
                <span className="grid h-9 w-12 place-items-center rounded-full group-data-[status=active]:bg-secondary">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="truncate">{t(label)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PhoneFrame>
  );
}

export function EmptyState({ icon: Icon, text }: { icon: typeof Home; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-muted-foreground">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="h-8 w-8" />
      </div>
      <p>{text}</p>
    </div>
  );
}

export function ErrorState() {
  const { t } = useI18n();
  return <EmptyState icon={AlertCircle} text={t("loadError")} />;
}

export function SectionHead({ title, to }: { title: string; to?: "/updates" | "/schemes" | "/gallery" }) {
  const { t } = useI18n();
  return (
    <div className="mb-3 mt-7 flex items-center justify-between px-5">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {to && (
        <Link to={to} className="min-h-9 px-1 py-1 text-sm font-semibold text-primary">
          {t("seeAll")} →
        </Link>
      )}
    </div>
  );
}
