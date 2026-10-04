import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/app/MobileShell";
import { useSettings, useL, fallbacks } from "@/lib/content";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Ward — Rajendra Janjal, Ward No. 22" },
      { name: "description", content: "Ward updates, complaints, schemes and news from Deputy Mayor Rajendra Janjal, Ward No. 22, Chhatrapati Sambhajinagar." },
      { property: "og:title", content: "Digital Ward — Rajendra Janjal" },
      { property: "og:description", content: "Citizen services for Ward No. 22, Chhatrapati Sambhajinagar." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const { data: s } = useSettings();
  const L = useL();
  const { t } = useI18n();
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const [stage, setStage] = useState<1 | 2>(1);

  useEffect(() => {
    const a = setTimeout(() => setStage(2), 2000);
    return () => clearTimeout(a);
  }, []);
  useEffect(() => {
    if (!ready || stage !== 2) return;
    const b = setTimeout(() => navigate({ to: session ? "/home" : "/register", replace: true }), 2100);
    return () => clearTimeout(b);
  }, [ready, stage, session, navigate]);

  return (
    <PhoneFrame>
      {stage === 1 ? (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
          <div className="absolute -bottom-40 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-[50%] bg-saffron" />
          <div className="animate-splash rounded-[2rem] bg-card p-6 shadow-card">
            <img src={s?.party_logo_url ?? fallbacks.logo} alt="Shiv Sena" className="h-40 w-40 object-contain" />
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
          <div className="animate-splash rounded-full bg-gold-ring p-1.5 shadow-glow">
            <img
              src={s?.splash_photo_url ?? fallbacks.splash}
              alt=""
              className="h-56 w-56 rounded-full border-4 border-card object-cover object-top"
            />
          </div>
          <h1 className="animate-rise mt-7 font-display text-4xl font-extrabold leading-tight [animation-delay:.2s]">
            {s ? L(s.name_mr, s.name_en) : ""}
          </h1>
          <p className="animate-rise mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary [animation-delay:.3s]">
            {s ? `${L(s.designation_mr, s.designation_en)} · ${L(s.ward_mr, s.ward_en)}` : ""}
          </p>
          <p className="animate-rise mt-3 italic text-muted-foreground [animation-delay:.4s]">
            {s ? L(s.slogan_mr, s.slogan_en) : ""}
          </p>
          <div className="mt-10 h-1 w-48 overflow-hidden rounded-full bg-secondary">
            <div className="animate-load h-full w-full rounded-full bg-saffron" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("preparing")}</p>
        </div>
      )}
    </PhoneFrame>
  );
}
