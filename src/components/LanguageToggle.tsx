"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className={`text-lg leading-none inline-flex items-center justify-center min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg ${
        className || "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
      title={locale === "es" ? "English" : "Español"}
    >
      {locale === "es" ? "🇬🇧" : "🇪🇸"}
      <span className="sr-only">{locale === "es" ? "English" : "Español"}</span>
    </button>
  );
}
