"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Doc {
  id: string;
  name: string;
  type: string;
  expiryDate: string | null;
  createdAt: string;
  vehicle: { make: string; model: string; user: { email: string } };
}

export default function AdminDocumentsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((data) => { setDocs(data.docs); setTotal(data.total); })
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
        <h1 className="text-2xl font-bold">{t("admin.documents")} ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">{t("admin.name")}</th>
              <th className="p-4 font-medium">{t("admin.vehicle")}</th>
              <th className="p-4 font-medium">{t("admin.owner")}</th>
              <th className="p-4 font-medium">{t("admin.type")}</th>
              <th className="p-4 font-medium">{t("admin.expires")}</th>
              <th className="p-4 font-medium">{t("admin.uploaded")}</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{d.name}</td>
                <td className="p-4 text-muted-foreground">{d.vehicle.make} {d.vehicle.model}</td>
                <td className="p-4 text-muted-foreground">{d.vehicle.user.email}</td>
                <td className="p-4 text-muted-foreground">{d.type}</td>
                <td className="p-4 text-muted-foreground">{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : "—"}</td>
                <td className="p-4 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
