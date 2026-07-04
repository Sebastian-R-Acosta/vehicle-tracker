"use client";

import PageLayout from "@/components/landing/PageLayout";
import { CheckCircle, TrendingUp, Clock, Users, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const icons = [TrendingUp, Clock, Users, BarChart3, Settings, CheckCircle];

export default function DealersPage() {
  const { t } = useLanguage();
  const benefits = t("solutions.dealers.benefits") as { title: string; description: string }[];

  return (
    <PageLayout>
      <section className="pt-32 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
                {t("solutions.dealers.badge")}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {t("solutions.dealers.heading")}
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                {t("solutions.dealers.description")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg"
                >
                  {t("solutions.dealers.cta")}
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:border-blue-400 transition-all"
                >
                  {t("solutions.dealers.viewPricing")}
                </Link>
              </div>
            </div>
            <div className="bg-gray-200 rounded-2xl aspect-[4/3] flex items-center justify-center">
              <span className="text-gray-400 font-medium">{t("solutions.dealers.preview")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("solutions.dealers.sectionHeading")}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t("solutions.dealers.sectionDesc")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b: { title: string; description: string }, i: number) => {
              const Icon = icons[i];
              return (
                <div key={b.title} className="p-6 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("solutions.dealers.ctaHeading")}</h2>
          <p className="text-gray-500 mb-8">{t("solutions.dealers.ctaDesc")}</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all"
          >
            {t("solutions.dealers.ctaButton")}
          </Link>
          <p className="mt-3 text-sm text-gray-400">{t("solutions.dealers.ctaFootnote")}</p>
        </div>
      </section>
    </PageLayout>
  );
}
