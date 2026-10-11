import { useI18n } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex rounded-full bg-card p-1 text-sm font-semibold shadow-card">
      {(["mr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`min-h-9 rounded-full px-3 ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          {l === "mr" ? "मराठी" : "EN"}
        </button>
      ))}
    </div>
  );
}
