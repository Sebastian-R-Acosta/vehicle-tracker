"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone, Bell, FileText, Car, Gauge, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const perkIcons = [Smartphone, Bell, FileText, Car, Gauge, RefreshCw];

export default function ForIndividuals() {
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
    <section id="for-individuals" className="py-16 lg:py-24 neu-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
            {t("landing.forIndividuals")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("landing.forIndividualsSection.heading")}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t("landing.forIndividualsSection.description")}
          </p>
        </div>

        <div
          ref={ref}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {(t("landing.forIndividualsSection.perks") as { title: string; description: string }[]).map((perk, i) => {
            const Icon = perkIcons[i];
            return (
              <div
                key={perk.title}
                className={`p-6 neu-bg rounded-2xl neu-shadow transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 neu-bg neu-shadow-inset rounded-xl flex items-center justify-center mb-4">
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
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-green-600 rounded-xl hover:brightness-110 transition-all neu-shadow-sm"
          >
            {t("landing.forIndividualsSection.cta")}
          </Link>
          <div className="mt-4">
            <Link
              href="/solutions/individuals"
              className="inline-block py-3 text-sm text-green-700 hover:text-green-600 font-medium"
            >
              {t("landing.forIndividualsSection.learnMore")}
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-400">{t("landing.forIndividualsSection.noCard")}</p>
        </div>
      </div>
    </section>
  );
}
