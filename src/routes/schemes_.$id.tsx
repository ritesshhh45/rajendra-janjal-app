import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText } from "lucide-react";
import { MobileShell, EmptyState } from "@/components/app/MobileShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { schemesQuery, useL } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/schemes_/$id")({
  head: () => ({
    meta: [
      { title: "Scheme details — Digital Ward" },
      { name: "description", content: "Scheme description, eligibility and how to apply." },
      { property: "og:title", content: "Scheme details — Digital Ward" },
      { property: "og:description", content: "Scheme description, eligibility and how to apply." },
    ],
  }),
  component: SchemeDetail,
});

function SchemeDetail() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const L = useL();
  const { data, isLoading } = useQuery(schemesQuery);
  const s = data?.find((x) => x.id === id);

  return (
    <MobileShell title={t("schemes")} back>
      {isLoading ? (
        <div className="space-y-3 p-4"><Skeleton className="h-48" /><Skeleton className="h-24" /></div>
      ) : !s ? (
        <EmptyState icon={FileText} text={t("empty")} />
      ) : (
        <article className="space-y-5 p-5">
          {s.image_url && <img src={s.image_url} alt="" className="w-full rounded-2xl object-cover" />}
          <h2 className="font-display text-2xl font-bold leading-tight">{L(s.title_mr, s.title_en)}</h2>
          {L(s.description_mr, s.description_en) && <p className="text-base leading-relaxed">{L(s.description_mr, s.description_en)}</p>}
          {s.eligibility && <Section title={t("eligibility")} body={s.eligibility} />}
          {s.how_to_apply && <Section title={t("howToApply")} body={s.how_to_apply} />}
          {s.apply_link && (
            <Button asChild variant="saffron" size="xl" className="w-full">
              <a href={s.apply_link} target="_blank" rel="noreferrer">
                {t("applyNow")} <ExternalLink />
              </a>
            </Button>
          )}
        </article>
      )}
    </MobileShell>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl bg-secondary p-4">
      <h3 className="mb-1 font-display font-bold text-secondary-foreground">{title}</h3>
      <p className="whitespace-pre-line leading-relaxed">{body}</p>
    </section>
  );
}
