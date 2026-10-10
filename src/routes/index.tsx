import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import shivSenaLogo from "@/assets/shiv-sena-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Ward — Rajendra Janjal, Ward No. 22" },
      { name: "description", content: "Ward updates, complaints, schemes and news from Deputy Mayor Rajendra Janjal, Ward No. 22, Chhatrapati Sambhajinagar." },
      { property: "og:title", content: "Digital Ward — Rajendra Janjal" },
      { property: "og:description", content: "Citizen services for Ward No. 22, Chhatrapati Sambhajinagar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFinished(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Safety: never stay on the splash longer than 2s.
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: session ? "/home" : "/register", replace: true }), 2000);
    return () => clearTimeout(t);
  }, [navigate, session]);

  useEffect(() => {
    if (ready && finished) navigate({ to: session ? "/home" : "/register", replace: true });
  }, [ready, finished, session, navigate]);

  return (
    <main className="grid h-dvh w-full place-items-center overflow-hidden bg-splash-cream">
      <img src={shivSenaLogo} alt="Shiv Sena" className="animate-splash-logo block w-[160px] max-w-[50%] object-contain" />
    </main>
  );
}
