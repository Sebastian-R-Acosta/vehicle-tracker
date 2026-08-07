"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";

export default function ConfirmServicePage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "done" | "already" | "error">("idle");
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/maintenance/${params.id}/acknowledge`, { method: "POST" });
      if (!res.ok) {
        setState("error");
        return;
      }
      const data = await res.json();
      setState(data.alreadyConfirmed ? "already" : "done");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div className="p-6 rounded-xl border border-border bg-card text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {state === "done" || state === "already" ? (
            <Check className="w-6 h-6 text-primary" aria-hidden="true" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-primary" aria-hidden="true" />
          )}
        </div>

        {state === "done" && <p className="text-foreground font-semibold">{t("workshop.confirmDone")}</p>}
        {state === "already" && <p className="text-foreground font-semibold">{t("workshop.confirmAlready")}</p>}
        {state === "error" && (
          <p className="text-destructive font-semibold" role="alert">
            {t("workshop.genericError")}
          </p>
        )}

        {state === "idle" && (
          <>
            <h1 className="text-lg font-bold text-foreground">{t("workshop.confirmTitle")}</h1>
            <p className="text-sm text-muted-foreground mt-1 mb-5">{t("workshop.confirmBody")}</p>
            <Button onClick={confirm} loading={busy}>
              {t("workshop.confirmButton")}
            </Button>
          </>
        )}

        {state !== "idle" && (
          <div className="mt-5">
            <Link href="/dashboard">
              <Button variant="outline">{t("common.goToHome")}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
