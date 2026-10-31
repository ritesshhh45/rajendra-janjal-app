import {
  Droplets, Construction, Trash2, Zap, Lightbulb, HeartPulse, GraduationCap, Trees, Wrench,
  HandHeart, Flame, FileText, Home, Landmark, type LucideIcon,
} from "lucide-react";

import { matchServiceImage } from "@/lib/visuals";

const map: Record<string, LucideIcon> = {
  Droplets, Construction, Trash2, Zap, Lightbulb, HeartPulse, GraduationCap, Trees, Wrench,
  HandHeart, Flame, FileText, Home, Landmark,
};

/** Local (bundled) photo for a category, or null when nothing matches. */
export function resolveCategoryPhoto(...values: Array<string | null | undefined>) {
  return matchServiceImage(...values);
}

/** Shows a subject photo for known categories and a semantic icon as fallback. */
export function DbIcon({
  name, label, fallback = Wrench, className,
}: {
  name?: string | null;
  label?: string | null;
  fallback?: LucideIcon;
  className?: string;
}) {
  const photo = resolveCategoryPhoto(name, label);
  const I = (name && map[name]) || fallback;
  return photo ? (
    <span className="relative block h-full w-full overflow-hidden rounded-xl">
      <img
        src={photo}
        alt={label || name || "Service"}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          event.currentTarget.style.display = "none";
          event.currentTarget.parentElement?.querySelector("[data-photo-fallback]")?.classList.remove("hidden");
        }}
        className="h-full w-full object-cover"
      />
      <span data-photo-fallback className="absolute inset-0 hidden grid place-items-center bg-secondary text-primary">
        <I className="h-7 w-7" />
      </span>
    </span>
  ) : <I className={className} />;
}
