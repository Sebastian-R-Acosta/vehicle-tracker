"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { es, type Translations } from "./es";
import { en } from "./en";

type Locale = "es" | "en";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => any;
}

const translations: Record<Locale, Translations> = { es, en };

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveNested(obj: any, path: string): any {
  const keys = path.split(".");
  let val = obj;
  for (const key of keys) {
    val = val?.[key];
  }
  return val ?? path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored === "es" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem("locale", loc);
  }, []);

  const t = useCallback(
    (path: string) => resolveNested(translations[locale], path),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
