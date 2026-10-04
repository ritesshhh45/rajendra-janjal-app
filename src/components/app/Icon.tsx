import {
  Droplets, Construction, Trash2, Zap, Lightbulb, HeartPulse, GraduationCap, Trees, Wrench,
  HandHeart, Flame, FileText, Home, Landmark, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Droplets, Construction, Trash2, Zap, Lightbulb, HeartPulse, GraduationCap, Trees, Wrench,
  HandHeart, Flame, FileText, Home, Landmark,
};

/** Renders an icon stored by name in the database (falls back to a generic one). */
export function DbIcon({ name, fallback = Wrench, className }: { name?: string | null; fallback?: LucideIcon; className?: string }) {
  const I = (name && map[name]) || fallback;
  return <I className={className} />;
}
