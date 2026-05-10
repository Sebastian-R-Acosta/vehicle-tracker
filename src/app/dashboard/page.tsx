"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Car, Plus, Settings, Loader2, Truck, Bike, Zap, Bell as BellIcon } from "lucide-react";
import Link from "next/link";

type VehicleType = "car" | "truck" | "motorcycle" | "other";
type VehicleStatus = "active" | "maintenance" | "sold" | "inactive";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vehicleType: VehicleType;
  status: VehicleStatus;
  currentMileage: number;
  maintenanceRecords: { id: string }[];
  reminders: { id: string }[];
}

const vehicleTypeIcons: Record<VehicleType, React.ElementType> = {
  car: Car,
  truck: Truck,
  motorcycle: Bike,
  other: Zap,
};

const vehicleTypeLabels: Record<VehicleType, string> = {
  car: "Car",
  truck: "Truck",
  motorcycle: "Motorcycle",
  other: "Other",
};

const statusColors: Record<VehicleStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", label: "Active" },
  maintenance: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", label: "In Maintenance" },
  sold: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", label: "Sold" },
  inactive: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", label: "Inactive" },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<VehicleType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | "all">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchVehicles();
    }
  }, [session]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const typeMatch = filterType === "all" || vehicle.vehicleType === filterType;
    const statusMatch = filterStatus === "all" || vehicle.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const totalMiles = vehicles.reduce((sum, v) => sum + v.currentMileage, 0);
  const activeVehicles = vehicles.filter((v) => v.status === "active").length;
  const upcomingReminders = vehicles.reduce((sum, v) => sum + v.reminders.length, 0);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="other">Other</option>
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

        {vehicles.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">No vehicles yet</h2>
            <p className="text-muted-foreground mb-4">
              Add your first vehicle to start tracking maintenance
            </p>
            <Link
              href="/dashboard/vehicles/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Link>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">No vehicles match filters</h2>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filter criteria
            </p>
            <button
              onClick={() => { setFilterType("all"); setFilterStatus("all"); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => {
              const Icon = vehicleTypeIcons[vehicle.vehicleType as VehicleType] || Car;
              const statusStyle = statusColors[vehicle.status as VehicleStatus] || statusColors.active;
              return (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/vehicles/${vehicle.id}`}
                  className="block p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{vehicle.year}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{vehicleTypeLabels[vehicle.vehicleType as VehicleType]}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-foreground">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.nickname && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {vehicle.nickname}
                    </p>
                  )}
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
              );
            })}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Link
            href="/dashboard/reminders"
            className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <BellIcon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">Reminders</h3>
            <p className="text-sm text-muted-foreground">
              {upcomingReminders > 0 ? `${upcomingReminders} active reminders` : "No upcoming maintenance"}
            </p>
          </Link>
          <Link
            href="/dashboard/transfer"
            className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <Settings className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">Transfer Vehicle</h3>
            <p className="text-sm text-muted-foreground">
              Transfer ownership or claim a vehicle
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}