"use client";

import { useState, useCallback, useEffect } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SectionLoader, SectionError, SectionEmpty } from "@/components/ui/SectionStates";

interface Recall {
  nhtsaCampaignNumber: string;
  component: string;
  summary: string;
  reportReceivedDate: string;
  manufacturer: string;
  safetyRisk: string | null;
  remedy: string | null;
}

interface Props {
  vehicleId: string;
  vin: string | null;
}

export function VehicleRecallsSection({ vehicleId, vin }: Props) {
  const { t } = useLanguage();
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecalls = useCallback(async () => {
    if (!vin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/recalls`);
      if (res.ok) {
        const data = await res.json();
        setRecalls(data.recalls || []);
        if (data.error) setError(data.error);
      } else {
        setError(t("errors.generic"));
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }, [vehicleId, vin, t]);

  useEffect(() => {
    fetchRecalls();
  }, [fetchRecalls]);

  if (!vin) return null;

  if (error && !loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <SectionError
          title={t("dashboard.vehicleDetail.recallAlerts")}
          message={error}
          onRetry={fetchRecalls}
        />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          {t("dashboard.vehicleDetail.recallAlerts")}
        </h2>
        {loading && <span className="text-xs text-muted-foreground">{t("common.loading")}</span>}
      </div>

      {loading ? (
        <SectionLoader message={t("dashboard.vehicleDetail.checkingRecalls")} />
      ) : recalls.length === 0 ? (
        <SectionEmpty
          icon={CheckCircle}
          message={t("dashboard.vehicleDetail.noOpenRecalls")}
        />
      ) : (
        <div className="space-y-3">
          {recalls.map((recall) => (
            <div key={recall.nhtsaCampaignNumber} className="p-4 bg-red-500/5 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{recall.component}</p>
                  <p className="text-sm text-muted-foreground mt-1">{recall.summary}</p>
                  {recall.remedy && (
                    <p className="text-sm text-green-600 mt-2">{recall.remedy}</p>
                  )}
                  {recall.safetyRisk && (
                    <p className="text-sm text-red-600 mt-1">{recall.safetyRisk}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("dashboard.vehicleDetail.reported")} {new Date(recall.reportReceivedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
