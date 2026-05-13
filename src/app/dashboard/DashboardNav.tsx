"use client";

import { Car, Bell, Building2, Package, Wrench, Users, Scan } from "lucide-react";
import Link from "next/link";
import OrgSwitcher from "@/components/OrgSwitcher";

export function DashboardNav() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Vehicle Tracker</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <OrgSwitcher />
              <Link
                href="/dashboard/construction-sites"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                title="Construction Sites"
              >
                <Building2 className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/parts"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                title="Parts Inventory"
              >
                <Package className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/service-providers"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                title="Service Providers"
              >
                <Wrench className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/drivers"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                title="Drivers"
              >
                <Users className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/scan"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                title="Scan VIN"
              >
                <Scan className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/reminders"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <div className="sm:hidden">
              <OrgSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
