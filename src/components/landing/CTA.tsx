"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import Link from "next/link";

export default function CTA({ onBookDemo }: { onBookDemo: () => void }) {
  const { t } = useLanguage();

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 rounded-full text-sm text-blue-300 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          {t("landing.ctaTitle")}
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          {t("landing.ctaTitle")}
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
          {t("landing.ctaSubtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:shadow-xl"
          >
            {t("landing.ctaButton")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onBookDemo}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-blue-300 border border-blue-400/30 rounded-xl hover:bg-white/5 transition-all"
          >
            {t("landing.heroDemo")}
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-400">{t("landing.footerRights")}</p>
      </div>
    </section>
  );
}
