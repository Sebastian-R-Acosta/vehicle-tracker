"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("common.pageNotFound")}</h1>
        <p className="text-gray-500 mb-8">
          {t("common.pageNotFoundDesc")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors"
        >
          {t("common.goHome")}
        </Link>
      </div>
    </div>
  );
}
