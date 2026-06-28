"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className={`text-lg leading-none ${className || "p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"}`}
      title={locale === "es" ? "English" : "Español"}
    >
      {locale === "es" ? "🇬🇧" : "🇪🇸"}
      <span className="sr-only">{locale === "es" ? "English" : "Español"}</span>
    </button>
  );
}
