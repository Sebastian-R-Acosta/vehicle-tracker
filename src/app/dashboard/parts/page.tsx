"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Plus, Search, Filter, Loader2, AlertTriangle, PackageOpen } from "lucide-react";
import Link from "next/link";

interface VehicleRef {
  id: string;
  make: string;
  model: string;
  nickname: string | null;
}

interface Part {
  id: string;
  name: string;
  partNumber: string | null;
  category: string;
  quantity: number;
  minStock: number;
  unitCost: number | null;
  supplier: string | null;
  vehicle: VehicleRef | null;
}

export default function PartsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.currentOrganizationId) {
      fetchParts();
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.currentOrganizationId) {
      fetchParts();
    }
  }, [categoryFilter]);

  const fetchParts = async () => {
    try {
      const url = new URL("/api/parts", window.location.origin);
      if (categoryFilter) url.searchParams.set("category", categoryFilter);
      const res = await fetch(url.toString());
      if (res.ok) {
        setParts(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch parts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/parts/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const filtered = parts.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.partNumber?.toLowerCase().includes(q) ?? false);
  });

  const lowStockCount = parts.filter((p) => p.quantity < p.minStock).length;

  if (status === "loading" || loading) {
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
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">Create an organization first</h2>
            <p className="text-muted-foreground mb-4">
              You need to be part of an organization to manage parts inventory.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
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
            <h1 className="text-2xl font-bold text-foreground">Parts Inventory</h1>
            <p className="text-muted-foreground">Manage your parts and supplies</p>
          </div>
          <Link
            href="/dashboard/parts/new"
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Part
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Parts</p>
            <p className="text-3xl font-bold text-foreground">{parts.length}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Low Stock</p>
            <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Categories</p>
            <p className="text-3xl font-bold text-foreground">{categories.length}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or part number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <PackageOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">
              {parts.length === 0 ? "No parts yet" : "No parts match your search"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {parts.length === 0
                ? "Add your first part to start tracking inventory"
                : "Try adjusting your search or filter"}
            </p>
            {parts.length === 0 && (
              <Link
                href="/dashboard/parts/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Add Part
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Part Number</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Quantity</th>
                    <th className="px-6 py-4 font-medium">Min Stock</th>
                    <th className="px-6 py-4 font-medium">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((part) => {
                    const isLowStock = part.quantity < part.minStock;
                    return (
                      <tr
                        key={part.id}
                        onClick={() => router.push(`/dashboard/parts/${part.id}`)}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary rounded-lg">
                              <Package className="w-4 h-4 text-secondary-foreground" />
                            </div>
                            <span className="font-medium text-foreground">{part.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {part.partNumber || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                            {part.category.charAt(0).toUpperCase() + part.category.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={isLowStock ? "text-red-600 font-medium" : "text-foreground"}>
                            {part.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{part.minStock}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{part.supplier || "—"}</span>
                            {isLowStock && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
