import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES } from "@/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="inline-flex items-center gap-2">
      <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/80 md:inline">
        {t("language")}
      </span>
      <div className="inline-flex overflow-hidden rounded-md border border-primary-foreground/20 bg-mel-overlay/25 backdrop-blur">
        {LOCALES.map((opt) => {
          const active = opt.value === locale;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLocale(opt.value)}
              className={
                "px-3 py-2 font-display text-[10px] font-semibold uppercase tracking-[0.28em] transition-colors " +
                (active
                  ? "bg-card/85 text-foreground"
                  : "text-primary-foreground/85 hover:bg-primary-foreground/10")
              }
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
