"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, TrendingUp, Clock, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const benefitIcons = [TrendingUp, Clock, UsersIcon];

export default function ForDealers() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="for-dealers" className="py-16 lg:py-24 neu-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
                     className={`grid lg:grid-cols-2 gap-8 lg:gap-20 items-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
              {t("landing.forDealers")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t("landing.forDealersSection.heading")}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              {t("landing.forDealersSection.description")}
            </p>
            <div className="space-y-6">
              {(t("landing.forDealersSection.benefits") as { title: string; description: string }[]).map((b, i) => {
                const Icon = benefitIcons[i];
                return (
                  <div key={b.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 neu-bg neu-shadow-inset rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{b.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{t("landing.forDealersSection.branding")}</span>
            </div>
            <Link
              href="/solutions/dealers"
              className="inline-flex items-center gap-1 mt-6 py-3 text-sm text-blue-700 hover:text-blue-600 font-medium"
            >
              {t("landing.forDealersSection.learnMore")}
            </Link>
          </div>

          <div className="neu-bg rounded-2xl overflow-hidden neu-shadow-inset">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/screenshots/dashboard-preview.png" alt="Dealer Dashboard Preview" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
