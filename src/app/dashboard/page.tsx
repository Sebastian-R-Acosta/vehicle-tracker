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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Vehicle Tracker</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/reminders"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
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
            <h1 className="text-2xl font-bold">My Vehicles</h1>
            <p className="text-gray-500">
              Welcome back, {session?.user?.name || "User"}
            </p>
          </div>
          <Link
            href="/dashboard/vehicles/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Car className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-lg font-medium mb-2">No vehicles yet</h2>
            <p className="text-gray-500 mb-4">
              Add your first vehicle to start tracking maintenance
            </p>
            <Link
              href="/dashboard/vehicles/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Car className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {vehicle.year}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {vehicle.make} {vehicle.model}
                </h3>
                {vehicle.nickname && (
                  <p className="text-sm text-gray-500 mb-2">
                    {vehicle.nickname}
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  {vehicle.currentMileage.toLocaleString()} miles
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <Bell className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-1">Reminders</h3>
            <p className="text-sm text-gray-500">
              View and manage upcoming maintenance
            </p>
          </Link>
          <Link
            href="/dashboard/transfer"
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <Settings className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-1">Transfer Vehicle</h3>
            <p className="text-sm text-gray-500">
              Transfer ownership or claim a vehicle
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}