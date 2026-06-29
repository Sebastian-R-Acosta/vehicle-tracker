"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Car, Truck, Bike, Zap, Drill, Tractor, Hammer, Building2, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  year: z.number().min(1886).max(new Date().getFullYear() + 1),
  vin: z.string().length(17).optional().or(z.literal("")),
  nickname: z.string().max(100).optional(),
  vehicleType: z.enum(["car", "truck", "motorcycle", "excavator", "bulldozer", "dump_truck", "crane", "loader", "grader", "other"]).default("car"),
  status: z.enum(["active", "maintenance", "inactive", "sold"]).default("active"),
  currentMileage: z.number().min(0).default(0),
  hoursMeter: z.number().min(0).optional(),
  serialNumber: z.string().max(100).optional(),
  weightCapacity: z.number().min(0).optional(),
  constructionSiteId: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

const iconMap = {
  car: Car, truck: Truck, motorcycle: Bike, excavator: Drill,
  bulldozer: Tractor, dump_truck: Truck, crane: Building2,
  loader: Hammer, grader: Tractor, other: Zap,
};

const constructionTypes = new Set(["excavator", "bulldozer", "dump_truck", "crane", "loader", "grader"]);

const vehicleTypeValues = ["car", "truck", "motorcycle", "excavator", "bulldozer", "dump_truck", "crane", "loader", "grader", "other"] as const;
const statusValues = ["active", "maintenance", "inactive", "sold"] as const;

export default function NewVehiclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [constructionSites, setConstructionSites] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vin = params.get("vin");
    if (vin) {
      setValue("vin", vin);
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: "car",
      status: "active",
      currentMileage: 0,
    },
  });

  const selectedType = watch("vehicleType");
  const isConstruction = constructionTypes.has(selectedType);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const currentOrgId = session?.user?.currentOrganizationId;

  useEffect(() => {
    if (currentOrgId && isConstruction) {
      fetch(`/api/construction-sites?organizationId=${currentOrgId}`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setConstructionSites(data))
        .catch(() => {});
    } else {
      setConstructionSites([]);
    }
  }, [currentOrgId, isConstruction]);

  const onSubmit = async (data: VehicleFormData) => {
    setError("");
    setLoading(true);

    try {
      const payload: any = { ...data, organizationId: currentOrgId || undefined };
      if (!isConstruction) {
        delete payload.hoursMeter;
        delete payload.serialNumber;
        delete payload.weightCapacity;
        delete payload.constructionSiteId;
      }

      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || t("dashboard.vehicleNew.failedCreate"));
      }

      const vehicle = result;
      router.push(`/dashboard/vehicles/${vehicle.id}`);
    } catch (err: any) {
      const msg = err.message || t("dashboard.vehicleNew.somethingWentWrong");
      setError(msg);
      if (msg.toLowerCase().includes("free tier") || msg.toLowerCase().includes("upgrade")) {
        toast.error(
          <div className="flex items-center gap-2">
            <span>{msg}</span>
            <Link href="/pricing" className="font-semibold underline">{t("dashboard.vehicleNew.upgradeToPro")}</Link>
          </div>,
          { duration: 6000 }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    active: t("dashboard.home.statusLabels.active"),
    maintenance: t("dashboard.home.statusLabels.inMaintenance"),
    inactive: t("dashboard.home.statusLabels.inactive"),
    sold: t("dashboard.home.statusLabels.sold"),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary rounded-lg">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">{t("dashboard.vehicleNew.heading")}</h1>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error.toLowerCase().includes("free tier") || error.toLowerCase().includes("upgrade") ? (
                <span>{error} — <Link href="/pricing" className="font-semibold underline">{t("dashboard.vehicleNew.upgradeToPro")}</Link></span>
              ) : (
                error
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("vehicle.make")} <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("make")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder={t("dashboard.vehicleNew.placeholderMake")}
                />
                {errors.make && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.make.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("vehicle.model")} <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("model")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder={t("dashboard.vehicleNew.placeholderModel")}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.model.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("dashboard.vehicleNew.vehicleType")} <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-5 gap-3">
                {vehicleTypeValues.map((typeValue) => {
                  const Icon = iconMap[typeValue];
                  const isSelected = selectedType === typeValue;
                  return (
                    <label
                      key={typeValue}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={typeValue}
                        {...register("vehicleType")}
                        className="sr-only"
                      />
                      <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {t(`dashboard.home.vehicleTypes.${typeValue}`)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("vehicle.year")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  {...register("year", { valueAsNumber: true })}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder={t("dashboard.vehicleNew.placeholderYear")}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.year.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("vehicle.status")}
                </label>
                <select
                  {...register("status")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  {statusValues.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.vehicleNew.nicknameOptional")}
                </label>
                <input
                  {...register("nickname")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder={t("dashboard.vehicleNew.placeholderNickname")}
                />
              </div>

              {isConstruction ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t("dashboard.vehicleNew.hoursMeter")}
                  </label>
                  <input
                    type="number"
                    {...register("hoursMeter", { valueAsNumber: true })}
                    className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    placeholder={t("dashboard.vehicleNew.placeholderMileage")}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t("dashboard.vehicleNew.currentMileage")}
                  </label>
                  <input
                    type="number"
                    {...register("currentMileage", { valueAsNumber: true })}
                    className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    placeholder={t("dashboard.vehicleNew.placeholderMileage")}
                  />
                </div>
              )}
            </div>

            {isConstruction && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.vehicleNew.serialNumber")}
                    </label>
                    <input
                      {...register("serialNumber")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                      placeholder={t("dashboard.vehicleNew.placeholderSerial")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.vehicleNew.weightCapacity")}
                    </label>
                    <input
                      type="number"
                      {...register("weightCapacity", { valueAsNumber: true })}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                      placeholder={t("dashboard.vehicleNew.placeholderWeight")}
                    />
                  </div>
                </div>
                {constructionSites.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.vehicleNew.constructionSite")}
                    </label>
                    <select
                      {...register("constructionSiteId")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    >
                      <option value="">{t("dashboard.vehicleNew.noSiteAssignment")}</option>
                      {constructionSites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {!isConstruction && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.vehicleNew.vinOptional")}
                </label>
                <input
                  {...register("vin")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-mono"
                  placeholder={t("dashboard.vehicleNew.placeholderVin")}
                  maxLength={17}
                />
                {errors.vin && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.vin.message}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("dashboard.vehicleNew.addVehicle")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
