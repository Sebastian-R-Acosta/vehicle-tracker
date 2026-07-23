"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Org {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count: { members: number; vehicles: number };
}

export default function AdminOrgsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetch("/api/admin/organizations")
      .then((r) => r.json())
      .then((data) => { setOrgs(data.orgs); setTotal(data.total); })
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
        <Building2 className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">{t("admin.organizations")} ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">{t("admin.name")}</th>
              <th className="p-4 font-medium">{t("admin.slug")}</th>
              <th className="p-4 font-medium">{t("admin.members")}</th>
              <th className="p-4 font-medium">{t("admin.vehicles")}</th>
              <th className="p-4 font-medium">{t("admin.created")}</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{o.name}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{o.slug}</td>
                <td className="p-4 text-muted-foreground">{o._count.members}</td>
                <td className="p-4 text-muted-foreground">{o._count.vehicles}</td>
                <td className="p-4 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
