"use client";

import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";

export default function ClaimSuperAdminButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const claim = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/claim-super-admin", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to claim");
      }
      window.location.reload();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={claim}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        {loading ? "Claiming..." : "Claim Super Admin"}
      </button>
      {error && <p className="text-xs text-red-500 mt-1" role="alert">{error}</p>}
    </div>
  );
}
