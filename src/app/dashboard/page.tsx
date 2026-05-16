"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Car, Plus, Settings, Loader2, Truck, Bike, Zap, Drill, Tractor, Hammer, Building2, Bell as BellIcon, Download } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import { useFetch } from "@/lib/queries";
import toast from "react-hot-toast";

type VehicleType = "car" | "truck" | "motorcycle" | "excavator" | "bulldozer" | "dump_truck" | "crane" | "loader" | "grader" | "other";
type VehicleStatus = "active" | "maintenance" | "sold" | "inactive";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vin: string | null;
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

const vehicleTypeLabels: Record<string, string> = {
  car: "Car", truck: "Truck", motorcycle: "Motorcycle", excavator: "Excavator",
  bulldozer: "Bulldozer", dump_truck: "Dump Truck", crane: "Crane", loader: "Loader", grader: "Grader", other: "Other",
};

const statusColors: Record<VehicleStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", label: "Active" },
  maintenance: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", label: "In Maintenance" },
  sold: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", label: "Sold" },
  inactive: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", label: "Inactive" },
};

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [filterType, setFilterType] = useState<VehicleType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { data: vehicles = [], isLoading, error } = useFetch<Vehicle[]>(
    ["vehicles"],
    "/api/vehicles",
    { enabled: authStatus === "authenticated" }
  );

  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

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
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const handleExportPdf = () => {
    if (selectedIds.length === 0) return;
    const selected = vehicles.filter((v) => selectedIds.includes(v.id));
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Vehicle Export Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.setFontSize(12);
    doc.text(`Total Vehicles: ${selected.length}`, 14, 36);

    const headers = ["Year", "Make", "Model", "VIN", "Mileage", "Status"];
    const rows = selected.map((v) => [
      String(v.year), v.make, v.model,
      (v.vin || "-"), v.currentMileage.toLocaleString(),
      statusColors[v.status as VehicleStatus]?.label || v.status,
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
  const upcomingReminders = vehicles.reduce((sum, v) => sum + v.reminders.length, 0);

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load vehicles</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Vehicles</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || "User"}
            </p>
          </div>
          <Link
            href="/dashboard/vehicles/new"
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Vehicles</p>
            <p className="text-3xl font-bold text-foreground">{vehicles.length}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Miles</p>
            <p className="text-3xl font-bold text-foreground">{totalMiles.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Active Vehicles</p>
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
              <option value="all">All Types</option>
              {vehicleTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as VehicleStatus | "all")}
              className="px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">In Maintenance</option>
              <option value="inactive">Inactive</option>
              <option value="sold">Sold</option>
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
              <span className="text-foreground">{selectedIds.length} selected</span>
            </label>
            <div className="ml-auto relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm"
              >
                <Download className="w-4 h-4" />
                Export Selected ({selectedIds.length})
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                  <button onClick={handleExportPdf} className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent rounded-t-lg">PDF Report</button>
                  <button onClick={handleExportCsv} className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent rounded-b-lg">CSV</button>
                </div>
              )}
            </div>
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">No vehicles yet</h2>
            <p className="text-muted-foreground mb-4">Add your first vehicle to start tracking maintenance</p>
            <Link href="/dashboard/vehicles/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
              <Plus className="w-4 h-4" />Add Vehicle
            </Link>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">No vehicles match filters</h2>
            <p className="text-muted-foreground mb-4">Try adjusting your filter criteria</p>
            <button onClick={() => { setFilterType("all"); setFilterStatus("all"); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">Clear Filters</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => {
              const Icon = vehicleTypeIcons[vehicle.vehicleType] || Car;
              const statusStyle = statusColors[vehicle.status as VehicleStatus] || statusColors.active;
              const typeLabel = vehicleTypeLabels[vehicle.vehicleType] || "Other";
              return (
                <div key={vehicle.id} className="relative">
                  <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(vehicle.id)} onChange={() => toggleSelect(vehicle.id)} className="w-4 h-4 rounded border-border cursor-pointer" />
                  </div>
                  <Link href={`/dashboard/vehicles/${vehicle.id}`} className="block p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors"><Icon className="w-6 h-6 text-primary" /></div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{statusStyle.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{vehicle.year}</span>
                      <span className="text-xs text-muted-foreground">&bull;</span>
                      <span className="text-xs text-muted-foreground">{typeLabel}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-foreground">{vehicle.make} {vehicle.model}</h3>
                    {vehicle.nickname && <p className="text-sm text-muted-foreground mb-3">{vehicle.nickname}</p>}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Mileage</p>
                        <p className="font-semibold text-foreground">{vehicle.currentMileage.toLocaleString()} mi</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Reminders</p>
                        <p className="font-semibold text-foreground">{vehicle.reminders.length}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Link href="/dashboard/reminders" className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors">
            <BellIcon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">Reminders</h3>
            <p className="text-sm text-muted-foreground">{upcomingReminders > 0 ? `${upcomingReminders} active reminders` : "No upcoming maintenance"}</p>
          </Link>
          <Link href="/dashboard/transfer" className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors">
            <Settings className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">Transfer Vehicle</h3>
            <p className="text-sm text-muted-foreground">Transfer ownership or claim a vehicle</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

const vehicleTypes = [
  { value: "car", label: "Car" }, { value: "truck", label: "Truck" }, { value: "motorcycle", label: "Motorcycle" },
  { value: "excavator", label: "Excavator" }, { value: "bulldozer", label: "Bulldozer" }, { value: "dump_truck", label: "Dump Truck" },
  { value: "crane", label: "Crane" }, { value: "loader", label: "Loader" }, { value: "grader", label: "Grader" }, { value: "other", label: "Other" },
];
