"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SectionLoader, SectionError } from "@/components/ui/SectionStates";

interface ValueReport {
  estimatedValue: number;
  estimatedValueUSD: number;
  valueRange: { low: number; high: number };
  marketRating: string;
  depreciation: { annualRate: number; age: number; kmDiscount: number };
  maintenance: { totalRecords: number; bonus: number };
  factors: { name: string; impact: string; detail: string }[];
}

interface Props {
  vehicleId: string;
}

const ImpactIcon = ({ impact }: { impact: string }) => {
  if (impact === "positive") return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (impact === "negative") return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-amber-500" />;
};

export function VehicleValueReportSection({ vehicleId }: Props) {
  const { t } = useLanguage();
  const [report, setReport] = useState<ValueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/value-report`);
      if (res.ok) {
        setReport(await res.json());
      } else {
        setError(t("dashboard.vehicleDetail.failedLoadValue"));
      }
    } catch {
      setError(t("dashboard.vehicleDetail.failedLoadValue"));
    } finally {
      setLoading(false);
    }
  };

  if (error && !loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <SectionError
          title={t("dashboard.vehicleDetail.vehicleValue")}
          message={error}
          onRetry={fetchReport}
        />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {t("dashboard.vehicleDetail.vehicleValue")}
        </h2>
        {!report && !loading && (
          <button
            onClick={fetchReport}
            className="text-sm text-primary hover:underline font-medium"
          >
            {t("dashboard.vehicleDetail.estimateValue")}
          </button>
        )}
      </div>

      {loading ? (
        <SectionLoader message={t("dashboard.vehicleDetail.estimatingValue")} />
      ) : report ? (
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-foreground">
              RD${report.estimatedValue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ~US${report.estimatedValueUSD.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{report.marketRating}</p>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.vehicleDetail.valueRange")} RD${report.valueRange.low.toLocaleString()} - RD${report.valueRange.high.toLocaleString()}
            </p>
          </div>
          <div className="grid gap-2">
            {report.factors.map((factor) => (
              <div key={factor.name} className="flex items-center justify-between py-2 px-3 bg-background rounded-lg">
                <div className="flex items-center gap-2">
                  <ImpactIcon impact={factor.impact} />
                  <span className="text-sm font-medium text-foreground">{factor.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{factor.detail}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
