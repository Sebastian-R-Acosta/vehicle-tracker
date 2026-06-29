"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Bell } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const constructionTypes = new Set(["excavator", "bulldozer", "dump_truck", "crane", "loader", "grader"]);

export default function NewReminderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const reminderSchema = z.object({
    vehicleId: z.string().min(1, t("dashboard.remindersNew.vehicleRequired")),
    title: z.string().min(1, t("dashboard.remindersNew.titleRequired")),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    dueMileage: z.number().optional(),
    dueHours: z.number().optional(),
  });

  type ReminderFormData = z.infer<typeof reminderSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
  });

  const watchVehicleId = watch("vehicleId");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get("vehicleId");
    if (vehicleId) {
      setValue("vehicleId", vehicleId);
    }
  }, [setValue]);

  useEffect(() => {
    if (watchVehicleId) {
      const v = vehicles.find((v) => v.id === watchVehicleId);
      setSelectedVehicle(v);
    } else {
      setSelectedVehicle(null);
    }
  }, [watchVehicleId, vehicles]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchVehicles();
    }
  }, [session]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const isConstruction = selectedVehicle && constructionTypes.has(selectedVehicle.vehicleType);

  const onSubmit = async (data: ReminderFormData) => {
    if (!data.dueDate && !data.dueMileage && !data.dueHours) {
      setError(t("dashboard.remindersNew.mustHaveTrigger"));
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to create reminder");
      }

      router.push("/dashboard/reminders");
    } catch (err) {
      setError(t("dashboard.remindersNew.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/reminders"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("dashboard.remindersNew.back")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary rounded-lg">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">{t("dashboard.remindersNew.heading")}</h1>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          {vehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {t("dashboard.remindersNew.noVehicleDesc")}
              </p>
              <Link
                href="/dashboard/vehicles/new"
                className="text-primary hover:underline"
              >
                {t("dashboard.remindersNew.addVehicle")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.remindersNew.vehicle")} <span className="text-destructive">*</span>
                </label>
                <select
                  {...register("vehicleId")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  <option value="">{t("dashboard.remindersNew.selectVehicle")}</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model}
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.vehicleId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.remindersNew.title")} <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("title")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder={t("dashboard.remindersNew.titlePlaceholder")}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.remindersNew.description")}
                </label>
                <textarea
                  {...register("description")}
                  rows={2}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder={t("dashboard.remindersNew.descriptionPlaceholder")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t("dashboard.remindersNew.dueDate")}
                  </label>
                  <input
                    type="date"
                    {...register("dueDate")}
                    className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>

                {isConstruction ? (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.remindersNew.dueHours")}
                    </label>
                    <input
                      type="number"
                      {...register("dueHours", { valueAsNumber: true })}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                      placeholder={t("dashboard.remindersNew.dueHoursPlaceholder")}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.remindersNew.dueMileage")}
                    </label>
                    <input
                      type="number"
                      {...register("dueMileage", { valueAsNumber: true })}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                      placeholder={t("dashboard.remindersNew.dueMileagePlaceholder")}
                    />
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {isConstruction ? t("dashboard.remindersNew.triggerHintHours") : t("dashboard.remindersNew.triggerHintMileage")}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("dashboard.remindersNew.createReminder")}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
