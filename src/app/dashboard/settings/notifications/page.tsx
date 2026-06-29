"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, Bell } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";

interface NotifSettings {
  phone: string | null;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<NotifSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [phone, setPhone] = useState("");
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/notifications");
      if (res.ok) {
        const data: NotifSettings = await res.json();
        setSettings(data);
        setPhone(data.phone || "");
        setSmsNotifications(data.smsNotifications);
        setPushNotifications(data.pushNotifications);
      }
    } catch (err) {
      console.error("Failed to fetch notification settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone || null,
          smsNotifications,
          pushNotifications,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      setSuccess(true);
      fetchSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Link href="/dashboard/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> {t("dashboard.settings.notifications.backToSettings")}
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("dashboard.settings.notifications.heading")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("dashboard.settings.notifications.subtitle")}
        </p>

        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>
        )}

        {success && (
          <div className="mb-6 p-3 text-sm text-green-600 bg-green-500/10 rounded-lg">
            {t("dashboard.settings.notifications.savedSuccess")}
          </div>
        )}

        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.settings.notifications.contactInfo")}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.settings.notifications.phoneNumber")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.settings.notifications.phoneHelper")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.settings.notifications.channelsHeading")}</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-foreground">{t("dashboard.settings.notifications.smsNotifications")}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.settings.notifications.smsDescription")}</p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-foreground">{t("dashboard.settings.notifications.pushNotifications")}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.settings.notifications.pushDescription")}</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-input text-primary focus:ring-ring"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            {t("dashboard.settings.notifications.saveChanges")}
          </button>
        </div>
      </main>
    </div>
  );
}
