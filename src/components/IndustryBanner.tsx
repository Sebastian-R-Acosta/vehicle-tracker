"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Building2 } from "lucide-react";
import Link from "next/link";

export function IndustryBanner() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem("industry-banner-dismissed") === "true");
    }
  }, []);

  const industryType = session?.user?.industryType;
  if (industryType !== "construction" || dismissed) return null;

  return (
    <div className="bg-primary/5 border-b border-primary/20 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <span>
            Your organization is set to <strong>Construction</strong>.{" "}
            <Link href="/dashboard/settings" className="text-primary hover:underline font-medium">
              Change industry
            </Link>{" "}
            to customize labels and navigation.
          </span>
        </div>
        <button
          onClick={() => {
            localStorage.setItem("industry-banner-dismissed", "true");
            setDismissed(true);
          }}
          className="shrink-0 p-1 text-muted-foreground hover:text-foreground rounded"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
