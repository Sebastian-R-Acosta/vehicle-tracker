"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Shield } from "lucide-react";
import AdminUserActions from "@/components/admin/AdminUserActions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  superAdmin: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data.users); setTotal(data.total); })
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
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Users className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">{t("admin.users")} ({total})</h1>
        {isSuperAdmin && (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40">
            <Shield className="w-3 h-3" />
            {t("admin.superAdmin")}
          </span>
        )}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">{t("admin.email")}</th>
              <th className="p-4 font-medium">{t("admin.name")}</th>
              <th className="p-4 font-medium">{t("admin.role")}</th>
              <th className="p-4 font-medium">{t("admin.registered")}</th>
              {isSuperAdmin && <th className="p-4 font-medium">{t("admin.actions")}</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4">
                  <Link href={`/dashboard/admin/users/${u.id}`} className="text-primary hover:underline font-medium">
                    {u.email}
                  </Link>
                </td>
                <td className="p-4 text-muted-foreground">{u.name ?? "—"}</td>
                <td className="p-4">
                  {u.superAdmin ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40">
                      <Shield className="w-3 h-3" />
                      super admin
                    </span>
                  ) : (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      u.role === "admin"
                        ? "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/40"
                        : "text-muted-foreground bg-muted"
                    }`}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                {isSuperAdmin && (
                  <td className="p-4">
                    <AdminUserActions userId={u.id} currentRole={u.role} isSuperAdmin={u.superAdmin} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
