"use client";

import PageLayout from "@/components/landing/PageLayout";
import { Smartphone, Bell, FileText, Car, Gauge, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const icons = [Smartphone, Bell, FileText, Car, Gauge, RefreshCw];

export default function IndividualsPage() {
  const { t } = useLanguage();
  const perks = t("solutions.individuals.perks") as { title: string; description: string }[];
  const steps = t("solutions.individuals.howItWorks") as { title: string; desc: string }[];

  return (
    <PageLayout>
      <section className="pt-32 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
              {t("solutions.individuals.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t("solutions.individuals.heading")}
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t("solutions.individuals.description")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {perks.map((perk: { title: string; description: string }, i: number) => {
              const Icon = icons[i];
              return (
                <div key={perk.title} className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{perk.title}</h3>
                  <p className="text-sm text-gray-500">{perk.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-green-600 rounded-xl hover:bg-green-500 transition-all shadow-lg hover:shadow-xl"
            >
              {t("solutions.individuals.cta")}
            </Link>
            <p className="mt-3 text-sm text-gray-400">{t("solutions.individuals.noCard")}</p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("solutions.individuals.howItWorksHeading")}</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((item: { title: string; desc: string }, i: number) => (
              <div key={item.title}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-700 font-bold text-lg">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("solutions.individuals.ctaHeading")}</h2>
          <p className="text-gray-500 mb-8">{t("solutions.individuals.ctaDesc")}</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-green-600 rounded-xl hover:bg-green-500 transition-all"
          >
            {t("solutions.individuals.ctaButton")}
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
