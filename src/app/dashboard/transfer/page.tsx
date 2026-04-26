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

export default function TransferPage() {
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
        setError("Failed to generate transfer code");
      }
    } catch (err) {
      setError("Something went wrong");
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Transfer Vehicle</h1>

        <div className="grid gap-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Generate Transfer Code</h2>
                <p className="text-sm text-gray-500">
                  Create a code to transfer ownership
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Vehicle
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => {
                    setSelectedVehicle(e.target.value);
                    setTransferCode(null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  disabled={!!transferCode}
                >
                  <option value="">Choose a vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {transferCode ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 mb-2">
                    Transfer code generated (valid for 24 hours):
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-mono font-bold tracking-wider">
                      {transferCode.code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(transferCode.code)}
                      className="p-2 text-gray-500 hover:text-gray-700"
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Code
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-600 rounded-lg">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Claim Vehicle</h2>
                <p className="text-sm text-gray-500">
                  Enter a code to claim a vehicle
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
        setError(data.message || "Invalid code");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-600 font-medium">
          Vehicle claimed successfully!
        </p>
        <p className="text-sm text-green-600 mt-1">
          The vehicle is now in your garage.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm text-green-700 underline"
        >
          Claim another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transfer Code
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono text-lg tracking-wider"
          placeholder="XXXXXXXX"
          maxLength={8}
        />
      </div>

      <button
        onClick={handleClaim}
        disabled={!code || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Claim Vehicle
      </button>
    </div>
  );
}