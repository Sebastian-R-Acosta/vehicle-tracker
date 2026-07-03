import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default async function AdminDocumentsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const [docs, total] = await Promise.all([
    prisma.vehicleDocument.findMany({
      include: { vehicle: { select: { make: true, model: true, user: { select: { email: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.vehicleDocument.count(),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <FileText className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">Documentos ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Vehículo</th>
              <th className="p-4 font-medium">Propietario</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">Vence</th>
              <th className="p-4 font-medium">Subido</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{d.name}</td>
                <td className="p-4 text-muted-foreground">{d.vehicle.make} {d.vehicle.model}</td>
                <td className="p-4 text-muted-foreground">{d.vehicle.user.email}</td>
                <td className="p-4 text-muted-foreground">{d.type}</td>
                <td className="p-4 text-muted-foreground">{d.expiryDate?.toLocaleDateString() ?? "—"}</td>
                <td className="p-4 text-muted-foreground">{d.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
