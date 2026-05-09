"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Car, Truck, Bike, Zap } from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vehicleType: string;
  status: string;
  currentMileage: number;
  user: { name: string | null; email: string };
  maintenanceRecords: { id: string }[];
  reminders: { id: string }[];
}

const typeIcons: Record<string, React.ElementType> = {
  car: Car, truck: Truck, motorcycle: Bike, other: Zap,
};

export default function OrgVehiclesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const currentOrgId = session?.user?.currentOrganizationId;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!currentOrgId) { setLoading(false); return; }
    fetch(`/api/vehicles?organizationId=${currentOrgId}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setVehicles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentOrgId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Link href="/dashboard/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Settings
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Organization Vehicles</h1>

        {vehicles.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">No vehicles in this organization</h2>
            <p className="text-muted-foreground">Vehicles added by members will appear here.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {vehicles.map((v) => {
              const Icon = typeIcons[v.vehicleType] || Car;
              return (
                <Link
                  key={v.id}
                  href={`/dashboard/vehicles/${v.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-accent transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {v.user.name || v.user.email} &bull; {v.currentMileage.toLocaleString()} mi
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{v.maintenanceRecords.length} services</div>
                    <div>{v.reminders.length} reminders</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
