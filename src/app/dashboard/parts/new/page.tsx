"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Package, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";
import { getIndustryPageLabels, IndustryType } from "@/lib/industry-labels";

interface VehicleRef {
  id: string;
  make: string;
  model: string;
  nickname: string | null;
}

const partSchema = z.object({
  name: z.string().min(1).max(200),
  partNumber: z.string().max(100).optional(),
  category: z.string().min(1),
  quantity: z.coerce.number().int().min(0).default(0),
  minStock: z.coerce.number().int().min(0).default(0),
  unitCost: z.coerce.number().min(0).optional(),
  supplier: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

type PartFormData = z.infer<typeof partSchema>;

export default function NewPartPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const labels = getIndustryPageLabels((session?.user?.industryType as IndustryType) ?? "default", "parts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicles, setVehicles] = useState<VehicleRef[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showVehicleSearch, setShowVehicleSearch] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      quantity: 0,
      minStock: 0,
    },
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    fetchCategories();
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/parts/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const searchVehicles = async (query: string) => {
    setVehicleSearch(query);
    if (!query.trim()) {
      setVehicles([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/vehicles?search=${encodeURIComponent(query)}&organizationId=${session?.user?.currentOrganizationId}`
      );
      if (res.ok) {
        setVehicles(await res.json());
      }
    } catch (err) {
      console.error("Failed to search vehicles:", err);
    }
  };

  const onSubmit = async (data: PartFormData) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          organizationId: session?.user?.currentOrganizationId,
          vehicleId: selectedVehicleId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || t("dashboard.parts.new.failedCreate"));
      }

      router.push(`/dashboard/parts/${result.id}`);
    } catch (err: any) {
      setError(err.message || t("errors.generic"));
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/parts"
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
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">{labels.newHeading}</h1>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.parts.new.name")} <span className="text-destructive">*</span>
              </label>
              <input
                {...register("name")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder="Oil filter"
              />
                {errors.name && (
                <p className="mt-1 text-sm text-destructive">{t("dashboard.parts.new.nameRequired")}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.parts.new.partNumber")}
                </label>
                <input
                  {...register("partNumber")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder="OIL-123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.parts.new.category")} <span className="text-destructive">*</span>
                </label>
                <select
                  {...register("category")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  <option value="">{t("dashboard.parts.new.selectCategory")}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-destructive">{t("dashboard.parts.new.categoryRequired")}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.parts.new.quantity")}
                </label>
                <input
                  type="number"
                  {...register("quantity")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.parts.new.minStock")}
                </label>
                <input
                  type="number"
                  {...register("minStock")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.parts.new.unitCost")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("unitCost")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.parts.new.supplier")}
                </label>
              <input
                {...register("supplier")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder="AutoZone"
              />
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.parts.new.notes")}
                </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground resize-none"
                placeholder="Additional details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.parts.new.associatedVehicle")}
              </label>
              {selectedVehicleId ? (
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                  <span className="text-foreground">
                    {vehicles.find((v) => v.id === selectedVehicleId)?.nickname ||
                      vehicles.find((v) => v.id === selectedVehicleId)?.make + " " +
                      vehicles.find((v) => v.id === selectedVehicleId)?.model}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVehicleId(null);
                      setVehicleSearch("");
                      setVehicles([]);
                    }}
                    className="ml-auto text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("dashboard.parts.new.remove")}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t("dashboard.parts.new.searchVehicles")}
                      value={vehicleSearch}
                      onChange={(e) => searchVehicles(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  {vehicles.length > 0 && (
                    <div className="mt-2 border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
                      {vehicles.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVehicleId(v.id);
                            setVehicleSearch("");
                            setVehicles([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-accent text-foreground"
                        >
                          {v.nickname || `${v.make} ${v.model}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {labels.saveAction}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
