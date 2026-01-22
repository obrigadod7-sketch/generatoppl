import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, TranslationKey } from "@/i18n/translations";
import { translations } from "@/i18n/translations";

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  // Accept string keys to avoid type breakage when translations evolve.
  t: (key: TranslationKey | string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "mel_locale";

function detectLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "pt" || saved === "en" || saved === "fr") return saved;

  const nav = (navigator.language || "").toLowerCase();
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("en")) return "en";
  return "pt";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: TranslationKey | string) => {
      const current = translations[locale] as Record<string, string>;
      const fallback = translations.pt as Record<string, string>;
      return current[key] ?? fallback[key] ?? key;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
