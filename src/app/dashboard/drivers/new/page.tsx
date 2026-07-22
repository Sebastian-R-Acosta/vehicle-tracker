"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getIndustryPageLabels, IndustryType } from "@/lib/industry-labels";

const driverSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  licenseNumber: z.string().max(50).optional().or(z.literal("")),
  licenseExpiry: z.string().optional().or(z.literal("")),
  licenseState: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type DriverFormData = z.infer<typeof driverSchema>;

export default function NewDriverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const labels = getIndustryPageLabels((session?.user?.industryType as IndustryType) ?? "default", "drivers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const onSubmit = async (data: DriverFormData) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          organizationId: session?.user?.currentOrganizationId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || t("dashboard.driversNew.failedCreate"));
      }

      router.push("/dashboard/drivers");
    } catch (err: any) {
      setError(err.message || t("dashboard.driversNew.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary rounded-lg">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{t(labels.newHeading)}</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("driver.name")} <span className="text-destructive">*</span>
            </label>
            <input
              {...register("name")}
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              placeholder={t("dashboard.driversNew.namePlaceholder")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("driver.email")}</label>
              <input
                type="email"
                {...register("email")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder={t("dashboard.driversNew.emailPlaceholder")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("driver.phone")}</label>
              <input
                {...register("phone")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder={t("dashboard.driversNew.phonePlaceholder")}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.driversNew.licenseNumber")}</label>
              <input
                {...register("licenseNumber")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder={t("dashboard.driversNew.licensePlaceholder")}
              />
              {errors.licenseNumber && (
                <p className="mt-1 text-sm text-destructive">{errors.licenseNumber.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.driversNew.licenseExpiry")}</label>
              <input
                type="date"
                {...register("licenseExpiry")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
              {errors.licenseExpiry && (
                <p className="mt-1 text-sm text-destructive">{errors.licenseExpiry.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.driversNew.licenseState")}</label>
            <input
              {...register("licenseState")}
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              placeholder={t("dashboard.driversNew.statePlaceholder")}
            />
            {errors.licenseState && (
              <p className="mt-1 text-sm text-destructive">{errors.licenseState.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.driversNew.notes")}</label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              placeholder={t("dashboard.driversNew.notesPlaceholder")}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t(labels.saveAction)}
          </button>
        </form>
      </div>
    </main>
  );
}
