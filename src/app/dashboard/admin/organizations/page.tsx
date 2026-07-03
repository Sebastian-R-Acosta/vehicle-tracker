import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export default async function AdminOrgsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const [orgs, total] = await Promise.all([
    prisma.organization.findMany({
      include: { _count: { select: { members: true, vehicles: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.count(),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Building2 className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">Organizaciones ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">Miembros</th>
              <th className="p-4 font-medium">Vehículos</th>
              <th className="p-4 font-medium">Creada</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="p-4 font-medium">{o.name}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{o.slug}</td>
                <td className="p-4 text-muted-foreground">{o._count.members}</td>
                <td className="p-4 text-muted-foreground">{o._count.vehicles}</td>
                <td className="p-4 text-muted-foreground">{o.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
