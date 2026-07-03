import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";

export default async function AdminVehiclesPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      include: { user: { select: { email: true, name: true } }, _count: { select: { maintenanceRecords: true, reminders: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.count(),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Car className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">Vehículos ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">Vehículo</th>
              <th className="p-4 font-medium">Propietario</th>
              <th className="p-4 font-medium">Año</th>
              <th className="p-4 font-medium">VIN</th>
              <th className="p-4 font-medium">Km</th>
              <th className="p-4 font-medium">Servicios</th>
              <th className="p-4 font-medium">Recordatorios</th>
              <th className="p-4 font-medium">Creado</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{v.make} {v.model}</td>
                <td className="p-4 text-muted-foreground">{v.user.name ?? v.user.email}</td>
                <td className="p-4 text-muted-foreground">{v.year}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{v.vin ?? "—"}</td>
                <td className="p-4 text-muted-foreground">{v.currentMileage.toLocaleString()}</td>
                <td className="p-4 text-muted-foreground">{v._count.maintenanceRecords}</td>
                <td className="p-4 text-muted-foreground">{v._count.reminders}</td>
                <td className="p-4 text-muted-foreground">{v.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
