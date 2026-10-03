import { Link, useNavigate } from "@tanstack/react-router";
import { Home, FileText, Images, Bell, User, ChevronLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useI18n, type Key } from "@/lib/i18n";
import { useSession } from "@/lib/session";

const tabs: { to: "/home" | "/schemes" | "/gallery" | "/notifications" | "/profile"; icon: typeof Home; label: Key }[] = [
  { to: "/home", icon: Home, label: "home" },
  { to: "/schemes", icon: FileText, label: "schemes" },
  { to: "/gallery", icon: Images, label: "gallery" },
  { to: "/notifications", icon: Bell, label: "notifications" },
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
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  requireSession?: boolean;
}) {
  const { t } = useI18n();
  const { session, ready } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (requireSession && ready && !session) navigate({ to: "/register", replace: true });
  }, [ready, session, requireSession, navigate]);

  return (
    <PhoneFrame>
      {title && (
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur">
          {back && (
            <button
              onClick={() => window.history.back()}
              aria-label={t("back")}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full active:bg-muted"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <h1 className="truncate px-1 font-display text-xl font-bold">{title}</h1>
        </header>
      )}
      <main className="pb-24">{children}</main>
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-border bg-card">
        <ul className="grid grid-cols-5">
          {tabs.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground"
                activeProps={{ className: "text-primary" }}
              >
                <Icon className="h-6 w-6" />
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
