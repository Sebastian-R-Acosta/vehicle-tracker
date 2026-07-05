"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Users, Car, Bell, ArrowLeft, Save, Loader2, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import CreateOrgModal from "@/components/CreateOrgModal";

interface Org {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  role: string;
  _count?: { members: number; vehicles: number };
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const currentOrgId = session?.user?.currentOrganizationId;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (currentOrgId) {
      fetchOrg();
    } else {
      setLoading(false);
    }
  }, [currentOrgId]);

  const fetchOrg = async () => {
    try {
      const res = await fetch(`/api/organizations/${currentOrgId}`);
      if (res.ok) {
        const data = await res.json();
        setOrg(data);
        setName(data.name);
        setSlug(data.slug);
        setPrimaryColor(data.primaryColor || "#2563eb");
      }
    } catch (err) {
      console.error("Failed to fetch org:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrgId) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/organizations/${currentOrgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, primaryColor }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      fetchOrg();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentOrgId || !confirm(t("dashboard.settings.deleteConfirm"))) return;

    try {
      const res = await fetch(`/api/organizations/${currentOrgId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await update({ currentOrganizationId: null });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete org:", err);
    }
  };

  let content: React.ReactNode;

  if (status === "loading" || loading) {
    content = (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  } else if (!currentOrgId || !org) {
    content = (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              {t("dashboard.settings.back")}
            </Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2 text-foreground">{t("dashboard.settings.noOrgHeading")}</h2>
          <p className="text-muted-foreground mb-6">{t("dashboard.settings.noOrgDesc")}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t("common.createOrganization")}
          </button>
        </main>
      </div>
    );
  } else {
    const isOwner = org.role === "owner";

    content = (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              {t("dashboard.settings.back")}
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("dashboard.settings.heading")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("dashboard.settings.subtitle")}
        </p>

        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>
        )}

        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.settings.general")}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.settings.orgName")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.settings.slug")}</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.settings.slugHelper").replace("{slug}", slug)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.settings.brandColor")}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-11 h-11 rounded border border-input cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{primaryColor}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
               className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              {t("dashboard.settings.saveChanges")}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Link
            href="/dashboard/settings/members"
            className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">{t("dashboard.settings.membersCard")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.settings.membersDesc").replace("{n}", String(org._count?.members || 0))}
            </p>
          </Link>
          <Link
            href="/dashboard/settings/vehicles"
            className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <Car className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">{t("vehicle.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.settings.vehiclesDesc").replace("{n}", String(org._count?.vehicles || 0))}
            </p>
          </Link>
          <Link
            href="/dashboard/settings/notifications"
            className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <Bell className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">{t("notifications.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.settings.notificationsDesc")}
            </p>
          </Link>
        </div>

            {isOwner && (
              <div className="bg-card rounded-lg border border-destructive/30 p-6">
                <h2 className="text-lg font-semibold text-destructive mb-2">{t("dashboard.settings.dangerZone")}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("dashboard.settings.dangerZoneDesc")}
                </p>
                <button
                  onClick={handleDelete}
                   className="flex items-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("dashboard.settings.deleteOrg")}
                </button>
              </div>
            )}
          </main>
        </div>
      );
  }

  return (
    <>
      {content}
      <CreateOrgModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => window.location.reload()}
      />
    </>
  );
}
