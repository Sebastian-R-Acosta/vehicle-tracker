import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default async function AdminRecordsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const [records, total] = await Promise.all([
    prisma.maintenanceRecord.findMany({
      include: { vehicle: { select: { make: true, model: true, user: { select: { email: true } } } } },
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.maintenanceRecord.count(),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <FileText className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">Registros de Servicio ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">Vehículo</th>
              <th className="p-4 font-medium">Propietario</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">Fecha</th>
              <th className="p-4 font-medium">Km</th>
              <th className="p-4 font-medium">Costo</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{r.vehicle.make} {r.vehicle.model}</td>
                <td className="p-4 text-muted-foreground">{r.vehicle.user.email}</td>
                <td className="p-4 text-muted-foreground">{r.serviceType}</td>
                <td className="p-4 text-muted-foreground">{r.date.toLocaleDateString()}</td>
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
