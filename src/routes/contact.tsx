import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { MobileShell } from "@/components/app/MobileShell";
import { useI18n } from "@/lib/i18n";
import { LeaderCard } from "@/components/app/LeaderCard";
import { useSettings } from "@/lib/content";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Ward Office — Digital Ward" },
      { name: "description", content: "Reach Rajendra Janjal's ward office in Chhatrapati Sambhajinagar." },
      { property: "og:title", content: "Contact Ward Office — Digital Ward" },
      { property: "og:description", content: "Reach the ward office." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  const { data: s } = useSettings();
  return (
    <MobileShell title={t("contact")} back>
      <div className="space-y-4 p-5">
        <div className="flex gap-3 rounded-2xl bg-card p-4 shadow-card">
          <MapPin className="h-6 w-6 shrink-0 text-primary" />
          <p>{s?.office_address || t("officeAddress")}</p>
        </div>
      </div>
      <LeaderCard />
      <div>
      </div>
    </MobileShell>
  );
}
