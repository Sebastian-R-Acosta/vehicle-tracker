import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Users, Mail, Calendar } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const [users, total] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Users className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold">Usuarios ({total})</h1>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Rol</th>
              <th className="p-4 font-medium">Vehículos</th>
              <th className="p-4 font-medium">Registro</th>
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
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    u.role === "admin"
                      ? "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/40"
                      : "text-muted-foreground bg-muted"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">—</td>
                <td className="p-4 text-muted-foreground">{u.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
