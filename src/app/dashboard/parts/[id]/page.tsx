"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Package, AlertTriangle, Trash2, Minus, Plus,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface VehicleRef {
  id: string;
  make: string;
  model: string;
  nickname: string | null;
}

interface Part {
  id: string;
  name: string;
  partNumber: string | null;
  category: string;
  quantity: number;
  minStock: number;
  unitCost: number | null;
  supplier: string | null;
  notes: string | null;
  vehicleId: string | null;
  vehicle: VehicleRef | null;
  organizationId: string;
}

const CATEGORIES = [
  "engine", "transmission", "brakes", "suspension", "electrical", "body",
  "interior", "tires", "filters", "fluids", "belts", "hoses", "lighting",
  "exhaust", "cooling", "other",
];

const partSchema = z.object({
  name: z.string().min(1).max(200),
  partNumber: z.string().max(100).optional(),
  category: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0),
  unitCost: z.coerce.number().min(0).optional(),
  supplier: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

type PartFormData = z.infer<typeof partSchema>;

export default function PartDetailPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchPart();
      fetchCategories();
    }
  }, [session, params.id]);

  const fetchPart = async () => {
    try {
      const res = await fetch(`/api/parts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPart(data);
        reset({
          name: data.name,
          partNumber: data.partNumber || "",
          category: data.category,
          quantity: data.quantity,
          minStock: data.minStock,
          unitCost: data.unitCost ?? undefined,
          supplier: data.supplier || "",
          notes: data.notes || "",
        });
      } else {
        router.push("/dashboard/parts");
      }
    } catch (err) {
      console.error("Failed to fetch part:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/parts/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const onSubmit = async (data: PartFormData) => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/parts/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || t("dashboard.parts.detail.failedUpdate"));
      }
      const updated = await res.json();
      setPart(updated);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || t("errors.generic"));
    } finally {
      setSaving(false);
    }
  };

  const handleStockAdjust = async (delta: number) => {
    if (!part) return;
    const newQty = Math.max(0, part.quantity + delta);
    try {
      const res = await fetch(`/api/parts/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...part, quantity: newQty }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPart(updated);
      }
    } catch (err) {
      console.error("Failed to adjust stock:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("dashboard.parts.detail.deleteConfirm"))) return;
    setDeleting(true);
    try {
      await fetch(`/api/parts/${params.id}`, { method: "DELETE" });
      router.push("/dashboard/parts");
    } catch (err) {
      console.error("Failed to delete part:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading" || loading || !part) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLowStock = part.quantity < part.minStock;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/parts"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{part.name}</h1>
              {isLowStock && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  <AlertTriangle className="w-3 h-3" />
                  {t("dashboard.parts.detail.lowStock")}
                </span>
              )}
            </div>
            {part.partNumber && (
              <p className="text-muted-foreground">{t("dashboard.parts.detail.partNumberLabel")}: {part.partNumber}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">{t("dashboard.parts.detail.currentStock")}</p>
            <p className={`text-3xl font-bold ${isLowStock ? "text-red-600" : "text-foreground"}`}>
              {part.quantity}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">{t("dashboard.parts.detail.minStock")}</p>
            <p className="text-3xl font-bold text-foreground">{part.minStock}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">{t("dashboard.parts.detail.category")}</p>
            <p className="text-lg font-bold text-foreground">
              {part.category.charAt(0).toUpperCase() + part.category.slice(1)}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">{t("dashboard.parts.detail.unitCost")}</p>
            <p className="text-lg font-bold text-foreground">
              {part.unitCost != null ? `$${part.unitCost.toFixed(2)}` : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8 p-4 bg-card rounded-lg border border-border">
          <span className="text-sm font-medium text-foreground">{t("dashboard.parts.detail.quickAdjust")}:</span>
          <button
            onClick={() => handleStockAdjust(-1)}
            disabled={part.quantity <= 0}
            className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStockAdjust(1)}
            className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {part.vehicle && (
          <div className="mb-8 p-4 bg-card rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">{t("dashboard.parts.detail.installedOnVehicle")}</p>
            <Link
              href={`/dashboard/vehicles/${part.vehicle.id}`}
              className="text-primary hover:underline font-medium"
            >
              {part.vehicle.nickname ||
                `${part.vehicle.make} ${part.vehicle.model}`}
            </Link>
          </div>
        )}

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">{t("dashboard.parts.detail.details")}</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-sm text-primary hover:underline"
              >
                {t("dashboard.parts.detail.edit")}
              </button>
            )}
          </div>

          {editMode ? (
            <>
              {error && (
                <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.parts.detail.name")} <span className="text-destructive">*</span>
                    </label>
                  <input
                    {...register("name")}
                    className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">{t("dashboard.parts.new.nameRequired")}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.parts.detail.partNumber")}
                    </label>
                    <input
                      {...register("partNumber")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.parts.detail.category")}
                    </label>
                    <select
                      {...register("category")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.parts.detail.quantity")}
                    </label>
                    <input
                      type="number"
                      {...register("quantity")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.parts.detail.minStock")}
                    </label>
                    <input
                      type="number"
                      {...register("minStock")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.parts.detail.unitCost")}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("unitCost")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.parts.detail.supplier")}
                    </label>
                    <input
                      {...register("supplier")}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t("dashboard.parts.detail.notes")}
                    </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t("dashboard.parts.detail.saveChanges")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setError("");
                      reset({
                        name: part.name,
                        partNumber: part.partNumber || "",
                        category: part.category,
                        quantity: part.quantity,
                        minStock: part.minStock,
                        unitCost: part.unitCost ?? undefined,
                        supplier: part.supplier || "",
                        notes: part.notes || "",
                      });
                    }}
                    className="px-4 py-3 border border-input text-foreground rounded-lg hover:bg-accent"
                  >
                    {t("dashboard.parts.detail.cancel")}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {part.supplier && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("dashboard.parts.detail.supplier")}</p>
                    <p className="text-foreground">{part.supplier}</p>
                  </div>
                )}
                {part.unitCost != null && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("dashboard.parts.detail.unitCost")}</p>
                    <p className="text-foreground">${part.unitCost.toFixed(2)}</p>
                  </div>
                )}
              </div>
              {part.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("dashboard.parts.detail.notes")}</p>
                  <p className="text-foreground whitespace-pre-wrap">{part.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
