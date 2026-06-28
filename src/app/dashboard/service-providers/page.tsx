"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle, Plus, Loader2, Building2, Star, Phone, MapPin, Search, Filter,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/lib/queries";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Review {
  id: string;
  rating: number;
  review: string | null;
  createdAt: string;
  user: { id: string; name: string | null };
}

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  notes: string | null;
  isPreferred: boolean;
  reviews: Review[];
}





function avgRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export default function ServiceProvidersPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const orgId = session?.user?.currentOrganizationId || "";
  const { data: providers = [], isLoading, error } = useFetch<ServiceProvider[]>(
    ["service-providers", orgId, categoryFilter],
    `/api/service-providers?organizationId=${orgId}${categoryFilter ? `&category=${categoryFilter}` : ""}`,
    { enabled: !!session?.user?.currentOrganizationId },
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" role="alert">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-7 h-7 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">{t("errors.generic")}</h1>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90">{t("errors.tryAgain")}</button>
        </div>
      </div>
    );
  }

  if (!session?.user?.currentOrganizationId) {
    return (
      <div className="bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">{t("common.noOrgHeading")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("dashboard.serviceProviders.noOrgDesc")}
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              {t("common.goToSettings")}
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
            <h1 className="text-2xl font-bold text-foreground">{t("dashboard.serviceProviders.heading")}</h1>
            <p className="text-muted-foreground">{t("dashboard.serviceProviders.subtitle")}</p>
          </div>
          <Link
            href="/dashboard/service-providers/new"
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t("dashboard.serviceProviders.addProvider")}
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("dashboard.serviceProviders.searchPlaceholder")}
              aria-label={t("dashboard.serviceProviders.searchLabel")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="pl-10 p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground min-w-[180px]"
            >
              <option value="">{t("dashboard.serviceProviders.allCategories")}</option>
              {Object.entries(t("dashboard.serviceProviders.categories") as Record<string, string>).map(([c, lbl]) => (
                <option key={c} value={c}>{lbl}</option>
              ))}
            </select>
          </div>
        </div>

        {providers.length === 0 && !search && !categoryFilter ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2 text-foreground">{t("dashboard.serviceProviders.noProviders")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("dashboard.serviceProviders.addFirstProvider")}
            </p>
            <Link
              href="/dashboard/service-providers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              {t("dashboard.serviceProviders.addProviderCta")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                {t("dashboard.serviceProviders.noMatch")}
              </div>
            ) : (
              filtered.map((provider) => {
                const avg = avgRating(provider.reviews);
                return (
                  <Link
                    key={provider.id}
                    href={`/dashboard/service-providers/${provider.id}`}
                    className="block p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {provider.isPreferred && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                            <Star className="w-3 h-3" />
                            {t("dashboard.serviceProviders.preferred")}
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {(t("dashboard.serviceProviders.categories") as Record<string, string>)[provider.category] || provider.category}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-foreground">{provider.name}</h3>
                    {provider.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {provider.phone}
                      </p>
                    )}
                    {provider.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {provider.address}
                      </p>
                    )}
                    {provider.reviews.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="text-yellow-500">
                          {Array.from({ length: 5 }, (_, i) =>
                            i < Math.round(avg) ? "★" : "☆",
                          ).join("")}
                        </span>{" "}
                        ({avg.toFixed(1)})
                      </p>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
