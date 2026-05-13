"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Users, Search, CheckCircle, XCircle, Mail, Phone, BadgeCheck } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  isActive: boolean;
}

export default function DriversPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.currentOrganizationId) {
      fetchDrivers();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`/api/drivers?organizationId=${session?.user?.currentOrganizationId}`);
      if (res.ok) {
        setDrivers(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.isActive).length;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user?.currentOrganizationId) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2 text-foreground">Create an organization first</h2>
          <p className="text-muted-foreground mb-4">
            You need to be part of an organization to manage drivers.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Go to Settings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
          <p className="text-muted-foreground">Manage your drivers and their assignments</p>
        </div>
        <Link
          href="/dashboard/drivers/new"
          className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Drivers</p>
          <p className="text-3xl font-bold text-foreground">{totalDrivers}</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Active Drivers</p>
          <p className="text-3xl font-bold text-green-600">{activeDrivers}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search drivers by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
        />
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2 text-foreground">
            {search ? "No drivers match your search" : "No drivers yet"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {search ? "Try a different name" : "Add your first driver to get started"}
          </p>
          {!search && (
            <Link
              href="/dashboard/drivers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Driver
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">License</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                  className="hover:bg-accent cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{driver.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {driver.email || "\u2014"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {driver.phone || "\u2014"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {driver.licenseNumber || "\u2014"}
                    </div>
                  </td>
                  <td className="p-4">
                    {driver.isActive ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-red-600">
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
