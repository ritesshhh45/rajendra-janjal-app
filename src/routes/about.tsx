import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/app/MobileShell";
import { useSettings, useL } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Rajendra Janjal — Digital Ward" },
      { name: "description", content: "Rajendra Janjal, Deputy Mayor and District Chief (Shiv Sena), Chhatrapati Sambhajinagar." },
      { property: "og:title", content: "About Rajendra Janjal — Digital Ward" },
      { property: "og:description", content: "Deputy Mayor and District Chief, Chhatrapati Sambhajinagar." },
    ],
  }),
  component: About,
});

function About() {
  const { t } = useI18n();
  const { data: s } = useSettings();
  const L = useL();
  return (
    <MobileShell title={t("about")} back>
      <div className="p-5">
        <img src={s?.leader_photo_url} alt="" className="aspect-square w-full rounded-3xl object-cover object-top shadow-card" />
        <h2 className="mt-5 font-display text-2xl font-bold">{s && L(s.name_mr, s.name_en)}</h2>
        <p className="font-semibold text-primary">{s && `${L(s.designation_mr, s.designation_en)} · ${L(s.ward_mr, s.ward_en)}`}</p>
        {s && <p className="mt-2 font-semibold italic text-success">{L(s.slogan_mr, s.slogan_en)}</p>}
        <p className="mt-3 text-base leading-relaxed">{t("aboutText")}</p>
      </div>
    </MobileShell>
  );
}
