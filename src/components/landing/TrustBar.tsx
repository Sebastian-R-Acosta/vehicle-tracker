"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TrustBar() {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-secondary/50 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
          {t("landing.trustBarHeading")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {["/logos/logo-1.svg", "/logos/logo-2.svg", "/logos/logo-3.svg", "/logos/logo-4.svg", "/logos/logo-5.svg"].map((src, i) => (
            <div
              key={i}
              className="w-28 h-10 bg-muted rounded-md flex items-center justify-center"
            >
              <img src={src} alt={`${t("landing.trustBarLogo")} ${i + 1}`} className="h-6 w-auto opacity-50 grayscale" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
