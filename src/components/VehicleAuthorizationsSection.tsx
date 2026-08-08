"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, ShieldCheck, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";

interface Authorization {
  id: string;
  status: "pending" | "active";
  createdAt: string;
  organization: { id: string; name: string };
}

/**
 * Owner-facing counterpart to the workshop service desk: without this the workshop's
 * "ask the owner for access" message had nowhere to lead.
 */
export function VehicleAuthorizationsSection({ vehicleId }: { vehicleId: string }) {
  const { t } = useLanguage();
  const [items, setItems] = useState<Authorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/authorizations`);
      if (!res.ok) {
        // 404 just means the viewer is not allowed to manage access here.
        setItems([]);
        return;
      }
      setItems(await res.json());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (authId: string, decision: "approve" | "reject" | "revoke") => {
    setBusyId(authId);
    setError("");
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/authorizations/${authId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        setError(t("authorizations.actionFailed"));
        return;
      }
      await load();
    } catch {
      setError(t("authorizations.actionFailed"));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return null;

  return (
    <section className="p-5 rounded-xl border border-border bg-card">
      <h2 className="font-semibold text-foreground flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" aria-hidden="true" />
        {t("authorizations.heading")}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">{t("authorizations.subtitle")}</p>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">{t("authorizations.none")}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border"
            >
              <div>
                <p className="font-medium text-foreground">{a.organization.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={
                      a.status === "active"
                        ? "text-green-700 dark:text-green-400"
                        : "text-amber-700 dark:text-amber-400"
                    }
                  >
                    {a.status === "active" ? t("authorizations.active") : t("authorizations.pending")}
                  </span>
                  {" · "}
                  {t("authorizations.requestedOn", {
                    date: new Date(a.createdAt).toLocaleDateString(),
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {busyId === a.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-hidden="true" />
                ) : a.status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => decide(a.id, "approve")}>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      {t("authorizations.approve")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => decide(a.id, "reject")}>
                      <X className="w-4 h-4" aria-hidden="true" />
                      {t("authorizations.reject")}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => decide(a.id, "revoke")}>
                    {t("authorizations.revoke")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
