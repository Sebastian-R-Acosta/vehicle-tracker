"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string | null;
  vin: string | null;
  currentMileage: number;
  createdAt: string;
  user: { email: string; name: string | null };
  _count: { maintenanceRecords: number; reminders: number };
}

export default function AdminVehiclesPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetch("/api/admin/vehicles")
      .then((r) => r.json())
      .then((data) => { setVehicles(data.vehicles); setTotal(data.total); })
      .finally(() => setLoading(false));
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (session?.user?.role !== "admin") return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Car className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">{t("admin.vehicles")} ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">{t("admin.vehicle")}</th>
              <th className="p-4 font-medium">{t("admin.owner")}</th>
              <th className="p-4 font-medium">{t("admin.year")}</th>
              <th className="p-4 font-medium">{t("admin.plate")}</th>
              <th className="p-4 font-medium">{t("admin.vin")}</th>
              <th className="p-4 font-medium">{t("admin.km")}</th>
              <th className="p-4 font-medium">{t("admin.services")}</th>
              <th className="p-4 font-medium">{t("admin.reminders")}</th>
              <th className="p-4 font-medium">{t("admin.created")}</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{v.make} {v.model}</td>
                <td className="p-4 text-muted-foreground">{v.user.name ?? v.user.email}</td>
                <td className="p-4 text-muted-foreground">{v.year}</td>
                <td className="p-4 text-muted-foreground">{v.licensePlate ?? "—"}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{v.vin ?? "—"}</td>
                <td className="p-4 text-muted-foreground">{v.currentMileage.toLocaleString()}</td>
                <td className="p-4 text-muted-foreground">{v._count.maintenanceRecords}</td>
                <td className="p-4 text-muted-foreground">{v._count.reminders}</td>
                <td className="p-4 text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
