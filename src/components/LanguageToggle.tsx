"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
      title={locale === "es" ? "English" : "Español"}
    >
      <Languages className="w-5 h-5" />
      <span className="sr-only">{locale === "es" ? "English" : "Español"}</span>
    </button>
  );
}
