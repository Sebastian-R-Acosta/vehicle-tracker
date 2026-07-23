"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Key,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TransferPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [transferCode, setTransferCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchVehicles();
    }
  }, [session]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!selectedVehicle) return;
    
    setError("");
    setGenerating(true);

    try {
      const res = await fetch(`/api/vehicles/${selectedVehicle}/transfer`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setTransferCode(data);
      } else {
        setError(t("dashboard.transfer.failedGenerate"));
      }
    } catch (err) {
      setError(t("dashboard.transfer.somethingWentWrong"));
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8 text-foreground">{t("dashboard.transfer.heading")}</h1>

        <div className="grid gap-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary rounded-lg">
                <Key className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("dashboard.transfer.generateCode")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.transfer.generateDesc")}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("dashboard.transfer.selectVehicle")}
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => {
                    setSelectedVehicle(e.target.value);
                    setTransferCode(null);
                  }}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  disabled={!!transferCode}
                >
                  <option value="">{t("dashboard.transfer.chooseVehicle")}</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {transferCode ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                    {t("dashboard.transfer.codeGenerated")}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-mono font-bold tracking-wider text-foreground">
                      {transferCode.code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(transferCode.code)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCode}
                  disabled={!selectedVehicle || generating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {generating ? t("dashboard.transfer.generating") : t("dashboard.transfer.generateCodeButton")}
                </button>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-secondary rounded-lg">
                <Car className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("dashboard.transfer.claimVehicle")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.transfer.claimDesc")}
                </p>
              </div>
            </div>

            <ClaimForm />
          </div>
        </div>
      </main>
    </div>
  );
}

function ClaimForm() {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleClaim = async () => {
    if (!code) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/transfer/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        setSuccess(true);
        setCode("");
      } else {
        const data = await res.json();
        setError(data.message || t("dashboard.transfer.invalidCode"));
      }
    } catch (err) {
      setError(t("dashboard.transfer.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <p className="text-green-600 dark:text-green-400 font-medium">
          {t("dashboard.transfer.claimedSuccess")}
        </p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          {t("dashboard.transfer.inYourGarage")}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm text-green-700 dark:text-green-300 underline"
        >
          {t("dashboard.transfer.claimAnother")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t("dashboard.transfer.transferCode")}
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-mono text-lg tracking-wider"
          placeholder="XXXXXXXXXXXX"
          maxLength={12}
        />
      </div>

      <button
        onClick={handleClaim}
        disabled={!code || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {t("dashboard.transfer.claimButton")}
      </button>
    </div>
  );
}