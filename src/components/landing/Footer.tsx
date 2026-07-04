"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const columns = [
  {
    titleKey: "nav.about",
    links: [
      { labelKey: "nav.about", href: "/about" },
      { labelKey: "nav.pricing", href: "/pricing" },
      { labelKey: "landing.forIndividuals", href: "/solutions/individuals" },
      { labelKey: "landing.forDealers", href: "/solutions/dealers" },
      { labelKey: "landing.forInsurers", href: "/solutions/insurers" },
      { labelKey: "landing.forWorkshops", href: "/solutions/workshops" },
    ],
  },
  {
    titleKey: "nav.settings",
    links: [
      { labelKey: "landing.forConstruction", href: "/solutions/construction" },
      { label: "About", href: "/about" },
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
    <footer className="neu-bg neu-shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.png" alt="Vehicle Tracker" className="h-8 w-auto" />
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">Vehicle Tracker</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400 leading-relaxed">
              {t("landing.footerDescription")}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">{t(col.titleKey)}</h4>
              <ul className="space-y-3">
                  {col.links.map((link: any) => (
                  <li key={link.label || link.labelKey}>
                    <Link
                      href={link.href}
                      className="inline-block py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">{link.labelKey ? t(link.labelKey) : link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Vehicle Tracker. {t("landing.footerRights")}
          </p>
          <div className="flex items-center gap-6">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">LinkedIn</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
