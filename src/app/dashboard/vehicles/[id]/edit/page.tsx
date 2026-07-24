"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Car, Truck, Bike, Zap, Drill, Tractor, Hammer, Building2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";

function createVehicleSchema(t: (key: string) => string) {
  return z.object({
    make: z.string().min(1, t("validation.makeRequired")).max(100),
    model: z.string().min(1, t("validation.modelRequired")).max(100),
    year: z.number().min(1886).max(new Date().getFullYear() + 1),
    vin: z.string().length(17).optional().or(z.literal("")),
    licensePlate: z.string().max(20).optional().or(z.literal("")),
    nickname: z.string().max(100).optional(),
    vehicleType: z.enum(["car", "truck", "motorcycle", "excavator", "bulldozer", "dump_truck", "crane", "loader", "grader", "other"]).default("car"),
    status: z.enum(["active", "maintenance", "inactive", "sold"]).default("active"),
    currentMileage: z.number().min(0).default(0),
    hoursMeter: z.number().min(0).optional(),
    serialNumber: z.string().max(100).optional(),
    weightCapacity: z.number().min(0).optional(),
    constructionSiteId: z.string().optional(),
  });
}

type VehicleFormData = z.infer<ReturnType<typeof createVehicleSchema>>;

const iconMap: Record<string, React.ElementType> = {
  car: Car, truck: Truck, motorcycle: Bike, excavator: Drill,
  bulldozer: Tractor, dump_truck: Truck, crane: Building2,
  loader: Hammer, grader: Tractor, other: Zap,
};

const constructionTypes = new Set(["excavator", "bulldozer", "dump_truck", "crane", "loader", "grader"]);

const vehicleTypeValues = ["car", "truck", "motorcycle", "excavator", "bulldozer", "dump_truck", "crane", "loader", "grader", "other"] as const;
const statusValues = ["active", "maintenance", "inactive", "sold"] as const;

export default function EditVehiclePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [constructionSites, setConstructionSites] = useState<{ id: string; name: string }[]>([]);

  const vehicleSchema = useMemo(() => createVehicleSchema(t), [t]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  const selectedType = watch("vehicleType");
  const isConstruction = constructionTypes.has(selectedType);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchVehicle();
    }
  }, [session, params.id]);

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

  const fetchVehicle = async () => {
    try {
      const res = await fetch(`/api/vehicles/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        reset({
          make: data.make,
          model: data.model,
          year: data.year,
          vin: data.vin || "",
          licensePlate: data.licensePlate || "",
          nickname: data.nickname || "",
          currentMileage: data.currentMileage ?? 0,
          vehicleType: data.vehicleType || "car",
          status: data.status || "active",
          hoursMeter: data.hoursMeter ?? undefined,
          serialNumber: data.serialNumber || "",
          weightCapacity: data.weightCapacity ?? undefined,
          constructionSiteId: data.constructionSiteId || "",
        });
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch vehicle:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        ...data,
        vin: data.vin || null,
        licensePlate: data.licensePlate || null,
        nickname: data.nickname || null,
      };
      if (!isConstruction) {
        delete payload.hoursMeter;
        delete payload.serialNumber;
        delete payload.weightCapacity;
        delete payload.constructionSiteId;
      }

      const res = await fetch(`/api/vehicles/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(result?.error || t("dashboard.vehicleEdit.somethingWentWrong"));
      }

      await queryClient.invalidateQueries({ queryKey: ["vehicle", String(params.id)] });
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      router.push(`/dashboard/vehicles/${params.id}`);
    } catch (err: any) {
      setError(err.message || t("dashboard.vehicleEdit.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === "loading" || initialLoading) {
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
                href={`/dashboard/vehicles/${params.id}`}
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
            <h1 className="text-xl font-semibold text-foreground">{t("dashboard.vehicleEdit.heading")}</h1>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
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
                  {t("dashboard.vehicleEdit.nicknameOptional")}
                </label>
                <input
                  {...register("nickname")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.vehicleEdit.currentMileage")}
                </label>
                <input
                  type="number"
                  {...register("currentMileage", { valueAsNumber: true })}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("vehicle.licensePlate")}
                </label>
                <input
                  {...register("licensePlate")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.vehicleEdit.vinOptional")}
                </label>
                <input
                  {...register("vin")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-mono"
                  maxLength={17}
                />
              </div>
            </div>

            {isConstruction && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.vehicleEdit.hoursMeter")}
                    </label>
                    <input
                      type="number"
                      {...register("hoursMeter", { valueAsNumber: true })}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.vehicleEdit.serialNumber")}
                    </label>
                    <input
                      {...register("serialNumber")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.vehicleEdit.weightCapacity")}
                    </label>
                    <input
                      type="number"
                      {...register("weightCapacity", { valueAsNumber: true })}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                  {constructionSites.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t("dashboard.vehicleEdit.constructionSite")}
                      </label>
                      <select
                        {...register("constructionSiteId")}
                        className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                      >
                        <option value="">{t("dashboard.vehicleEdit.noSiteAssignment")}</option>
                        {constructionSites.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("dashboard.vehicleEdit.saveChanges")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
