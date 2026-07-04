"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Wrench, Upload, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const maintenanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  serviceType: z.string().min(1, "Service type is required"),
  mileage: z.number().min(0, "Mileage must be positive"),
  notes: z.string().optional(),
  cost: z.number().optional(),
  imageUrl: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

const serviceTypeValues = [
  "Oil Change", "Tire Rotation", "Brake Service", "Air Filter",
  "Transmission Service", "Battery Replacement", "Inspection", "Repair", "Other",
];

export default function EditMaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue: setFormValue,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id && params.recordId) {
      fetch(`/api/maintenance/${params.recordId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormValue("date", new Date(data.date).toISOString().split("T")[0]);
          setFormValue("serviceType", data.serviceType);
          setFormValue("mileage", data.mileage);
          setFormValue("notes", data.notes || "");
          setFormValue("cost", data.cost || undefined);
          setFormValue("imageUrl", data.imageUrl || "");
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          }
          setInitialLoading(false);
        })
        .catch(() => {
          router.push(`/dashboard/vehicles/${params.id}`);
        });
    }
  }, [session, params.id, params.recordId, setFormValue, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("dashboard.maintenanceEdit.selectImage"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("dashboard.maintenanceEdit.imageTooLarge"));
      return;
    }

    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: base64,
              filename: file.name,
              contentType: file.type,
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Upload failed: ${res.status} - ${errText}`);
          }

          const data = await res.json();
          setImagePreview(data.imageUrl);
          setImageKey(data.key);
          setFormValue("imageUrl", data.imageUrl);
        } catch (err) {
          setError(err instanceof Error ? err.message : t("dashboard.maintenanceEdit.failedUpload"));
          console.error("Upload error:", err);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError(t("dashboard.maintenanceEdit.failedRead"));
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(t("dashboard.maintenanceEdit.failedUpload"));
      console.error(err);
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageKey(null);
    setFormValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: MaintenanceFormData) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/maintenance/${params.recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(t("dashboard.maintenanceEdit.failedUpdate"));
      }

      router.push(`/dashboard/vehicles/${params.id}`);
    } catch (err) {
      setError(t("dashboard.maintenanceEdit.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance/${params.recordId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push(`/dashboard/vehicles/${params.id}`);
      }
    } catch (err) {
      setError(t("dashboard.maintenanceEdit.failedDelete"));
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href={`/dashboard/vehicles/${params.id}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary rounded-lg">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">{t("dashboard.maintenanceEdit.heading")}</h1>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("maintenance.date")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t("maintenance.mileage")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  {...register("mileage", { valueAsNumber: true })}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder={t("dashboard.maintenanceEdit.costPlaceholder")}
                />
                {errors.mileage && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.mileage.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.maintenanceEdit.serviceType")} <span className="text-destructive">*</span>
              </label>
              <select
                {...register("serviceType")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              >
                <option value="">{t("dashboard.maintenanceEdit.selectServiceType")}</option>
                {serviceTypeValues.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.serviceType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.maintenanceEdit.invoiceImage")}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt={t("maintenance.image")}
                    className="w-full max-h-64 object-contain rounded-lg border border-border bg-background"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {t("dashboard.maintenanceEdit.clickToUpload")}
                      </span>
                    </>
                  )}
                </button>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {t("dashboard.maintenanceEdit.fileFormats")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.maintenanceEdit.notes")}
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder={t("dashboard.maintenanceEdit.notesPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.maintenanceEdit.cost")}
              </label>
              <input
                type="number"
                step="0.01"
                {...register("cost", { valueAsNumber: true })}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder={t("dashboard.maintenanceEdit.costPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("dashboard.maintenanceEdit.saveChanges")}
            </button>
          </form>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 border border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">{t("dashboard.maintenanceEdit.deleteRecord")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("dashboard.maintenanceEdit.deleteConfirm")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-accent"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
