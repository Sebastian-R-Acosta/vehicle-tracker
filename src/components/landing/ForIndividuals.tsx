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
    <section id="for-individuals" className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full mb-4">
            {t("landing.forIndividuals")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("landing.forIndividualsSection.heading")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                className={`p-6 bg-secondary/50 rounded-xl border border-border transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-green-600 rounded-xl hover:bg-green-500 transition-all shadow-lg hover:shadow-xl"
          >
            {t("landing.forIndividualsSection.cta")}
          </Link>
          <div className="mt-4">
            <Link
              href="/solutions/individuals"
              className="inline-block py-3 text-sm text-green-600 dark:text-green-400 hover:text-green-500 font-medium"
            >
              {t("landing.forIndividualsSection.learnMore")}
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("landing.forIndividualsSection.noCard")}</p>
        </div>
      </div>
    </section>
  );
}
