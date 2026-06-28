"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Bell, AlertTriangle, FileText, BadgeCheck, Loader2, ChevronRight, CheckCheck } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  dueDate: string | null;
  vehicleId: string | null;
  link: string;
  severity: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const iconMap: Record<string, typeof Bell> = {
    reminder_overdue: AlertTriangle,
    reminder_upcoming: Bell,
    doc_expired: FileText,
    doc_expiring: FileText,
    license_expired: BadgeCheck,
    license_expiring: BadgeCheck,
  };

  const overdue = notifications.filter((n) => n.severity === "error");
  const upcoming = notifications.filter((n) => n.severity === "warning");

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6" />
            {t("notifications.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {notifications.length > 0
              ? `${notifications.length} pending notification${notifications.length !== 1 ? "s" : ""}`
              : "All clear"}
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => setNotifications([])}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
          >
            <CheckCheck className="w-4 h-4" />
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {t("notifications.noNotifications")}
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything is up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-destructive mb-3 uppercase tracking-wider">
                Overdue ({overdue.length})
              </h2>
              <div className="space-y-2">
                {overdue.map((n) => {
                  const Icon = iconMap[n.type] || Bell;
                  return (
                    <Link
                      key={n.id}
                      href={n.link}
                      className="flex items-start gap-3 p-4 bg-card border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.description}</p>
                        {n.dueDate && (
                          <p className="text-xs text-red-500 mt-1">
                            Due: {new Date(n.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-amber-600 mb-3 uppercase tracking-wider">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-2">
                {upcoming.map((n) => {
                  const Icon = iconMap[n.type] || Bell;
                  return (
                    <Link
                      key={n.id}
                      href={n.link}
                      className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:bg-accent/50 transition-colors"
                    >
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.description}</p>
                        {n.dueDate && (
                          <p className="text-xs text-amber-600 mt-1">
                            Due: {new Date(n.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
