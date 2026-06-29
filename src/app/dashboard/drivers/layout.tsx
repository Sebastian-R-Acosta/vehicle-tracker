"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DriversLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isRoot = pathname === "/dashboard/drivers";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              {!isRoot && (
                <Link
                  href="/dashboard/drivers"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("common.back")}
                </Link>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">{t("nav.drivers")}</h1>
              </div>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
