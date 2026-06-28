"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, LogIn, ChevronDown } from "lucide-react";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const solutions = [
  {
    href: "/solutions/individuals",
    labelKey: "landing.forIndividuals",
    descKey: "landing.forIndividuals",
  },
  {
    href: "/solutions/dealers",
    labelKey: "landing.forDealers",
    descKey: "landing.forDealers",
  },
  {
    href: "/solutions/insurers",
    labelKey: "landing.forInsurers",
    descKey: "landing.forInsurers",
  },
  {
    href: "/solutions/construction",
    labelKey: "landing.forConstruction",
    descKey: "landing.forConstruction",
  },
];

export default function Nav({ onBookDemo }: { onBookDemo?: () => void }) {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5">
              <div className="bg-white rounded p-1">
                <img src="/logo.jpg" alt="Vehicle Tracker" className="h-7 w-auto block" />
              </div>
              <span className="text-lg font-bold text-white">Vehicle Tracker</span>
            </a>

            <div className="hidden md:flex items-center" ref={dropdownRef}>
              <button
                onClick={() => setSolutionsOpen(!solutionsOpen)}
                className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors px-3 py-2.5"
              >
                {t("nav.solutions")}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${solutionsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {solutionsOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-gray-900 border border-white/10 rounded-xl shadow-2xl py-3">
                  {solutions.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setSolutionsOpen(false)}
                      className="block px-5 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="text-sm font-medium text-white">{t(s.labelKey)}</div>
                      <div className="text-xs text-gray-400">{t(s.descKey)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-6 ml-4">
              <button
                onClick={() => handleClick("#features")}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {t("nav.features")}
              </button>
              <Link
                href="/pricing"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {t("nav.pricing")}
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg" />
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t("nav.login")}
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all"
            >
              {t("nav.getStarted")}
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-3 text-gray-300 hover:text-white"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-gray-900 border-t border-white/10 px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
          <div className="text-sm font-medium text-gray-400 px-2 pt-1 pb-2 border-b border-white/10">
            {t("nav.solutions")}
          </div>
          {solutions.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-gray-300 hover:text-white py-3"
            >
              {t(s.labelKey)}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-3 mt-2">
            {["nav.features", "nav.pricing"].map((key) => (
              <button
                key={key}
                onClick={() => {
                  setOpen(false);
                  const id = key.split(".")[1];
                  const el = document.querySelector(`#${id}`);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full text-left text-sm text-gray-300 hover:text-white py-3"
              >
                {t(key)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-2 py-2 border-t border-white/10 mt-2 pt-3">
            <LanguageToggle className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg" />
            <span className="text-sm text-gray-400">{t("nav.language")}</span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white py-3"
            onClick={() => setOpen(false)}
          >
            <LogIn className="w-3.5 h-3.5" />
            {t("nav.login")}
          </Link>
          <Link
            href="/register"
            className="block w-full px-5 py-2.5 text-sm font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-500"
            onClick={() => setOpen(false)}
          >
            {t("nav.getStarted")}
          </Link>
        </div>
      )}
    </nav>
  );
}
