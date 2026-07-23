"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, Loader2, User, Mail, Phone, BadgeCheck, Calendar, MapPin,
  Car, Truck, Pencil, Trash2, CheckCircle, XCircle,
  Drill, Building2, Tractor, Hammer,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vehicleType: string;
  licensePlate: string | null;
}

interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  licenseState: string | null;
  notes: string | null;
  isActive: boolean;
  vehicles: Vehicle[];
}

const driverSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  licenseNumber: z.string().max(50).optional().or(z.literal("")),
  licenseExpiry: z.string().optional().or(z.literal("")),
  licenseState: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type DriverFormData = z.infer<typeof driverSchema>;

const vehicleIcons: Record<string, React.ElementType> = {
  car: Car, truck: Truck, excavator: Drill, bulldozer: Tractor,
  crane: Building2, loader: Hammer, other: Car,
};

export default function DriverDetailPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchDriver();
    }
  }, [session, params.id]);

  const fetchDriver = async () => {
    try {
      const res = await fetch(`/api/drivers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setDriver(data);
        reset({
          name: data.name,
          email: data.email || "",
          phone: data.phone || "",
          licenseNumber: data.licenseNumber || "",
          licenseExpiry: data.licenseExpiry || "",
          licenseState: data.licenseState || "",
          notes: data.notes || "",
        });
      } else {
        router.push("/dashboard/drivers");
      }
    } catch (err) {
      console.error("Failed to fetch driver:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: DriverFormData) => {
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/drivers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || t("dashboard.drivers.detail.failedUpdate"));
      }

      setDriver(result);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || t("errors.generic"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("dashboard.drivers.detail.deleteConfirm"))) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/drivers/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/drivers");
      }
    } catch (err) {
      console.error("Failed to delete driver:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (driver) {
      reset({
        name: driver.name,
        email: driver.email || "",
        phone: driver.phone || "",
        licenseNumber: driver.licenseNumber || "",
        licenseExpiry: driver.licenseExpiry || "",
        licenseState: driver.licenseState || "",
        notes: driver.notes || "",
      });
    }
  };

  if (status === "loading" || loading || !driver) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{driver.name}</h1>
              {driver.email && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  {driver.email}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  {t("common.edit")}
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">{t("dashboard.drivers.detail.editDriver")}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.drivers.detail.name")} <span className="text-destructive">*</span>
              </label>
              <input
                {...register("name")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.drivers.detail.email")}</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.drivers.detail.phone")}</label>
                <input
                  {...register("phone")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.drivers.detail.licenseNumber")}</label>
                <input
                  {...register("licenseNumber")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-sm text-destructive">{errors.licenseNumber.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.drivers.detail.licenseExpiry")}</label>
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
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.drivers.detail.licenseState")}</label>
              <input
                {...register("licenseState")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
              {errors.licenseState && (
                <p className="mt-1 text-sm text-destructive">{errors.licenseState.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.drivers.detail.notes")}</label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("dashboard.drivers.detail.saveChanges")}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.drivers.detail.driverDetails")}</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">{t("dashboard.drivers.detail.email")}</p>
                  <p className="text-foreground">{driver.email || "\u2014"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">{t("dashboard.drivers.detail.phone")}</p>
                  <p className="text-foreground">{driver.phone || "\u2014"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BadgeCheck className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">{t("dashboard.drivers.detail.licenseNumber")}</p>
                  <p className="text-foreground">{driver.licenseNumber || "\u2014"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">{t("dashboard.drivers.detail.licenseExpiry")}</p>
                  <p className="text-foreground">{driver.licenseExpiry || "\u2014"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">{t("dashboard.drivers.detail.licenseState")}</p>
                  <p className="text-foreground">{driver.licenseState || "\u2014"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {driver.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <div>
                  <p className="text-muted-foreground text-xs">{t("dashboard.drivers.detail.status")}</p>
                  <p className={`font-medium ${driver.isActive ? "text-green-600" : "text-red-600"}`}>
                    {driver.isActive ? t("dashboard.drivers.detail.active") : t("dashboard.drivers.detail.inactive")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {driver.notes && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.drivers.detail.notes")}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{driver.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{t("dashboard.drivers.detail.assignedVehicles")}</h2>
        </div>

        {(driver.vehicles ?? []).length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("dashboard.drivers.detail.noVehiclesAssigned")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(driver.vehicles ?? []).map((vehicle) => {
              const Icon = vehicleIcons[vehicle.vehicleType] || Car;
              return (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/vehicles/${vehicle.id}`}
                  className="p-6 flex items-start justify-between hover:bg-accent"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Icon className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        {vehicle.nickname && ` (${vehicle.nickname})`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(`dashboard.home.vehicleTypes.${vehicle.vehicleType === "dump_truck" ? "dumpTruck" : vehicle.vehicleType}`) || vehicle.vehicleType}
                        {vehicle.licensePlate && ` \u2022 ${vehicle.licensePlate}`}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
