"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, Car, FileText, Bell, Shield } from "lucide-react";
import AdminUserActions from "@/components/admin/AdminUserActions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  role: string;
  superAdmin: boolean;
  createdAt: string;
  vehicles: {
    id: string;
    make: string;
    model: string;
    year: number;
    nickname: string | null;
    vin: string | null;
    _count: { maintenanceRecords: number; reminders: number };
  }[];
  subscription: {
    status: string;
    plan: { name: string } | null;
  } | null;
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetch(`/api/admin/users/${params.id}`)
      .then((r) => r.json())
      .then(setUser)
      .finally(() => setLoading(false));
  }, [session, params.id]);

  if (status === "loading" || loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-muted-foreground">{t("admin.noUsers")}</div>
      </div>
    );
  }

  const isSuperAdmin = (session?.user as any)?.superAdmin ?? false;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/users" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">{user.name ?? user.email}</h1>
        {user.superAdmin ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40">
            <Shield className="w-3 h-3" />
            super admin
          </span>
        ) : (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            user.role === "admin"
              ? "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/40"
              : "text-muted-foreground bg-muted"
          }`}>
            {user.role}
          </span>
        )}
        {isSuperAdmin && !user.superAdmin && (
          <AdminUserActions userId={user.id} currentRole={user.role} isSuperAdmin={false} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">{t("admin.information")}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{t("admin.registered")} {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">{t("admin.plan")}</h3>
          <p className="text-lg font-bold">{user.subscription?.plan?.name ?? t("admin.free")}</p>
          <p className="text-xs text-muted-foreground">{user.subscription?.status ?? t("admin.noSubscription")}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">{t("admin.totals")}</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <Car className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-lg font-bold">{user.vehicles.length}</p>
              <p className="text-xs text-muted-foreground">{t("admin.vehicles")}</p>
            </div>
            <div>
              <FileText className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-lg font-bold">{user.vehicles.reduce((a, v) => a + v._count.maintenanceRecords, 0)}</p>
              <p className="text-xs text-muted-foreground">{t("admin.services")}</p>
            </div>
            <div>
              <Bell className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-lg font-bold">{user.vehicles.reduce((a, v) => a + v._count.reminders, 0)}</p>
              <p className="text-xs text-muted-foreground">{t("admin.reminders")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">{t("admin.vehicles")} ({user.vehicles.length})</h3>
        {user.vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("admin.noVehicles")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">{t("admin.vehicle")}</th>
                  <th className="pb-3 font-medium">{t("admin.year")}</th>
                  <th className="pb-3 font-medium">{t("admin.vin")}</th>
                  <th className="pb-3 font-medium">{t("admin.services")}</th>
                  <th className="pb-3 font-medium">{t("admin.reminders")}</th>
                </tr>
              </thead>
              <tbody>
                {user.vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-border/50">
                    <td className="py-2.5 font-medium">{v.make} {v.model} {v.nickname ? `(${v.nickname})` : ""}</td>
                    <td className="py-2.5 text-muted-foreground">{v.year}</td>
                    <td className="py-2.5 text-muted-foreground font-mono text-xs">{v.vin ?? "—"}</td>
                    <td className="py-2.5 text-muted-foreground">{v._count.maintenanceRecords}</td>
                    <td className="py-2.5 text-muted-foreground">{v._count.reminders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
