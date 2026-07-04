"use client";

import { useState } from "react";
import { Shield, ShieldOff, Loader2 } from "lucide-react";

interface Props {
  userId: string;
  currentRole: string;
  isSuperAdmin: boolean;
  onRoleChanged?: () => void;
}

export default function AdminUserActions({ userId, currentRole, isSuperAdmin, onRoleChanged }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(currentRole);

  if (isSuperAdmin) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40">
        <Shield className="w-3 h-3" />
        super admin
      </span>
    );
  }

  const toggleRole = async () => {
    setLoading(true);
    setError("");
    const newRole = role === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      setRole(newRole);
      onRoleChanged?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleRole}
        disabled={loading}
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
          role === "admin"
            ? "text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/40 dark:hover:bg-red-950/60"
            : "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/40 dark:hover:bg-blue-950/60"
        }`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : role === "admin" ? (
          <ShieldOff className="w-3 h-3" />
        ) : (
          <Shield className="w-3 h-3" />
        )}
        {role === "admin" ? "Remove Admin" : "Make Admin"}
      </button>
      {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
    </div>
  );
}
