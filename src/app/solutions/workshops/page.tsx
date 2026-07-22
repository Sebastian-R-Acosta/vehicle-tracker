"use client";

import PageLayout from "@/components/landing/PageLayout";
import { Wrench, Calendar, Clock, BarChart3, Users, Package, Gauge, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const icons = [Calendar, Wrench, Clock, Package, Users, BarChart3, Gauge, RefreshCw];

export default function WorkshopsPage() {
  const { t } = useLanguage();
  const benefits = t("solutions.workshops.benefits") as { title: string; description: string }[];

  return (
    <PageLayout>
      <section className="pt-32 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-sm font-medium rounded-full mb-6">
                {t("solutions.workshops.badge")}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                {t("solutions.workshops.heading")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("solutions.workshops.description")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-all shadow-lg"
                >
                  {t("solutions.workshops.cta")}
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-teal-600 dark:text-teal-400 border-2 border-teal-200 dark:border-teal-800/30 rounded-xl hover:border-teal-400 transition-all"
                >
                  {t("solutions.workshops.viewPricing")}
                </Link>
              </div>
            </div>
            <div className="bg-secondary rounded-2xl overflow-hidden shadow-inner">
              <img src="/screenshots/dashboard-preview.png" alt="Dashboard Preview" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t("solutions.workshops.sectionHeading")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("solutions.workshops.sectionDesc")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b: { title: string; description: string }, i: number) => {
              const Icon = icons[i];
              return (
                <div key={b.title} className="p-6 bg-card rounded-xl border border-border">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-950/30 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">{t("solutions.workshops.ctaHeading")}</h2>
          <p className="text-muted-foreground mb-8">{t("solutions.workshops.ctaDesc")}</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-all"
          >
            {t("solutions.workshops.ctaButton")}
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">{t("solutions.workshops.ctaFootnote")}</p>
        </div>
      </section>
    </PageLayout>
  );
}
