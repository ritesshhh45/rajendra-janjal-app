import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Search, ChevronRight } from "lucide-react";
import { MobileShell, EmptyState, ErrorState } from "@/components/app/MobileShell";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { schemesQuery, useL } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { getSchemeVisual } from "@/lib/visuals";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes — Digital Ward" },
      { name: "description", content: "Browse government schemes, eligibility and how to apply." },
      { property: "og:title", content: "Government Schemes — Digital Ward" },
      { property: "og:description", content: "Government schemes for citizens of Chhatrapati Sambhajinagar." },
    ],
  }),
  component: Schemes,
});

function Schemes() {
  const { t } = useI18n();
  const L = useL();
  const { data, isLoading, isError } = useQuery(schemesQuery);
  const [q, setQ] = useState("");
  const list = (data ?? []).filter((s) =>
    `${s.title_en} ${s.title_mr} ${s.description_mr ?? ""} ${s.description_en ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <MobileShell title={t("schemes")} back>
      <div className="space-y-3 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="h-12 pl-10 text-base" />
        </div>
        {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        {isError && <ErrorState />}
        {!isLoading && !isError && list.length === 0 && <EmptyState icon={FileText} text={t("empty")} />}
        {list.map((s) => (
          <Link
            key={s.id}
            to="/schemes/$id"
            params={{ id: s.id }}
            className="flex min-w-0 items-center gap-3 rounded-3xl bg-card p-3 shadow-card active:scale-[0.99]"
          >
            <img
              src={getSchemeVisual(L(s.title_mr, s.title_en)).image}
              alt={getSchemeVisual(L(s.title_mr, s.title_en)).alt}
              width={112} height={112} loading="lazy" decoding="async"
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold leading-snug">{L(s.title_mr, s.title_en)}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{L(s.description_mr, s.description_en)}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}
