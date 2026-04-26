"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  ArrowLeft,
  Plus,
  Wrench,
  Clock,
  Bell,
  Download,
  Share2,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

interface MaintenanceRecord {
  id: string;
  date: string;
  serviceType: string;
  mileage: number;
  notes: string | null;
  imageUrl: string | null;
  cost: number | null;
}

interface Reminder {
  id: string;
  title: string;
  dueDate: string | null;
  dueMileage: number | null;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vin: string | null;
  currentMileage: number;
  maintenanceRecords: MaintenanceRecord[];
  reminders: Reminder[];
}

export default function VehicleDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchVehicle();
    }
  }, [session, params.id]);

  const fetchVehicle = async () => {
    try {
      const res = await fetch(`/api/vehicles/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setVehicle(data);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch vehicle:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/vehicles/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
    }
  };

  const generateReport = async () => {
    try {
      const res = await fetch(`/api/vehicles/${params.id}/report-pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vehicle-report-${vehicle?.make}-${vehicle?.model}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    }
  };

  if (status === "loading" || loading || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const lastMaintenance = vehicle.maintenanceRecords[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generateReport}
                className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Download className="w-4 h-4" />
                Report
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  {vehicle.nickname && (
                    <p className="text-gray-500">{vehicle.nickname}</p>
                  )}
                </div>
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/edit`}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Current Mileage</p>
                  <p className="text-lg font-semibold">
                    {vehicle.currentMileage.toLocaleString()} mi
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">VIN</p>
                  <p className="text-lg font-semibold">
                    {vehicle.vin || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Service</p>
                  <p className="text-lg font-semibold">
                    {lastMaintenance ? (
                      <>
                        {new Date(lastMaintenance.date).toLocaleDateString()}
                        <br />
                        <span className="text-sm font-normal text-gray-500">
                          {lastMaintenance.serviceType}
                        </span>
                      </>
                    ) : (
                      "No records"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Maintenance History</h2>
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/maintenance/new`}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </Link>
              </div>

              {vehicle.maintenanceRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No maintenance records yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {vehicle.maintenanceRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-6 flex items-start justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Wrench className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{record.serviceType}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString()} at{" "}
                            {record.mileage.toLocaleString()} miles
                          </p>
                          {record.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              {record.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/vehicles/${vehicle.id}/maintenance/${record.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Reminders</h2>
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/reminders/new`}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>

              {vehicle.reminders.length === 0 ? (
                <p className="text-sm text-gray-500">No active reminders</p>
              ) : (
                <div className="space-y-3">
                  {vehicle.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <Bell className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{reminder.title}</p>
                        <p className="text-xs text-gray-500">
                          {reminder.dueDate &&
                            new Date(reminder.dueDate).toLocaleDateString()}
                          {reminder.dueMileage &&
                            ` at ${reminder.dueMileage.toLocaleString()} mi`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/transfer`}
                  className="flex items-center gap-2 p-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Share2 className="w-4 h-4" />
                  Transfer Ownership
                </Link>
                <button
                  onClick={generateReport}
                  className="flex items-center gap-2 p-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Delete Vehicle</h2>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this vehicle? This will also delete all
              maintenance records and reminders. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}