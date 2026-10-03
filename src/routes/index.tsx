import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/app/MobileShell";
import { settingsQuery, fallbacks } from "@/lib/content";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Ward — Rajendra Janjal" },
      { name: "description", content: "Ward updates, schemes and news from Deputy Mayor Rajendra Janjal, Chhatrapati Sambhajinagar." },
      { property: "og:title", content: "Digital Ward — Rajendra Janjal" },
      { property: "og:description", content: "Ward updates, schemes and news from Deputy Mayor Rajendra Janjal." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const { data } = useQuery(settingsQuery);
  const { session, ready } = useSession();
  const { t } = useI18n();
  const navigate = useNavigate();
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => navigate({ to: session ? "/home" : "/register", replace: true }), 2000);
    return () => clearTimeout(id);
  }, [ready, session, navigate]);

  return (
    <PhoneFrame>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
        <div className="absolute -bottom-40 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-[50%] bg-saffron opacity-90" />
        <img
          src={data?.splash_logo_url ?? fallbacks.splash}
          alt="Shiv Sena"
          className="animate-splash h-44 w-44 rounded-full object-cover shadow-glow"
        />
        <p className="animate-rise mt-6 font-display text-2xl font-bold text-foreground [animation-delay:.3s]">
          {t("appName")}
        </p>
        <p className="animate-rise text-sm text-muted-foreground [animation-delay:.45s]">Digital Ward</p>
      </div>
    </PhoneFrame>
  );
}
