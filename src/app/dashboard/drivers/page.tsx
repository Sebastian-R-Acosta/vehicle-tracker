"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Loader2, Users, Search, CheckCircle, XCircle, Mail, Phone, BadgeCheck } from "lucide-react";
import { useFetch } from "@/lib/queries";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  isActive: boolean;
}

export default function DriversPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const orgId = session?.user?.currentOrganizationId || "";
  const { data: drivers = [], isLoading, error } = useFetch<Driver[]>(
    ["drivers", orgId],
    `/api/drivers?organizationId=${orgId}`,
    { enabled: !!session?.user?.currentOrganizationId }
  );

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.isActive).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32" role="alert">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2 text-foreground">{t("common.noOrgHeading")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("dashboard.drivers.noOrgDesc")}
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            {t("common.goToSettings")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.drivers.heading")}</h1>
          <p className="text-muted-foreground">{t("dashboard.drivers.subtitle")}</p>
        </div>
        <Link
          href="/dashboard/drivers/new"
          className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {t("dashboard.drivers.addDriver")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t("dashboard.drivers.totalDrivers")}</p>
          <p className="text-3xl font-bold text-foreground">{totalDrivers}</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t("dashboard.drivers.activeDrivers")}</p>
          <p className="text-3xl font-bold text-green-600">{activeDrivers}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder={t("dashboard.drivers.searchPlaceholder")}
          aria-label={t("dashboard.drivers.searchLabel")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
        />
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2 text-foreground">
            {search ? t("dashboard.drivers.noSearchResults") : t("dashboard.drivers.noDrivers")}
          </h2>
          <p className="text-muted-foreground mb-4">
            {search ? t("dashboard.drivers.tryDifferentName") : t("dashboard.drivers.addFirstDriver")}
          </p>
          {!search && (
            <Link
              href="/dashboard/drivers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              {t("dashboard.drivers.addDriverCta")}
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("dashboard.drivers.name")}</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("dashboard.drivers.email")}</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("dashboard.drivers.phone")}</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("dashboard.drivers.license")}</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("dashboard.drivers.status")}</th>
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
                        {t("dashboard.drivers.active")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-red-600">
                        <XCircle className="w-4 h-4" />
                        {t("dashboard.drivers.inactive")}
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
