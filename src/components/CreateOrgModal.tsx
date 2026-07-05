"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Building2, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import toast from "react-hot-toast";
import { INDUSTRIES, IndustryType } from "@/lib/industry-labels";

interface CreateOrgModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateOrgModal({ open, onClose, onCreated }: CreateOrgModalProps) {
  const { t } = useLanguage();
  const { update } = useSession();

  const [checking, setChecking] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [industryType, setIndustryType] = useState<IndustryType>("construction");

  useEffect(() => {
    if (!open) return;
    setChecking(true);
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((data) => {
        setIsPro(data.tier === "pro" || data.tier === "business");
      })
      .catch(() => setIsPro(false))
      .finally(() => setChecking(false));
  }, [open]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!nameManuallyEdited) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSlugChange = (val: string) => {
    setNameManuallyEdited(true);
    setSlug(val);
  };

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), industryType }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      const org = await res.json();
      await update({ currentOrganizationId: org.id });
      toast.success(t("common.orgCreateSuccess"));
      onCreated();
      onClose();
      setName("");
      setSlug("");
      setNameManuallyEdited(false);
    } catch (e: any) {
      toast.error(e.message || t("errors.generic"));
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{t("common.createOrganization")}</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {checking ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : isPro ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("common.orgName")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Taller El Chapín"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("common.orgSlug")}</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring font-mono text-sm"
                  placeholder="taller-el-chapin"
                />
                <p className="text-xs text-muted-foreground mt-1">bitacora.app/{slug || "..."}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Industry Type</label>
                <select
                  value={industryType}
                  onChange={(e) => setIndustryType(e.target.value as IndustryType)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{t("common.orgUpgradeRequired")}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t("common.orgUpgradeDesc")}</p>
              <Link
                href="/pricing"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}
        </div>

        {!checking && isPro && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || !slug.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              {t("common.create")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
