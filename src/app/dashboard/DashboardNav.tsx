"use client";

import { Car, Bell, Building2, Package, Wrench, Users, Scan, LogOut, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import OrgSwitcher from "@/components/OrgSwitcher";
import { LanguageToggle } from "@/components/LanguageToggle";

export function DashboardNav() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="p-2 bg-primary rounded-lg">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">Vehicle Tracker</span>
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <OrgSwitcher />
              <Link
                href="/dashboard/construction-sites"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
                title="Construction Sites"
              >
                <Building2 className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/parts"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
                title="Parts Inventory"
              >
                <Package className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/service-providers"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
                title="Service Providers"
              >
                <Wrench className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/drivers"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
                title="Drivers"
              >
                <Users className="w-5 h-5" />
              </Link>
            <Link
              href="/dashboard/scan"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
              title="Scan VIN"
            >
              <Scan className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard/profile"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg shrink-0"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/notifications"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <LanguageToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
