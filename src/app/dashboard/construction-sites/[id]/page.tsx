"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Building2, MapPin, Car, Truck, Plus, Pencil, Trash2, Drill, Tractor, Hammer } from "lucide-react";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vehicleType: string;
  status: string;
  currentMileage: number;
  hoursMeter: number | null;
  equipmentStatus: string | null;
}

interface ConstructionSite {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  vehicles: Vehicle[];
}

const vehicleIcons: Record<string, React.ElementType> = {
  car: Car, truck: Truck, excavator: Drill, bulldozer: Tractor, dump_truck: Truck,
  crane: Building2, loader: Hammer, grader: Tractor, other: Car,
};

const vehicleLabels: Record<string, string> = {
  car: "Car", truck: "Truck", excavator: "Excavator", bulldozer: "Bulldozer",
  dump_truck: "Dump Truck", crane: "Crane", loader: "Loader", grader: "Grader", other: "Other",
};

const equipmentStatusStyles: Record<string, { bg: string; text: string; label: string }> = {
  operational: { bg: "bg-green-500/10", text: "text-green-600", label: "Operational" },
  idle: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Idle" },
  down: { bg: "bg-red-500/10", text: "text-red-600", label: "Down" },
  maintenance: { bg: "bg-blue-500/10", text: "text-blue-600", label: "In Maintenance" },
};

export default function SiteDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [site, setSite] = useState<ConstructionSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchSite();
    }
  }, [session, params.id]);

  const fetchSite = async () => {
    try {
      const res = await fetch(`/api/construction-sites/${params.id}`);
      if (res.ok) {
        setSite(await res.json());
      } else {
        router.push("/dashboard/construction-sites");
      }
    } catch (err) {
      console.error("Failed to fetch site:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/construction-sites/${params.id}`, { method: "DELETE" });
      router.push("/dashboard/construction-sites");
    } catch (err) {
      console.error("Failed to delete site:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading" || loading || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const equipmentSummary = {
    total: site.vehicles.length,
    operational: site.vehicles.filter((v) => v.equipmentStatus === "operational" || (!v.equipmentStatus && v.status === "active")).length,
    idle: site.vehicles.filter((v) => v.equipmentStatus === "idle").length,
    down: site.vehicles.filter((v) => v.equipmentStatus === "down" || v.status === "maintenance").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/construction-sites"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{site.name}</h1>
            {(site.city || site.state) && (
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {[site.address, site.city, site.state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Equipment</p>
            <p className="text-3xl font-bold text-foreground">{equipmentSummary.total}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Operational</p>
            <p className="text-3xl font-bold text-green-600">{equipmentSummary.operational}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Idle</p>
            <p className="text-3xl font-bold text-amber-600">{equipmentSummary.idle}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Down / Maintenance</p>
            <p className="text-3xl font-bold text-red-600">{equipmentSummary.down}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Equipment on Site</h2>
            <Link
              href={`/dashboard/vehicles/new?siteId=${site.id}`}
              className="flex items-center gap-2 px-3 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </Link>
          </div>

          {site.vehicles.length === 0 ? (
            <div className="p-12 text-center">
              <Drill className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No equipment assigned to this site</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {site.vehicles.map((vehicle) => {
                const Icon = vehicleIcons[vehicle.vehicleType] || Car;
                const statusStyle = equipmentStatusStyles[vehicle.equipmentStatus || ""] || 
                  { bg: "bg-green-500/10", text: "text-green-600", label: vehicle.status };
                return (
                  <Link
                    key={vehicle.id}
                    href={`/dashboard/vehicles/${vehicle.id}`}
                    className="p-6 flex items-start justify-between hover:bg-accent"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Icon className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vehicleLabels[vehicle.vehicleType] || vehicle.vehicleType}
                          {vehicle.hoursMeter != null && ` • ${vehicle.hoursMeter.toLocaleString()} hours`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
