"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Loader2, Save, User, BadgeCheck, Calendar, MapPin, Car, ChevronRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  licenseState: string | null;
  licenseClass: string | null;
  smsNotifications: boolean;
  pushNotifications: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [licenseClass, setLicenseClass] = useState("");
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setLicenseNumber(data.licenseNumber || "");
        setLicenseExpiry(data.licenseExpiry ? data.licenseExpiry.slice(0, 10) : "");
        setLicenseState(data.licenseState || "");
        setLicenseClass(data.licenseClass || "");
        setSmsNotifications(data.smsNotifications);
        setPushNotifications(data.pushNotifications);
      })
      .catch(() => toast.error(t("errors.generic")))
      .finally(() => setLoading(false));
  }, [status, router, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          licenseNumber,
          licenseExpiry: licenseExpiry || null,
          licenseState,
          licenseClass,
          smsNotifications,
          pushNotifications,
        }),
      });
      if (res.ok) {
        toast.success(t("common.save"));
      } else {
        toast.error(t("errors.generic"));
      }
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setSaving(false);
    }
  };

  const daysUntilExpiry = profile?.licenseExpiry
    ? Math.ceil((new Date(profile.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("common.edit")} {t("driver.license")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {session?.user?.email}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("common.save")}
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/20 rounded-xl">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t("driver.license")}</h2>
            <p className="text-sm text-blue-200">
              {licenseState || "RD"} &mdash; {licenseClass || "Ligero"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">{t("driver.name")}</p>
            <p className="text-lg font-semibold">{name || session?.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">{t("driver.licenseNumber")}</p>
            <p className="text-lg font-semibold font-mono">{licenseNumber || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">{t("driver.licenseClass")}</p>
            <p className="text-lg font-semibold">{licenseClass || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">{t("driver.licenseExpiry")}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">
                {licenseExpiry || "—"}
              </p>
              {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 rounded-full">
                  {daysUntilExpiry <= 0 ? "VENCIDA" : `${daysUntilExpiry}d`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          {t("auth.name")}
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("auth.name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("driver.phone")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
              placeholder="+1-809-555-0100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("driver.licenseNumber")}</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("driver.licenseExpiry")}</label>
            <input
              type="date"
              value={licenseExpiry}
              onChange={(e) => setLicenseExpiry(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("driver.licenseClass")}</label>
            <select
              value={licenseClass}
              onChange={(e) => setLicenseClass(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
            >
              <option value="">—</option>
              <option value="Ligero">Ligero</option>
              <option value="Pesado">Pesado</option>
              <option value="Motocicleta">Motocicleta</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
              <option value="C3">C3</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("driver.license")} {t("common.edit")}</label>
            <input
              type="text"
              value={licenseState}
              onChange={(e) => setLicenseState(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
              placeholder="RD"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          {t("notifications.title")}
        </h3>

        <label className="flex items-center justify-between py-2">
          <span className="text-sm text-foreground">{t("notifications.pushPrefs")}</span>
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={(e) => setPushNotifications(e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
          />
        </label>
        <label className="flex items-center justify-between py-2">
          <span className="text-sm text-foreground">{t("notifications.emailPrefs")}</span>
          <input
            type="checkbox"
            checked={smsNotifications}
            onChange={(e) => setSmsNotifications(e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
          />
        </label>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        <Link
          href="/dashboard/vehicles"
          className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t("vehicle.title")}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t("settings.title")}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
