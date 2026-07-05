"use client";

import { useState, useCallback } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { IndustryBanner } from "@/components/IndustryBanner";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleClose = useCallback(() => setSidebarOpen(false), []);
  const handleOpen = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar open={sidebarOpen} onClose={handleClose} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={handleOpen} />
        <IndustryBanner />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
