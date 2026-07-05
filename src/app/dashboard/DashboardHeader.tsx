"use client";

import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="bg-card border-b border-border h-16 flex items-center px-4 lg:px-6 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <Link href="/dashboard" className="lg:hidden flex items-center gap-2 ml-2">
        <img src="/logo-icon.png" alt="Bitácora" className="h-8 w-auto" />
        <span className="text-xl font-bold text-foreground">Bitácora</span>
      </Link>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
          title={t("nav.logout")}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
