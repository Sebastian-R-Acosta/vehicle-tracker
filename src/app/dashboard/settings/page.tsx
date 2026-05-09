"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Users, Car, ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

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
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [error, setError] = useState("");

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
    if (!currentOrgId || !confirm("Are you sure you want to delete this organization? This cannot be undone.")) return;

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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentOrgId || !org) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2 text-foreground">No organization selected</h2>
          <p className="text-muted-foreground">Switch to an organization in the account menu to manage its settings.</p>
        </main>
      </div>
    );
  }

  const isOwner = org.role === "owner";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Organization Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your organization&apos;s branding and preferences
        </p>

        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>
        )}

        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">General</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Organization Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">Used in URLs: vehicle-tracker.app/{slug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-input cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{primaryColor}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <Link
            href="/dashboard/settings/members"
            className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">Members</h3>
            <p className="text-sm text-muted-foreground">
              {org._count?.members || 0} members &bull; Invite new members
            </p>
          </Link>
          <Link
            href="/dashboard/settings/vehicles"
            className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
          >
            <Car className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-foreground">Vehicles</h3>
            <p className="text-sm text-muted-foreground">
              {org._count?.vehicles || 0} vehicles in organization
            </p>
          </Link>
        </div>

        {isOwner && (
          <div className="bg-card rounded-lg border border-destructive/30 p-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting the organization will remove all associated data. This cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
              Delete Organization
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
