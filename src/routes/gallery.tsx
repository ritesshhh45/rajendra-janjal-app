import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { MobileShell, EmptyState } from "@/components/app/MobileShell";
import { Skeleton } from "@/components/ui/skeleton";
import { galleryQuery } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Digital Ward" },
      { name: "description", content: "Photos of ward work and events with Rajendra Janjal." },
      { property: "og:title", content: "Gallery — Digital Ward" },
      { property: "og:description", content: "Photos of ward work and events." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(galleryQuery);
  const [idx, setIdx] = useState<number | null>(null);
  const touchX = useRef(0);
  const items = data ?? [];
  const go = (d: number) => setIdx((i) => (i === null ? i : (i + d + items.length) % items.length));

  return (
    <MobileShell title={t("gallery")}>
      <div className="grid grid-cols-3 gap-1 p-1">
        {isLoading && Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-none" />)}
        {items.map((g, i) => (
          <button key={g.id} onClick={() => setIdx(i)} className="aspect-square overflow-hidden">
            <img src={g.image_url} alt={g.caption ?? ""} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {!isLoading && items.length === 0 && <EmptyState icon={Images} text={t("empty")} />}

      {idx !== null && items[idx] && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-foreground"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          <div className="flex justify-end p-3">
            <button onClick={() => setIdx(null)} aria-label="Close" className="grid h-12 w-12 place-items-center rounded-full text-background">
              <X className="h-7 w-7" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <img src={items[idx].image_url} alt="" className="max-h-full max-w-full object-contain" />
            <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-1 grid h-12 w-12 place-items-center text-background">
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={() => go(1)} aria-label="Next" className="absolute right-1 grid h-12 w-12 place-items-center text-background">
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
          <p className="p-5 text-center text-background">{items[idx].caption}</p>
        </div>
      )}
    </MobileShell>
  );
}
