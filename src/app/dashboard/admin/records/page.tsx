"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Record {
  id: string;
  serviceType: string;
  date: string;
  mileage: number;
  cost: number | null;
  vehicle: { make: string; model: string; user: { email: string } };
}

export default function AdminRecordsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetch("/api/admin/records")
      .then((r) => r.json())
      .then((data) => { setRecords(data.records); setTotal(data.total); })
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
        <FileText className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">{t("admin.serviceRecords")} ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">{t("admin.vehicle")}</th>
              <th className="p-4 font-medium">{t("admin.owner")}</th>
              <th className="p-4 font-medium">{t("admin.type")}</th>
              <th className="p-4 font-medium">{t("admin.date")}</th>
              <th className="p-4 font-medium">{t("admin.km")}</th>
              <th className="p-4 font-medium">{t("admin.cost")}</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{r.vehicle.make} {r.vehicle.model}</td>
                <td className="p-4 text-muted-foreground">{r.vehicle.user.email}</td>
                <td className="p-4 text-muted-foreground">{r.serviceType}</td>
                <td className="p-4 text-muted-foreground">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-4 text-muted-foreground">{r.mileage.toLocaleString()}</td>
                <td className="p-4 text-muted-foreground">{r.cost != null ? `$${r.cost.toFixed(2)}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
