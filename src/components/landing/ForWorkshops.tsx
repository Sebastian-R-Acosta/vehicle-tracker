"use client";

import { Wrench, Calendar, Clock, BarChart3, Users, Package } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const benefitIcons = [Calendar, Wrench, Clock, Package, Users, BarChart3];

export default function ForWorkshops() {
  const { t } = useLanguage();
  return (
    <section className="py-16 lg:py-24 bg-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-200 text-teal-800 text-sm font-medium rounded-full mb-4">
            {t("landing.forWorkshops")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("landing.forWorkshopsSection.heading")}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t("landing.forWorkshopsSection.description")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {(t("landing.forWorkshopsSection.benefits") as { title: string; description: string }[]).map((b, i) => {
            const Icon = benefitIcons[i];
            return (
              <div key={b.title} className="p-6 bg-white rounded-xl border border-teal-200">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/solutions/workshops"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-all shadow-lg hover:shadow-xl"
          >
            {t("landing.forWorkshopsSection.learnMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}
