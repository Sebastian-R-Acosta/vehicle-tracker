"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell, Building2, Package, Wrench, Users, Scan, LogOut, User, Shield,
  X, LayoutDashboard, Building, Car, Truck, MapPin, Briefcase
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import OrgSwitcher from "@/components/OrgSwitcher";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getIndustryNavItems, IndustryType } from "@/lib/industry-labels";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Building2, Package, Wrench, Users,
  Building, Car, Truck, MapPin, Briefcase,
};

function navIcon(name: string): React.ReactNode {
  const Icon = iconMap[name] || Building2;
  return <Icon className="w-5 h-5" />;
}

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/user/role")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.role === "admin"))
      .catch(() => {});
  }, []);

  const industryType: IndustryType = (session?.user?.industryType as IndustryType) ?? "construction";
  const primaryColor = session?.user?.primaryColor ?? "#2563eb";

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { href: "/dashboard", label: t("dashboard.home.title"), icon: <LayoutDashboard className="w-5 h-5" /> },
    ];
    for (const cfg of getIndustryNavItems(industryType)) {
      items.push({ href: cfg.href, label: t(cfg.label), icon: navIcon(cfg.icon) });
    }
    items.push(
      { href: "/dashboard/scan", label: t("nav.scan"), icon: <Scan className="w-5 h-5" /> },
      { href: "/dashboard/profile", label: t("nav.profile"), icon: <User className="w-5 h-5" /> },
    );
    return items;
  }, [industryType, t]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-250 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-250 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar navigation"
        style={{ '--brand': primaryColor } as React.CSSProperties}
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0" style={{ borderLeft: `4px solid ${primaryColor}` }}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Bitácora" className="h-8 w-auto" />
            <span className="text-xl font-bold text-foreground">Bitácora</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                  active
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                style={active ? { backgroundColor: primaryColor } : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-border space-y-1">
            <Link
              href="/dashboard/notifications"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {t("nav.notifications")}
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950/40"
              >
                <Shield className="w-5 h-5" />
                {t("nav.admin")}
              </Link>
            )}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-4 space-y-3 shrink-0">
          <OrgSwitcher />
          <div className="flex items-center gap-2">
            <span className="lg:hidden"><LanguageToggle /></span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.signOut")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
