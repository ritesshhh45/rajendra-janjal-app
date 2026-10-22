import { createFileRoute } from "@tanstack/react-router";

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
  // The launch overlay (LaunchScreen) shows the logo and redirects to /home or /register.
  return <main className="h-dvh w-full bg-splash-cream" />;
}
