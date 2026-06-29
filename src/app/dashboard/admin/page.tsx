import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Users, Car, FileText, CreditCard, Activity, TrendingUp } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const [userCount, vehicleCount, recordCount, docCount, orgCount, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.vehicle.count(),
    prisma.maintenanceRecord.count(),
    prisma.vehicleDocument.count(),
    prisma.organization.count(),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<Users className="w-5 h-5" />} label="Usuarios" value={userCount} />
        <StatCard icon={<Car className="w-5 h-5" />} label="Vehículos" value={vehicleCount} />
        <StatCard icon={<FileText className="w-5 h-5" />} label="Registros de Servicio" value={recordCount} />
        <StatCard icon={<FileText className="w-5 h-5" />} label="Documentos" value={docCount} />
        <StatCard icon={<CreditCard className="w-5 h-5" />} label="Organizaciones" value={orgCount} />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Usuarios Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Nombre</th>
                <th className="pb-3 font-medium">Rol</th>
                <th className="pb-3 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
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
                  <td className="py-2.5 text-muted-foreground">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
