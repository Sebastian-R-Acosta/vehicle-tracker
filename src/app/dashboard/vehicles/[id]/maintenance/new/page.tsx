"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Wrench } from "lucide-react";
import Link from "next/link";

const maintenanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  serviceType: z.string().min(1, "Service type is required"),
  mileage: z.number().min(0, "Mileage must be positive"),
  notes: z.string().optional(),
  cost: z.number().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

const serviceTypes = [
  "Oil Change",
  "Tire Rotation",
  "Brake Service",
  "Air Filter",
  "Transmission Service",
  "Battery Replacement",
  "Inspection",
  "Repair",
  "Other",
];

export default function NewMaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const onSubmit = async (data: MaintenanceFormData) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/vehicles/${params.id}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to create record");
      }

      router.push(`/dashboard/vehicles/${params.id}`);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href={`/dashboard/vehicles/${params.id}`}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold">Add Maintenance Record</h1>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mileage <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("mileage", { valueAsNumber: true })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="0"
                />
                {errors.mileage && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.mileage.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("serviceType")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Select service type</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.serviceType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Any additional details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost (optional)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("cost", { valueAsNumber: true })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Record
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}