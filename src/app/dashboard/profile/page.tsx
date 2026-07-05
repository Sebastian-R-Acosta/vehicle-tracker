"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Loader2, Save, User, Bell, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import DocumentWallet from "@/components/DocumentWallet";

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
  licenseImageFront: string | null;
  licenseImageBack: string | null;
  smsNotifications: boolean;
  pushNotifications: boolean;
  createdAt: string;
}

interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  licensePlate: string | null;
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
  const [licenseClass, setLicenseClass] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [licenseImageFront, setLicenseImageFront] = useState<string | null>(null);
  const [licenseImageBack, setLicenseImageBack] = useState<string | null>(null);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [remind90, setRemind90] = useState(true);
  const [remind30, setRemind30] = useState(true);
  const [remindExpiry, setRemindExpiry] = useState(true);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()),
      fetch("/api/vehicles").then((r) => r.json()),
    ])
      .then(([profileData, vehiclesData]: [ProfileData, VehicleData[]]) => {
        setProfile(profileData);
        setVehicles(vehiclesData);
        setName(profileData.name || "");
        setPhone(profileData.phone || "");
        setLicenseNumber(profileData.licenseNumber || "");
        setLicenseExpiry(profileData.licenseExpiry ? profileData.licenseExpiry.slice(0, 10) : "");
        setLicenseClass(profileData.licenseClass || "");
        setLicenseState(profileData.licenseState || "");
        setLicenseImageFront(profileData.licenseImageFront || null);
        setLicenseImageBack(profileData.licenseImageBack || null);
        setSmsNotifications(profileData.smsNotifications);
        setPushNotifications(profileData.pushNotifications);
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
          licenseState: "RD",
          licenseClass,
          licenseImageFront,
          licenseImageBack,
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

  const handleLicenseImageUpload = async (side: "front" | "back", base64: string) => {
    try {
      const res = await fetch("/api/user/license-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, side }),
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (side === "front") {
        setLicenseImageFront(data.imageUrl);
      } else {
        setLicenseImageBack(data.imageUrl);
      }
      toast.success(t("common.save"));
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  const handlePhotograph = (side: "front" | "back") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        handleLicenseImageUpload(side, base64);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("nav.profile")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{session?.user?.email}</p>
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

      {/* Document Wallet */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Document Wallet</h2>
        </div>
        <DocumentWallet
          license={{
            name,
            licenseNumber,
            licenseExpiry,
            licenseClass,
            licenseState,
            licenseImageFront,
            licenseImageBack,
            avatarUrl: session?.user?.image || null,
            phone,
            email: session?.user?.email || null,
          }}
          vehicles={vehicles}
          onUpload={handleLicenseImageUpload}
          onPhotograph={handlePhotograph}
        />
      </div>

      {/* Form Fields */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          {t("driver.name")}
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
            <label className="block text-sm font-medium text-foreground mb-1">{t("license.number")}</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("license.expiry")}</label>
            <input
              type="date"
              value={licenseExpiry}
              onChange={(e) => setLicenseExpiry(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("license.issuingCountry")}</label>
            <div className="w-full px-3 py-2 border border-input rounded-lg bg-muted text-muted-foreground text-sm flex items-center gap-2">
              <span className="text-base">🇩🇴</span>
              <span>{t("license.dominicanRepublic")}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("license.class")}</label>
            <select
              value={licenseClass}
              onChange={(e) => setLicenseClass(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
            >
              <option value="">—</option>
              <option value="Ligero">Ligero</option>
              <option value="Pesado">Pesado</option>
              <option value="Motocicleta">Motocicleta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Renewal Reminders */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {t("license.reminders.title")}
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
            <span className="text-sm text-foreground">{t("license.reminders.notify90")}</span>
            <input
              type="checkbox"
              checked={remind90}
              onChange={(e) => setRemind90(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring"
            />
          </label>
          <label className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
            <span className="text-sm text-foreground">{t("license.reminders.notify30")}</span>
            <input
              type="checkbox"
              checked={remind30}
              onChange={(e) => setRemind30(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring"
            />
          </label>
          <label className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
            <span className="text-sm text-foreground">{t("license.reminders.notifyExpiry")}</span>
            <input
              type="checkbox"
              checked={remindExpiry}
              onChange={(e) => setRemindExpiry(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring"
            />
          </label>
        </div>

        <div className="border-t border-border pt-4">
          <label className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
            <div>
              <span className="text-sm text-foreground">{t("notifications.pushPrefs")}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{t("license.reminders.pushDescription")}</p>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring"
            />
          </label>
        </div>
      </div>


    </div>
  );
}
