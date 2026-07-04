import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, Car, FileText, Bell, Shield } from "lucide-react";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const isSuperAdmin = session?.user?.superAdmin ?? false;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      vehicles: { include: { _count: { select: { maintenanceRecords: true, reminders: true } } } },
      subscription: { include: { plan: true } },
    },
  });

  if (!user) notFound();

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
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Información</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Registrado {user.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Plan</h3>
          <p className="text-lg font-bold">{user.subscription?.plan?.name ?? "Free"}</p>
          <p className="text-xs text-muted-foreground">{user.subscription?.status ?? "no subscription"}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Totales</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <Car className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-lg font-bold">{user.vehicles.length}</p>
              <p className="text-xs text-muted-foreground">Vehículos</p>
            </div>
            <div>
              <FileText className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-lg font-bold">{user.vehicles.reduce((a, v) => a + v._count.maintenanceRecords, 0)}</p>
              <p className="text-xs text-muted-foreground">Servicios</p>
            </div>
            <div>
              <Bell className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-lg font-bold">{user.vehicles.reduce((a, v) => a + v._count.reminders, 0)}</p>
              <p className="text-xs text-muted-foreground">Recordatorios</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Vehículos ({user.vehicles.length})</h3>
        {user.vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin vehículos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Vehículo</th>
                  <th className="pb-3 font-medium">Año</th>
                  <th className="pb-3 font-medium">VIN</th>
                  <th className="pb-3 font-medium">Servicios</th>
                  <th className="pb-3 font-medium">Recordatorios</th>
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
