import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";
import { MobileShell } from "@/components/app/MobileShell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

// Placeholder contact details — replace with the real ward office number.
const OFFICE_PHONE = "+910000000000";

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
  return (
    <MobileShell title={t("contact")} back>
      <div className="space-y-4 p-5">
        <div className="flex gap-3 rounded-2xl bg-card p-4 shadow-card">
          <MapPin className="h-6 w-6 shrink-0 text-primary" />
          <p>{t("officeAddress")}</p>
        </div>
        <Button asChild variant="saffron" size="xl" className="w-full">
          <a href={`tel:${OFFICE_PHONE}`}><Phone /> {t("call")}</a>
        </Button>
      </div>
    </MobileShell>
  );
}
