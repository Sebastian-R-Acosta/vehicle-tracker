"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-7 h-7 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("errors.generic")}</h1>
        <p className="text-muted-foreground mb-8">
          {error.message || t("dashboard.error.unexpected")}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {t("common.tryAgain")}
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 text-foreground border border-border rounded-lg font-semibold hover:bg-accent transition-colors"
          >
            {t("common.goToDashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
