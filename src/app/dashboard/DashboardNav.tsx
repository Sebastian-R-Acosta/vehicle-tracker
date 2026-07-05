"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Bell, Building2, Package, Wrench, Users, Scan, LogOut, User, Shield,
  Menu, X, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import OrgSwitcher from "@/components/OrgSwitcher";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  mobileLabel?: string;
}

export function DashboardNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/user/role")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.role === "admin"))
      .catch(() => {});
  }, []);

  const navItems: NavItem[] = [
    { href: "/dashboard", label: t("dashboard.home.title"), icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/dashboard/construction-sites", label: t("nav.constructionSites"), icon: <Building2 className="w-4 h-4" /> },
    { href: "/dashboard/parts", label: t("nav.parts"), icon: <Package className="w-4 h-4" /> },
    { href: "/dashboard/service-providers", label: t("nav.serviceProviders"), icon: <Wrench className="w-4 h-4" /> },
    { href: "/dashboard/drivers", label: t("nav.drivers"), icon: <Users className="w-4 h-4" /> },
    { href: "/dashboard/scan", label: t("nav.scan"), icon: <Scan className="w-4 h-4" /> },
    { href: "/dashboard/profile", label: t("nav.settings"), icon: <User className="w-4 h-4" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const closeDrawer = useCallback(() => {
    setMobileOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) closeDrawer();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeDrawer]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <img src="/logo-icon.png" alt="Bitácora" className="h-8 w-auto" />
              <span className="text-xl font-bold text-foreground hidden sm:inline">Bitácora</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="hidden sm:flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 px-2 py-1 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-950/60 transition-colors"
              >
                <Shield className="w-3 h-3" />
                admin
              </Link>
            )}
            <Link
              href="/dashboard/notifications"
              className="hidden sm:flex p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              title={t("nav.reminders")}
            >
              <Bell className="w-5 h-5" />
            </Link>
            <div className="hidden sm:block">
              <OrgSwitcher />
            </div>
            <LanguageToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="hidden sm:flex p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              title={t("nav.logout")}
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button
              ref={toggleRef}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-250 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-card border-l border-border shadow-2xl transform transition-transform duration-250 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            onClick={closeDrawer}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-150 min-h-[44px] ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 space-y-3">
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              onClick={closeDrawer}
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950/40 min-h-[44px]"
            >
              <Shield className="w-4 h-4" />
              Admin panel
            </Link>
          )}
          <Link
            href="/dashboard/notifications"
            onClick={closeDrawer}
            className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg min-h-[44px]"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </Link>
          <div className="px-1">
            <OrgSwitcher />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
