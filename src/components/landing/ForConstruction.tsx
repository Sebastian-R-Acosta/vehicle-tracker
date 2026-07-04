"use client";

import { HardHat, Drill, Clock, BarChart3, MapPin, Wrench } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const benefitIcons = [HardHat, MapPin, Clock, BarChart3, Wrench, Drill];

export default function ForConstruction() {
  const { t } = useLanguage();
  return (
    <section className="py-16 lg:py-24 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-200 text-amber-800 text-sm font-medium rounded-full mb-4">
            {t("landing.forConstruction")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("landing.forConstructionSection.heading")}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t("landing.forConstructionSection.description")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {(t("landing.forConstructionSection.benefits") as { title: string; description: string }[]).map((b, i) => {
            const Icon = benefitIcons[i];
            return (
              <div key={b.title} className="p-6 bg-white rounded-xl border border-amber-200">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/solutions/construction"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-500 transition-all shadow-lg hover:shadow-xl"
          >
            {t("landing.forConstructionSection.learnMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}
