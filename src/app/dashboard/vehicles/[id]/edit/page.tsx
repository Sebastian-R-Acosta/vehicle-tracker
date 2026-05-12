"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Car, Truck, Bike, Zap, Drill, Tractor, Hammer, Building2 } from "lucide-react";
import Link from "next/link";

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  year: z.number().min(1886).max(new Date().getFullYear() + 1),
  vin: z.string().length(17).optional().or(z.literal("")),
  nickname: z.string().max(100).optional(),
  vehicleType: z.enum(["car", "truck", "motorcycle", "excavator", "bulldozer", "dump_truck", "crane", "loader", "grader", "other"]).default("car"),
  status: z.enum(["active", "maintenance", "inactive", "sold"]).default("active"),
  currentMileage: z.number().min(0),
  hoursMeter: z.number().min(0).optional(),
  serialNumber: z.string().max(100).optional(),
  weightCapacity: z.number().min(0).optional(),
  constructionSiteId: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

const vehicleTypes = [
  { value: "car", label: "Car", icon: Car },
  { value: "truck", label: "Truck", icon: Truck },
  { value: "motorcycle", label: "Motorcycle", icon: Bike },
  { value: "excavator", label: "Excavator", icon: Drill },
  { value: "bulldozer", label: "Bulldozer", icon: Tractor },
  { value: "dump_truck", label: "Dump Truck", icon: Truck },
  { value: "crane", label: "Crane", icon: Building2 },
  { value: "loader", label: "Loader", icon: Hammer },
  { value: "grader", label: "Grader", icon: Tractor },
  { value: "other", label: "Other", icon: Zap },
];

const statuses = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "In Maintenance" },
  { value: "inactive", label: "Inactive" },
  { value: "sold", label: "Sold" },
];

const constructionTypes = new Set(["excavator", "bulldozer", "dump_truck", "crane", "loader", "grader"]);

export default function EditVehiclePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [constructionSites, setConstructionSites] = useState<{ id: string; name: string }[]>([]);

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
          nickname: data.nickname || "",
          currentMileage: data.currentMileage,
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
      const payload: any = { ...data };
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
        throw new Error("Failed to update vehicle");
      }

      router.push(`/dashboard/vehicles/${params.id}`);
    } catch (err) {
      setError("Something went wrong");
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
                Back
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
            <h1 className="text-xl font-semibold text-foreground">Edit Vehicle</h1>
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
                  Make <span className="text-destructive">*</span>
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
                  Model <span className="text-destructive">*</span>
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
                Vehicle Type <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-5 gap-3">
                {vehicleTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.value;
                  return (
                    <label
                      key={type.value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={type.value}
                        {...register("vehicleType")}
                        className="sr-only"
                      />
                      <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {type.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Year <span className="text-destructive">*</span>
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
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nickname (optional)
                </label>
                <input
                  {...register("nickname")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>

              {isConstruction ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Hours Meter
                  </label>
                  <input
                    type="number"
                    {...register("hoursMeter", { valueAsNumber: true })}
                    className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Current Mileage
                  </label>
                  <input
                    type="number"
                    {...register("currentMileage", { valueAsNumber: true })}
                    className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>
              )}
            </div>

            {isConstruction && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Serial Number
                    </label>
                    <input
                      {...register("serialNumber")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Weight Capacity (tons)
                    </label>
                    <input
                      type="number"
                      {...register("weightCapacity", { valueAsNumber: true })}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </div>
                {constructionSites.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Construction Site
                    </label>
                    <select
                      {...register("constructionSiteId")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    >
                      <option value="">No site assignment</option>
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
                  VIN (optional)
                </label>
                <input
                  {...register("vin")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-mono"
                  maxLength={17}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
