"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useFetch } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  dueMileage: number | null;
  dueHours: number | null;
  isCompleted: boolean;
  vehicle: {
    id: string;
    make: string;
    model: string;
  };
}

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: reminders = [], isLoading, error } = useFetch<Reminder[]>(
    ["reminders"],
    "/api/reminders",
    { enabled: status === "authenticated" }
  );

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" role="alert">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-7 h-7 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">{t("dashboard.reminders.failedToLoad")}</h1>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90">{t("dashboard.reminders.tryAgain")}</button>
        </div>
      </div>
    );
  }

  const filteredReminders = reminders.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const activeReminders = filteredReminders.filter((r) => !r.isCompleted);
  const completedReminders = filteredReminders.filter((r) => r.isCompleted);

  const toggleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}/toggle`, {
        method: "POST",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["reminders"] });
      }
    } catch (err) {
      console.error("Failed to toggle reminder:", err);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["reminders"] });
      }
    } catch (err) {
      console.error("Failed to delete reminder:", err);
    }
  };

  const isOverdue = (reminder: Reminder) => {
    if (reminder.dueDate && new Date(reminder.dueDate) < new Date()) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("dashboard.reminders.back")}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/reminders/new"
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                {t("dashboard.reminders.newReminder")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8 text-foreground">{t("dashboard.reminders.heading")}</h1>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={t("dashboard.reminders.searchPlaceholder")}
              aria-label={t("dashboard.reminders.searchLabel")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            />
        </div>

        {filteredReminders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">
              {search ? t("dashboard.reminders.noSearchResults") : t("dashboard.reminders.noReminders")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {search ? t("dashboard.reminders.tryDifferentTitle") : t("dashboard.reminders.setRemindersDesc")}
            </p>
            {!search && (
              <Link
                href="/dashboard/reminders/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                {t("dashboard.reminders.newReminder")}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {activeReminders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <Clock className="w-5 h-5" />
                  {t("dashboard.reminders.active")}
                </h2>
                <div className="space-y-3">
                  {activeReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 bg-card rounded-lg border ${
                        isOverdue(reminder)
                          ? "border-destructive"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleComplete(reminder.id)}
                            aria-label={reminder.isCompleted ? t("dashboard.reminders.markAsIncomplete") : t("dashboard.reminders.markAsComplete")}
                            className={`mt-1 p-1 rounded-full border-2 ${
                              isOverdue(reminder)
                                ? "border-destructive text-destructive"
                                : "border-input hover:border-green-500"
                            }`}
                          >
                            {isOverdue(reminder) && (
                              <Clock className="w-3 h-3" />
                            )}
                          </button>
                          <div>
                            <p className="font-medium text-foreground">{reminder.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {reminder.vehicle.make}{" "}
                              {reminder.vehicle.model}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              {reminder.dueDate && (
                                <span>
                                  {new Date(
                                    reminder.dueDate
                                  ).toLocaleDateString()}
                                </span>
                              )}
                              {reminder.dueMileage && (
                                <span>
                                  {reminder.dueMileage.toLocaleString()} {t("dashboard.reminders.miles")}
                                </span>
                              )}
                              {reminder.dueHours && (
                                <span>
                                  {reminder.dueHours.toLocaleString()} {t("dashboard.reminders.hrs")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedReminders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-5 h-5" />
                  {t("dashboard.reminders.completed")}
                </h2>
                <div className="space-y-3">
                  {completedReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-4 bg-card rounded-lg border border-border opacity-60"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleComplete(reminder.id)}
                            className="mt-1 p-1 rounded-full border-2 border-green-500 text-green-500"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <div>
                            <p className="font-medium line-through text-foreground">
                              {reminder.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {reminder.vehicle.make}{" "}
                              {reminder.vehicle.model}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          aria-label={t("dashboard.reminders.deleteReminder", { title: reminder.title })}
                          className="p-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
