import { useI18n } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex shrink-0 rounded-full bg-card p-0.5 text-xs font-semibold shadow-card">
      {(["mr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`min-h-8 rounded-full px-2.5 sm:px-3 ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          {l === "mr" ? "मराठी" : "EN"}
        </button>
      ))}
    </div>
  );
}
