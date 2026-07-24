"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-muted-foreground/30 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("common.pageNotFound")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("common.pageNotFoundDesc")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          {t("common.goHome")}
        </Link>
      </div>
    </div>
  );
}
