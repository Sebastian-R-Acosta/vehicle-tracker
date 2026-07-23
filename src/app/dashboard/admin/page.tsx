"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Car, FileText, CreditCard, Activity, TrendingUp, Shield } from "lucide-react";
import ClaimSuperAdminButton from "@/components/admin/ClaimSuperAdminButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AdminStats {
  userCount: number;
  vehicleCount: number;
  recordCount: number;
  docCount: number;
  orgCount: number;
  recentUsers: { id: string; email: string; name: string | null; role: string; createdAt: string }[];
}

export default function AdminPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
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

  const isSuperAdmin = (session?.user as any)?.superAdmin ?? false;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <Activity className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">{t("admin.dashboard")}</h1>
        {isSuperAdmin ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40">
            <Shield className="w-3 h-3" />
            {t("admin.superAdmin")}
          </span>
        ) : (
          <ClaimSuperAdminButton />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard href="/dashboard/admin/users" icon={<Users className="w-5 h-5" />} label={t("admin.users")} value={stats?.userCount ?? 0} />
        <StatCard href="/dashboard/admin/vehicles" icon={<Car className="w-5 h-5" />} label={t("admin.vehicles")} value={stats?.vehicleCount ?? 0} />
        <StatCard href="/dashboard/admin/records" icon={<FileText className="w-5 h-5" />} label={t("admin.serviceRecords")} value={stats?.recordCount ?? 0} />
        <StatCard href="/dashboard/admin/documents" icon={<FileText className="w-5 h-5" />} label={t("admin.documents")} value={stats?.docCount ?? 0} />
        <StatCard href="/dashboard/admin/organizations" icon={<CreditCard className="w-5 h-5" />} label={t("admin.organizations")} value={stats?.orgCount ?? 0} />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t("admin.recentUsers")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">{t("admin.email")}</th>
                <th className="pb-3 font-medium">{t("admin.name")}</th>
                <th className="pb-3 font-medium">{t("admin.role")}</th>
                <th className="pb-3 font-medium">{t("admin.registered")}</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-2.5">{u.email}</td>
                  <td className="py-2.5 text-muted-foreground">{u.name ?? "—"}</td>
                  <td className="py-2.5">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      u.role === "admin"
                        ? "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/40"
                        : "text-muted-foreground bg-muted"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ href, icon, label, value }: { href: string; icon: React.ReactNode; label: string; value: number }) {
  return (
    <Link href={href} className="block bg-card border border-border rounded-xl p-4 hover:border-yellow-500/50 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </Link>
  );
}
