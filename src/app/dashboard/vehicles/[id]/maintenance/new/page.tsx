"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Wrench, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NewMaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [currentMileage, setCurrentMileage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceTypes = t("dashboard.maintenanceNew.serviceTypes") as string[];
  const otherServiceType = serviceTypes[serviceTypes.length - 1];
  const repairServiceType = serviceTypes[serviceTypes.length - 2];

  const maintenanceSchema = z.object({
    date: z.string().min(1, t("dashboard.maintenanceNew.dateRequired")),
    serviceType: z.string().min(1, t("dashboard.maintenanceNew.serviceTypeRequired")),
    mileage: z.number().min(0, t("dashboard.maintenanceNew.mileagePositive")),
    notes: z.string().optional(),
    cost: z.number().optional(),
    imageUrl: z.string().optional(),
    setReminder: z.boolean().optional(),
  });

  type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const useFormMethods = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      setReminder: true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue: setFormValue,
    watch,
    formState: { errors },
  } = useFormMethods;

  const selectedServiceType = watch("serviceType");

  useEffect(() => {
    fetch(`/api/vehicles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.currentMileage !== undefined) {
          setCurrentMileage(data.currentMileage);
          setFormValue("mileage", data.currentMileage);
        }
      })
      .catch(console.error);
  }, [params.id, setFormValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("dashboard.maintenanceNew.selectImage"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("dashboard.maintenanceNew.imageTooLarge"));
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
          setError(err instanceof Error ? err.message : t("dashboard.maintenanceNew.failedToUpload"));
          console.error("Upload error:", err);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError(t("dashboard.maintenanceNew.failedToRead"));
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(t("dashboard.maintenanceNew.failedToUpload"));
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
      const res = await fetch(`/api/vehicles/${params.id}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to create record");
      }

      router.push(`/dashboard/vehicles/${params.id}`);
    } catch (err) {
      setError(t("dashboard.maintenanceNew.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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
                {t("dashboard.maintenanceNew.back")}
              </Link>
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
            <h1 className="text-xl font-semibold text-foreground">{t("dashboard.maintenanceNew.heading")}</h1>
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
                  {t("dashboard.maintenanceNew.date")} <span className="text-destructive">*</span>
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
                  {t("dashboard.maintenanceNew.mileage")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  {...register("mileage", { valueAsNumber: true })}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder={t("dashboard.maintenanceNew.mileagePlaceholder")}
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
                {t("dashboard.maintenanceNew.serviceType")} <span className="text-destructive">*</span>
              </label>
              <select
                {...register("serviceType")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              >
                <option value="">{t("dashboard.maintenanceNew.selectServiceType")}</option>
                {serviceTypes.map((type: string) => (
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
                {t("dashboard.maintenanceNew.invoiceImage")}
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
                  <img
                    src={imagePreview}
                    alt={t("dashboard.maintenanceNew.invoicePreview")}
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
                        {t("dashboard.maintenanceNew.uploadInvoice")}
                      </span>
                    </>
                  )}
                </button>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {t("dashboard.maintenanceNew.fileFormats")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.maintenanceNew.notes")}
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder={t("dashboard.maintenanceNew.notesPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("dashboard.maintenanceNew.cost")}
              </label>
              <input
                type="number"
                step="0.01"
                {...register("cost", { valueAsNumber: true })}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder={t("dashboard.maintenanceNew.costPlaceholder")}
              />
            </div>

            {selectedServiceType && selectedServiceType !== otherServiceType && selectedServiceType !== repairServiceType && (
              <div className="p-4 bg-accent rounded-lg border border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("setReminder")}
                    defaultChecked
                    className="w-5 h-5 rounded border-input text-primary focus:ring-ring"
                  />
                  <div>
                    <span className="font-medium text-foreground">{t("dashboard.maintenanceNew.setReminder")}</span>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard.maintenanceNew.reminderDescription", { type: selectedServiceType })}
                    </p>
                  </div>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("dashboard.maintenanceNew.addRecord")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
