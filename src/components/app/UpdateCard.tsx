import { Link } from "@tanstack/react-router";
import {
  AlertTriangle, ArrowRight, Droplets, Construction, Sparkles, HeartPulse, Megaphone, GraduationCap, Zap, Trees,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useL } from "@/lib/content";

type Update = {
  id: string; created_at: string; is_alert: boolean;
  category_mr: string; category_en: string; title_mr: string; title_en: string; body_mr: string; body_en: string;
};

const THEMES: Array<{ match: RegExp; grad: string; icon: LucideIcon }> = [
  { match: /water|पाणी|जल/i, grad: "from-sky-500 to-blue-700", icon: Droplets },
  { match: /health|आरोग्य|वैद्यकीय/i, grad: "from-rose-500 to-pink-700", icon: HeartPulse },
  { match: /clean|swach|स्वच्छ|कचरा/i, grad: "from-emerald-500 to-green-700", icon: Sparkles },
  { match: /electric|power|वीज|विद्युत/i, grad: "from-amber-500 to-yellow-700", icon: Zap },
  { match: /educat|school|शिक्षण|शाळा/i, grad: "from-indigo-500 to-violet-700", icon: GraduationCap },
  { match: /garden|tree|उद्यान|वृक्ष/i, grad: "from-lime-500 to-green-700", icon: Trees },
  { match: /develop|road|work|विकास|रस्ता|काम/i, grad: "from-orange-500 to-orange-700", icon: Construction },
];
const DEFAULT_THEME = { grad: "from-orange-500 to-red-600", icon: Megaphone };

export function ago(iso: string, lang: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(lang === "mr" ? "mr-IN" : "en", { numeric: "auto", style: "short" });
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60) || 0, "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

export function UpdateCard({ u }: { u: Update }) {
  const { lang } = useI18n();
  const L = useL();
  const theme = u.is_alert
    ? { grad: "from-red-500 to-orange-600", icon: AlertTriangle }
    : THEMES.find((x) => x.match.test(`${u.category_en} ${u.category_mr}`)) ?? DEFAULT_THEME;
  const Icon = theme.icon;
  const fresh = Date.now() - new Date(u.created_at).getTime() < 24 * 3600 * 1000;

  return (
    <Link
      to="/updates"
      className={`relative flex min-h-[11.5rem] w-[min(78vw,300px)] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-linear-to-br ${theme.grad} p-4 text-white shadow-card active:scale-[0.98]`}
    >
      <Icon aria-hidden className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 rotate-[-12deg] text-white/15" />
      <div className="relative flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur">
          <Icon className="h-3.5 w-3.5" /> {L(u.category_mr, u.category_en)}
        </span>
        {(fresh || u.is_alert) && (
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-red-600">
            {u.is_alert ? (lang === "mr" ? "महत्त्वाचे" : "Important") : (lang === "mr" ? "नवीन" : "New")}
          </span>
        )}
        <span className="ml-auto text-xs font-medium text-white/80">{ago(u.created_at, lang)}</span>
      </div>
      <p className="relative mt-3 line-clamp-2 font-display text-lg font-bold leading-snug">{L(u.title_mr, u.title_en)}</p>
      <p className="relative mt-1 line-clamp-2 text-sm leading-snug text-white/85">{L(u.body_mr, u.body_en)}</p>
      <span className="relative mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold">
        {lang === "mr" ? "अधिक वाचा" : "Read more"} <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
