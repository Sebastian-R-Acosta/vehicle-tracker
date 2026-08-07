"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Loader2, Plus, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getIndustryPageLabels, IndustryType } from "@/lib/industry-labels";
import { Button } from "@/components/ui/Button";

interface VehicleRow {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  licensePlate: string | null;
  currentMileage: number;
  status: string;
  organizationId: string | null;
  user: { id: string; name: string | null; email: string } | null;
  maintenanceRecords: { id: string; date: string; serviceType: string }[];
}

export default function VehiclesPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  const industry = (session?.user?.industryType as IndustryType) ?? "default";
  const labels = getIndustryPageLabels(industry, "vehicles");

  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // include=serviced also brings in customer-owned vehicles this workshop is
      // authorized to service.
      const res = await fetch("/api/vehicles?include=serviced");
      if (!res.ok) {
        setError(t("errors.generic"));
        return;
      }
      setVehicles(await res.json());
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    fetchVehicles();
  }, [status, router, fetchVehicles]);

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? vehicles.filter((v) =>
        [v.make, v.model, v.nickname, v.licensePlate, v.user?.name, v.user?.email]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle))
      )
    : vehicles;

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" aria-hidden="true" />
            {labels ? t(labels.heading) : t("nav.vehicles")}
          </h1>
          {labels && <p className="text-muted-foreground text-sm mt-1">{t(labels.subtitle)}</p>}
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button>
            <Plus className="w-4 h-4" aria-hidden="true" />
            {labels ? t(labels.action) : t("vehicle.add")}
          </Button>
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="vehicle-search" className="sr-only">
          {t("common.search")}
        </label>
        <input
          id="vehicle-search"
          className="w-full pl-9 pr-3 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("vehicle.licensePlate")}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">{t("dashboard.home.noVehicles")}</p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtered.map((v) => {
            const last = v.maintenanceRecords?.[0];
            return (
              <li key={v.id}>
                <Link
                  href={`/dashboard/vehicles/${v.id}`}
                  className="block p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-foreground">
                      {v.nickname || `${v.year} ${v.make} ${v.model}`}
                    </span>
                    {v.licensePlate && (
                      <span className="text-xs text-muted-foreground shrink-0">{v.licensePlate}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {v.year} {v.make} {v.model} · {v.currentMileage.toLocaleString()}
                  </p>
                  {v.user && (
                    <p className="text-xs text-muted-foreground mt-2">{v.user.name || v.user.email}</p>
                  )}
                  {last && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {last.serviceType} · {new Date(last.date).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
