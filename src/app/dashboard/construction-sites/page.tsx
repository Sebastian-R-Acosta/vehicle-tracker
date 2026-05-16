"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Loader2, Building2, MapPin, Wrench, Search } from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/lib/queries";

interface ConstructionSite {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  _count: { vehicles: number };
}

export default function ConstructionSitesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const orgId = session?.user?.currentOrganizationId || "";
  const { data: sites = [], isLoading } = useFetch<ConstructionSite[]>(
    ["construction-sites", orgId],
    `/api/construction-sites?organizationId=${orgId}`,
    { enabled: !!session?.user?.currentOrganizationId }
  );

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const filtered = search
    ? sites.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : sites;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user?.currentOrganizationId) {
    return (
      <div className="bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">Create an organization first</h2>
            <p className="text-muted-foreground mb-4">
              You need to be part of an organization to manage construction sites.
            </p>
            <Link href="/dashboard/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
              Go to Settings
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Construction Sites</h1>
            <p className="text-muted-foreground">Manage your job sites and equipment</p>
          </div>
          <Link href="/dashboard/construction-sites/new" className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            New Site
          </Link>
        </div>

        {sites.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search sites by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">
              {search ? "No sites match your search" : "No construction sites yet"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {search ? "Try a different name" : "Create your first site to start tracking equipment"}
            </p>
            {!search && (
              <Link href="/dashboard/construction-sites/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                <Plus className="w-4 h-4" />
                New Site
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((site) => (
              <Link key={site.id} href={`/dashboard/construction-sites/${site.id}`} className="block p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Wrench className="w-4 h-4" />
                    {site._count.vehicles}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">{site.name}</h3>
                {(site.city || site.state) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {[site.city, site.state].filter(Boolean).join(", ")}
                  </p>
                )}
                {site.address && <p className="text-xs text-muted-foreground mt-1">{site.address}</p>}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
