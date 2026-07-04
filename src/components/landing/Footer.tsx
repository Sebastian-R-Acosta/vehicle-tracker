"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const columns = [
  {
    titleKey: "nav.features",
    links: [
      { labelKey: "nav.features", href: "/#features" },
      { labelKey: "nav.pricing", href: "/pricing" },
      { labelKey: "landing.forIndividuals", href: "/solutions/individuals" },
      { labelKey: "landing.forDealers", href: "/solutions/dealers" },
      { labelKey: "landing.forInsurers", href: "/solutions/insurers" },
    ],
  },
  {
    titleKey: "nav.settings",
    links: [
      { labelKey: "landing.forConstruction", href: "/solutions/construction" },
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    titleKey: "nav.solutions",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Documentation", href: "/docs" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    titleKey: "nav.dashboard",
    links: [
      { labelKey: "nav.login", href: "/login" },
      { labelKey: "nav.getStarted", href: "/register" },
      { labelKey: "nav.dashboard", href: "/dashboard" },
    ],
  },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo-icon.svg" alt="Vehicle Tracker" className="h-8 w-auto" />
              <span className="text-lg font-bold text-white">Vehicle Tracker</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t("landing.heroSubtitle")}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-sm font-semibold text-white mb-4">{t(col.titleKey)}</h4>
              <ul className="space-y-3">
                  {col.links.map((link: any) => (
                  <li key={link.label || link.labelKey}>
                    <Link
                      href={link.href}
                      className="inline-block py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.labelKey ? t(link.labelKey) : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Vehicle Tracker. {t("landing.footerRights")}
          </p>
          <div className="flex items-center gap-6">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer">LinkedIn</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
