"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Car, Plus, LogOut, Wrench, Bell, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  currentMileage: number;
  maintenanceRecords: { id: string }[];
  reminders: { id: string }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <Car className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Vehicle Tracker</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/reminders"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              >
                <Bell className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Vehicles</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || "User"}
            </p>
          </div>
          <Link
            href="/dashboard/vehicles/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Link>
        </div>

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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/dashboard/vehicles/${vehicle.id}`}
                className="block p-6 bg-card rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Car className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {vehicle.year}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">
                  {vehicle.make} {vehicle.model}
                </h3>
                {vehicle.nickname && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {vehicle.nickname}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-4">
                  {vehicle.currentMileage.toLocaleString()} miles
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Wrench className="w-4 h-4" />
                    <span>
                      {vehicle.maintenanceRecords.length} records
                    </span>
                  </div>
                  {vehicle.reminders.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Bell className="w-4 h-4" />
                      <span>{vehicle.reminders.length} reminders</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link
            href="/dashboard/reminders"
            className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <Bell className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">Reminders</h3>
            <p className="text-sm text-muted-foreground">
              View and manage upcoming maintenance
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