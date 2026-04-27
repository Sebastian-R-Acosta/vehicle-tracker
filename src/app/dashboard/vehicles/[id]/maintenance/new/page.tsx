"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Wrench, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

const maintenanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  serviceType: z.string().min(1, "Service type is required"),
  mileage: z.number().min(0, "Mileage must be positive"),
  notes: z.string().optional(),
  cost: z.number().optional(),
  imageUrl: z.string().optional(),
  setReminder: z.boolean().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

const serviceTypes = [
  "Oil Change",
  "Tire Rotation",
  "Brake Service",
  "Air Filter",
  "Transmission Service",
  "Battery Replacement",
  "Inspection",
  "Repair",
  "Other",
];

export default function NewMaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [currentMileage, setCurrentMileage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
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
          setError(err instanceof Error ? err.message : "Failed to upload image");
          console.error("Upload error:", err);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read file");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload image");
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
      setError("Something went wrong");
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
                Back
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
            <h1 className="text-xl font-semibold text-foreground">Add Maintenance Record</h1>
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
                  Date <span className="text-destructive">*</span>
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
                  Mileage <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  {...register("mileage", { valueAsNumber: true })}
                  className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  placeholder="0"
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
                Service Type <span className="text-destructive">*</span>
              </label>
              <select
                {...register("serviceType")}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              >
                <option value="">Select service type</option>
                {serviceTypes.map((type) => (
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
                Invoice Image (optional)
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
                    alt="Invoice preview"
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
                        Click to upload invoice image
                      </span>
                    </>
                  )}
                </button>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, or WEBP up to 5MB
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Notes (optional)
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder="Any additional details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Cost (optional)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("cost", { valueAsNumber: true })}
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder="0.00"
              />
            </div>

            {selectedServiceType && selectedServiceType !== "Other" && selectedServiceType !== "Repair" && (
              <div className="p-4 bg-accent rounded-lg border border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("setReminder")}
                    defaultChecked
                    className="w-5 h-5 rounded border-input text-primary focus:ring-ring"
                  />
                  <div>
                    <span className="font-medium text-foreground">Set automatic reminder</span>
                    <p className="text-sm text-muted-foreground">
                      A reminder for the next {selectedServiceType} will be created based on expert recommendations.
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
              Add Record
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}