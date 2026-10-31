import {
  Droplets, Construction, Trash2, Zap, Lightbulb, HeartPulse, GraduationCap, Trees, Wrench,
  HandHeart, Flame, FileText, Home, Landmark, type LucideIcon,
} from "lucide-react";

/**
 * Category photo resolver.
 * Uses real subject photography (not generic tool icons) and keeps a local
 * Lucide fallback if a remote photo cannot load.
 */
const photos: Array<{ terms: string[]; url: string }> = [
  { terms: ["water", "पाणी", "पाणीपुरवठा", "tap", "जल"], url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=480&q=82" },
  { terms: ["road", "रस्ता", "खड्डा", "asphalt", "pothole"], url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=480&q=82" },
  { terms: ["pipeline", "pipe", "पाईप", "पाइप"], url: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=480&q=82" },
  { terms: ["street light", "streetlight", "led", "पथदिवे", "दिवे", "लाईट"], url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=480&q=82" },
  { terms: ["drain", "sewer", "गटार", "ड्रेनेज", "नाली"], url: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=480&q=82" },
  { terms: ["garbage", "trash", "waste", "कचरा", "स्वच्छता"], url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=480&q=82" },
  { terms: ["garden", "tree", "park", "उद्यान", "बाग", "वृक्ष"], url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=480&q=82" },
  { terms: ["health", "hospital", "आरोग्य", "रुग्णालय", "वैद्यकीय"], url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=480&q=82" },
  { terms: ["education", "school", "शिक्षण", "शाळा"], url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=480&q=82" },
  { terms: ["electricity", "power", "वीज", "विद्युत"], url: "https://images.unsplash.com/photo-1473341304170-971aacb9e8cc?auto=format&fit=crop&w=480&q=82" },
  { terms: ["housing", "home", "house", "घरकुल", "निवास"], url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=480&q=82" },
  { terms: ["welfare", "social", "scheme", "योजना", "कल्याण"], url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=480&q=82" },
  { terms: ["appointment", "meeting", "भेट", "अपॉइंटमेंट"], url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=480&q=82" },
  { terms: ["notice", "announcement", "सूचना", "अपडेट"], url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=480&q=82" },
];

const map: Record<string, LucideIcon> = {
  Droplets, Construction, Trash2, Zap, Lightbulb, HeartPulse, GraduationCap, Trees, Wrench,
  HandHeart, Flame, FileText, Home, Landmark,
};

export function resolveCategoryPhoto(...values: Array<string | null | undefined>) {
  const text = values.filter(Boolean).join(" ").toLocaleLowerCase();
  return photos.find(({ terms }) => terms.some((term) => text.includes(term)))?.url ?? null;
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
        referrerPolicy="no-referrer"
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
