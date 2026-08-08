"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BellRing, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { serviceTypeKey } from "@/lib/service-types";

interface Record {
  id: string;
  serviceType: string;
  date: string;
  mileage: number;
  cost: number | null;
  status: string;
  acknowledgedAt: string | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string | null;
    user: { id: string; name: string | null; email: string; phone: string | null };
  };
}

const FILTERS = ["all", "in_progress", "ready", "completed"] as const;

export default function WorkshopHistoryPage() {
  const { t } = useLanguage();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = filter === "all" ? "/api/workshop/services" : `/api/workshop/services?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) {
        setError(res.status === 403 ? t("workshop.notWorkshop") : t("workshop.genericError"));
        setRecords([]);
        return;
      }
      setRecords(await res.json());
    } catch {
      setError(t("workshop.genericError"));
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const setStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/workshop/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await fetchRecords();
      else setError(t("workshop.genericError"));
    } catch {
      setError(t("workshop.genericError"));
    } finally {
      setUpdating(null);
    }
  };

  const statusLabel = (s: string) =>
    s === "ready" ? t("workshop.statusReady") : s === "completed" ? t("workshop.statusCompleted") : t("workshop.statusInProgress");

  const statusClass = (s: string) =>
    s === "ready"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : s === "completed"
        ? "bg-green-500/10 text-green-700 dark:text-green-400"
        : "bg-blue-500/10 text-blue-700 dark:text-blue-400";

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <Link href="/dashboard/workshop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground py-3">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        {t("workshop.title")}
      </Link>

      <h1 className="text-2xl font-bold text-foreground mt-2">{t("workshop.historyTitle")}</h1>
      <p className="text-muted-foreground text-sm mt-1 mb-6">{t("workshop.historySubtitle")}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "primary" : "outline"} onClick={() => setFilter(f)}>
            {f === "all" ? t("workshop.filterAll") : statusLabel(f)}
          </Button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        </div>
      ) : records.length === 0 ? (
        <p className="text-muted-foreground py-8">{t("workshop.historyEmpty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="text-left">
                <th className="p-3 font-semibold text-foreground">{t("workshop.columnCustomer")}</th>
                <th className="p-3 font-semibold text-foreground">{t("workshop.columnVehicle")}</th>
                <th className="p-3 font-semibold text-foreground">{t("workshop.columnService")}</th>
                <th className="p-3 font-semibold text-foreground">{t("workshop.columnDate")}</th>
                <th className="p-3 font-semibold text-foreground">{t("workshop.columnStatus")}</th>
                <th className="p-3 font-semibold text-foreground">{t("workshop.columnConfirmed")}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="text-foreground">{r.vehicle.user.name || r.vehicle.user.email}</div>
                    <div className="text-xs text-muted-foreground">{r.vehicle.user.phone || r.vehicle.user.email}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
                    {r.vehicle.licensePlate ? ` · ${r.vehicle.licensePlate}` : ""}
                  </td>
                  <td className="p-3 text-muted-foreground">{t(serviceTypeKey(r.serviceType))}</td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClass(r.status)}`}>
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.acknowledgedAt ? (
                      <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 text-xs">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        {t("workshop.confirmedYes")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                        <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                        {t("workshop.confirmedNo")}
                      </span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {r.status === "in_progress" && (
                      <Button size="sm" variant="outline" loading={updating === r.id} onClick={() => setStatus(r.id, "ready")}>
                        {t("workshop.markReady")}
                      </Button>
                    )}
                    {r.status === "ready" && (
                      <Button size="sm" variant="outline" loading={updating === r.id} onClick={() => setStatus(r.id, "completed")}>
                        {t("workshop.markCompleted")}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
