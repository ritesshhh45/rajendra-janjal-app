import { Phone, MessageCircle, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useL, useSettings, waLink, mapsLink } from "@/lib/content";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaderCard() {
  const { t } = useI18n();
  const L = useL();
  const { data: s } = useSettings();
  if (!s) return <Skeleton className="mx-5 h-48 rounded-3xl" />;
  const btn = "flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold active:scale-[0.97]";
  return (
    <div className="mx-5 rounded-3xl bg-card p-4 shadow-card">
      <div className="flex items-center gap-4">
        <div className="shrink-0 rounded-full bg-gold-ring p-[3px]">
          <img src={s.leader_photo_url} alt="" className="h-20 w-20 rounded-full border-2 border-card object-cover object-top" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold leading-tight">{L(s.name_mr, s.name_en)}</p>
          <p className="text-sm text-muted-foreground">{L(s.designation_mr, s.designation_en)} · {L(s.ward_mr, s.ward_en)}</p>
          {L(s.slogan_mr, s.slogan_en) && <p className="mt-1 text-sm font-semibold italic text-success">“{L(s.slogan_mr, s.slogan_en)}”</p>}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <a href={s.office_phone ? `tel:${s.office_phone}` : undefined} aria-disabled={!s.office_phone} className={`${btn} bg-secondary text-secondary-foreground aria-disabled:opacity-50`}>
          <Phone className="h-4 w-4" /> {t("callBtn")}
        </a>
        <a href={s.office_whatsapp ? waLink(s.office_whatsapp) : undefined} target="_blank" rel="noreferrer" aria-disabled={!s.office_whatsapp} className={`${btn} bg-success text-success-foreground aria-disabled:opacity-50`}>
          <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
        </a>
        <a href={mapsLink(s)} target="_blank" rel="noreferrer" className={`${btn} bg-saffron text-primary-foreground`}>
          <MapPin className="h-4 w-4" /> {t("office")}
        </a>
      </div>
    </div>
  );
}
