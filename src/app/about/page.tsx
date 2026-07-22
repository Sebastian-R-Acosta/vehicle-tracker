"use client";

import PageLayout from "@/components/landing/PageLayout";
import { Shield, Lightbulb, Lock, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const values = [
  { icon: Shield, titleKey: "common.aboutValueTransparency", descKey: "common.aboutValueTransparencyDesc" },
  { icon: Lightbulb, titleKey: "common.aboutValueSimplicity", descKey: "common.aboutValueSimplicityDesc" },
  { icon: Lock, titleKey: "common.aboutValueSecurity", descKey: "common.aboutValueSecurityDesc" },
  { icon: Sparkles, titleKey: "common.aboutValueInnovation", descKey: "common.aboutValueInnovationDesc" },
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      <section className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("common.aboutTitle")}</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t("common.aboutSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("common.aboutMission")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("common.aboutMissionText")}
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("common.aboutVision")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("common.aboutVisionText")}
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">{t("common.aboutCoreValues")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.titleKey} className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(v.titleKey)}</h3>
                  <p className="text-sm text-gray-500">{t(v.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
