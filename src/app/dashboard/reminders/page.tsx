"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  Bell,
  Check,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  dueMileage: number | null;
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
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchReminders();
    }
  }, [session]);

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}/toggle`, {
        method: "POST",
      });
      if (res.ok) {
        fetchReminders();
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
        fetchReminders();
      }
    } catch (err) {
      console.error("Failed to delete reminder:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const activeReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

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
                Back
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/reminders/new"
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                New Reminder
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8 text-foreground">Reminders</h1>

        {reminders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">No reminders yet</h2>
            <p className="text-muted-foreground mb-4">
              Set reminders for maintenance and services
            </p>
            <Link
              href="/dashboard/reminders/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              New Reminder
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {activeReminders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <Clock className="w-5 h-5" />
                  Active
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
                                  {reminder.dueMileage.toLocaleString()} miles
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
                  Completed
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