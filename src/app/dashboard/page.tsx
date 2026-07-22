"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Car, Plus, Settings, Loader2, Truck, Bike, Zap, Drill, Tractor, Hammer, Building2, Bell as BellIcon, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import { useFetch } from "@/lib/queries";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getIndustryPageLabels, IndustryType } from "@/lib/industry-labels";
import { SectionLoader, SectionError, SectionEmpty } from "@/components/ui/SectionStates";

type VehicleType = "car" | "truck" | "motorcycle" | "excavator" | "bulldozer" | "dump_truck" | "crane" | "loader" | "grader" | "other";
type VehicleStatus = "active" | "maintenance" | "sold" | "inactive";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vin: string | null;
  licensePlate: string | null;
  vehicleType: VehicleType;
  status: VehicleStatus;
  currentMileage: number;
  maintenanceRecords: { id: string }[];
  reminders: { id: string }[];
}

const vehicleTypeIcons: Record<string, React.ElementType> = {
  car: Car, truck: Truck, motorcycle: Bike, excavator: Drill,
  bulldozer: Tractor, dump_truck: Truck, crane: Building2, loader: Hammer, grader: Tractor, other: Zap,
};

const statusColors: Record<VehicleStatus, { bg: string; text: string }> = {
  active: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  maintenance: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  sold: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" },
  inactive: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400" },
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const vehicleLabels = getIndustryPageLabels((session?.user?.industryType as IndustryType) ?? "default", "vehicles");

  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader vehicleLabels={vehicleLabels} />

        <PlanBanner />

        <VehicleSection vehicleLabels={vehicleLabels} />

        <BottomLinks />
      </main>
    </div>
  );
}

function DashboardHeader({ vehicleLabels }: { vehicleLabels: any }) {
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dashboard.home.title")}</h1>
        <p className="text-muted-foreground">
          {t("dashboard.home.welcomeBack")} {session?.user?.name || "User"}
        </p>
      </div>
      <Link
        href="/dashboard/vehicles/new"
        className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        {t(vehicleLabels.action)}
      </Link>
    </div>
  );
}

function PlanBanner() {
  const { t } = useLanguage();
  const { data: plan } = useFetch<{ tier: string; maxVehicles: number; name?: string; status?: string; paymentProcessor?: string }>(
    ["plan"],
    "/api/user/plan",
    { enabled: true }
  );

  const handleManageSubscription = async () => {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    if (res.ok) {
      const { url, message } = await res.json();
      if (message) toast.success(message);
      window.location.href = url;
    } else {
      toast.error(t("dashboard.home.noSubscription"));
    }
  };

  if (!plan) return null;

  if (plan.tier !== "free" && plan.paymentProcessor !== "free") {
    return (
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{plan.name} {t("dashboard.home.plan")}</p>
            <p className="text-xs text-muted-foreground">{plan.maxVehicles === 99999 ? t("dashboard.home.unlimitedVehicles") : `${plan.maxVehicles}`} vehicles &middot; {plan.status}</p>
          </div>
        </div>
        <button onClick={handleManageSubscription} className="text-sm text-primary hover:underline font-medium">
          {t("dashboard.home.manage")}
        </button>
      </div>
    );
  }

  return null;
}

function VehicleSection({ vehicleLabels }: { vehicleLabels: any }) {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<VehicleType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { data: vehicles = [], isLoading, error, refetch } = useFetch<Vehicle[]>(
    ["vehicles"],
    "/api/vehicles",
    { enabled: true }
  );

  const { data: plan } = useFetch<{ tier: string; maxVehicles: number }>(
    ["plan"],
    "/api/user/plan",
    { enabled: true }
  );

  const filteredVehicles = vehicles.filter((vehicle) => {
    const typeMatch = filterType === "all" || vehicle.vehicleType === filterType;
    const statusMatch = filterStatus === "all" || vehicle.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllFilteredSelected =
    filteredVehicles.length > 0 &&
    filteredVehicles.every((v) => selectedIds.includes(v.id));

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredVehicles.find((v) => v.id === id))
      );
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...filteredVehicles
          .filter((v) => !prev.includes(v.id))
          .map((v) => v.id),
      ]);
    }
  };

  const handleExportCsv = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(`/api/vehicles/export/csv?ids=${selectedIds.join(",")}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vehicles-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportOpen(false);
      toast.success(t("dashboard.home.csvExported"));
    } catch {
      toast.error(t("dashboard.home.failedExport"));
    }
  };

  const handleExportPdf = () => {
    if (selectedIds.length === 0) return;
    const selected = vehicles.filter((v) => selectedIds.includes(v.id));
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(t("dashboard.home.vehicleExportReport"), 14, 20);
    doc.setFontSize(10);
    doc.text(`${t("dashboard.home.generated")} ${new Date().toLocaleDateString()}`, 14, 28);
    doc.setFontSize(12);
    doc.text(`${t("dashboard.home.totalVehiclesLabel")} ${selected.length}`, 14, 36);

    const headers = t("dashboard.home.pdfHeaders") as string[];
    const statusT = t("dashboard.home.statusLabels") as Record<string, string>;
    const rows = selected.map((v) => [
      String(v.year), v.make, v.model,
      (v.vin || "-"), v.currentMileage.toLocaleString(),
      statusT[v.status] || v.status,
    ]);

    const colWidths = [20, 35, 35, 50, 25, 25];
    const startY = 44;
    const rowH = 7;

    headers.forEach((h, i) => {
      const x = 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(h, x + 1, startY + 5);
    });

    doc.setDrawColor(200);
    doc.line(14, startY + rowH, 14 + colWidths.reduce((a, b) => a + b, 0), startY + rowH);

    rows.forEach((row, ri) => {
      const y = startY + rowH + 4 + ri * rowH;
      if (ri % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(14, y - 4, colWidths.reduce((a, b) => a + b, 0), rowH, "F");
      }
      row.forEach((cell, ci) => {
        const x = 14 + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(cell, x + 1, y + 1);
      });
    });

    doc.save("vehicles-export.pdf");
    setExportOpen(false);
  };

  const totalMiles = vehicles.reduce((sum, v) => sum + v.currentMileage, 0);
  const activeVehicles = vehicles.filter((v) => v.status === "active").length;

  if (isLoading) {
    return (
      <>
        <FreePlanBanner vehicleCount={0} plan={plan} />
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-card rounded-lg border border-border animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
        <SectionLoader message={t("dashboard.home.loadingVehicles")} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <FreePlanBanner vehicleCount={0} plan={plan} />
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">--</p>
              <p className="text-3xl font-bold text-foreground">--</p>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-lg border border-border">
          <SectionError
            title={t("errors.generic")}
            message={error.message}
            onRetry={() => refetch()}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <FreePlanBanner vehicleCount={vehicles.length} plan={plan} />

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t("dashboard.home.totalVehicles")}</p>
          <p className="text-3xl font-bold text-foreground">{vehicles.length}</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t("dashboard.home.totalMiles")}</p>
          <p className="text-3xl font-bold text-foreground">{totalMiles.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t("dashboard.home.activeVehicles")}</p>
          <p className="text-3xl font-bold text-foreground">{activeVehicles}</p>
        </div>
      </div>

      {vehicles.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as VehicleType | "all")}
            className="px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t("dashboard.home.allTypes")}</option>
            {Object.entries(t("dashboard.home.vehicleTypes") as Record<string, string>).map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as VehicleStatus | "all")}
            className="px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t("dashboard.home.allStatus")}</option>
            {Object.entries(t("dashboard.home.statusLabels") as Record<string, string>).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
          </select>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isAllFilteredSelected}
              onChange={toggleSelectAll}
              className="rounded border-border"
            />
            <span className="text-foreground">{selectedIds.length} {t("dashboard.home.selected")}</span>
          </label>
          <div className="ml-auto relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm"
            >
              <Download className="w-4 h-4" />
              {t("dashboard.home.exportSelected").replace("{n}", String(selectedIds.length))}
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                <button onClick={handleExportPdf} className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent rounded-t-lg">{t("dashboard.home.pdfReport")}</button>
                <button onClick={handleExportCsv} className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent rounded-b-lg">{t("dashboard.home.csv")}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {vehicles.length === 0 ? (
        <SectionEmpty
          icon={Car}
          message={t("dashboard.home.noVehicles")}
          action={
            <Link href="/dashboard/vehicles/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 mt-2">
              <Plus className="w-4 h-4" />{t(vehicleLabels.action)}
            </Link>
          }
        />
      ) : filteredVehicles.length === 0 ? (
        <SectionEmpty
          icon={Car}
          message={t("dashboard.home.noMatch")}
          action={
            <button onClick={() => { setFilterType("all"); setFilterStatus("all"); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 mt-2">
              {t("dashboard.home.clearFilters")}
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => {
            const Icon = vehicleTypeIcons[vehicle.vehicleType] || Car;
            const statusStyle = statusColors[vehicle.status as VehicleStatus] || statusColors.active;
            const typeLabels = t("dashboard.home.vehicleTypes") as Record<string, string>;
            const statusLbls = t("dashboard.home.statusLabels") as Record<string, string>;
            return (
              <div key={vehicle.id} className="relative">
                <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.includes(vehicle.id)} onChange={() => toggleSelect(vehicle.id)} className="w-4 h-4 rounded border-border cursor-pointer" />
                </div>
                <Link href={`/dashboard/vehicles/${vehicle.id}`} className="block p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors"><Icon className="w-6 h-6 text-primary" /></div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{statusLbls[vehicle.status] || vehicle.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{vehicle.year}</span>
                    <span className="text-xs text-muted-foreground">&bull;</span>
                    <span className="text-xs text-muted-foreground">{typeLabels[vehicle.vehicleType] || vehicle.vehicleType}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-foreground">{vehicle.make} {vehicle.model}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {vehicle.nickname && <p className="text-sm text-muted-foreground">{vehicle.nickname}</p>}
                    {vehicle.licensePlate && <span className="text-xs text-muted-foreground">· {vehicle.licensePlate}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("vehicle.mileage")}</p>
                      <p className="font-semibold text-foreground">{vehicle.currentMileage.toLocaleString()} mi</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t("vehicle.reminders")}</p>
                      <p className="font-semibold text-foreground">{vehicle.reminders.length}</p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function FreePlanBanner({ vehicleCount, plan }: { vehicleCount: number; plan?: { tier: string; maxVehicles: number } }) {
  const { t } = useLanguage();

  if (!plan || plan.tier !== "free" || vehicleCount === 0) return null;

  return (
    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <div>
          <p className="text-sm font-medium text-foreground">{t("dashboard.home.freePlan")}</p>
          <p className="text-xs text-muted-foreground">{vehicleCount} of {plan.maxVehicles} {t("dashboard.home.used")}</p>
        </div>
      </div>
      <Link href="/pricing" className="text-sm font-medium text-blue-600 hover:text-blue-500">
        {t("dashboard.home.upgradePro")}
      </Link>
    </div>
  );
}

function BottomLinks() {
  const { t } = useLanguage();
  const { data: vehicles = [] } = useFetch<Vehicle[]>(
    ["vehicles"],
    "/api/vehicles",
    { enabled: true }
  );

  const upcomingReminders = vehicles.reduce((sum, v) => sum + v.reminders.length, 0);

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      <Link href="/dashboard/reminders" className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors">
        <BellIcon className="w-8 h-8 text-primary mb-3" />
        <h3 className="font-semibold mb-1 text-foreground">{t("reminders.title")}</h3>
        <p className="text-sm text-muted-foreground">{upcomingReminders > 0 ? `${upcomingReminders} ${t("dashboard.home.activeReminders")}` : t("dashboard.home.noUpcoming")}</p>
      </Link>
      <Link href="/dashboard/transfer" className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors">
        <Settings className="w-8 h-8 text-primary mb-3" />
        <h3 className="font-semibold mb-1 text-foreground">{t("dashboard.home.transferTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("dashboard.home.transferDesc")}</p>
      </Link>
    </div>
  );
}
