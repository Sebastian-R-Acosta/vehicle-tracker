"use client";

import { Bell, Building2, Package, Wrench, Users, Scan, LogOut, User, Shield } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import OrgSwitcher from "@/components/OrgSwitcher";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function DashboardNav() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/user/role")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.role === "admin"))
      .catch(() => {});
  }, []);

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
               <img src="/logo-icon.png" alt="Bitácora" className="h-8 w-auto" />
              <span className="text-xl font-bold text-foreground hidden sm:inline">Bitácora</span>
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <OrgSwitcher />
              <Link
                href="/dashboard/construction-sites"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
                title={t("nav.constructionSites")}
              >
                <Building2 className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/parts"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
                title={t("nav.parts")}
              >
                <Package className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/service-providers"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
                title={t("nav.serviceProviders")}
              >
                <Wrench className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/drivers"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
                title={t("nav.drivers")}
              >
                <Users className="w-5 h-5" />
              </Link>
            <Link
              href="/dashboard/scan"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
              title={t("nav.scan")}
            >
              <Scan className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard/profile"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
              title={t("nav.settings")}
            >
              <User className="w-5 h-5" />
            </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 px-2 py-1 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-950/60 transition-colors"
              >
                <Shield className="w-3 h-3" />
                admin
              </Link>
            )}
            <Link
              href="/dashboard/notifications"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              title={t("nav.reminders")}
            >
              <Bell className="w-5 h-5" />
            </Link>
            <LanguageToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              title={t("nav.logout")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
