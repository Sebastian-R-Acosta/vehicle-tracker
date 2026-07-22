"use client";

import { useState, useCallback, useEffect } from "react";
import { FolderOpen, Upload, Loader2, Trash2, ExternalLink, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useFetch } from "@/lib/queries";
import { SectionLoader, SectionError, SectionEmpty } from "@/components/ui/SectionStates";
import toast from "react-hot-toast";

interface VehicleDocument {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  signedUrl: string | null;
  fileSize: number | null;
  expiryDate: string | null;
  notes: string | null;
  createdAt: string;
}

interface Props {
  vehicleId: string;
  isPro: boolean;
}

const typeColors: Record<string, string> = {
  registration: "bg-blue-500",
  insurance: "bg-emerald-500",
  warranty: "bg-purple-500",
  inspection: "bg-amber-500",
  receipt: "bg-slate-500",
  other: "bg-gray-500",
};

export function VehicleDocumentsSection({ vehicleId, isPro }: Props) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState("other");
  const [docExpiry, setDocExpiry] = useState("");
  const [docError, setDocError] = useState("");

  const fetchDocs = useCallback(async () => {
    const res = await fetch(`/api/vehicles/${vehicleId}/documents`);
    if (!res.ok) throw new Error("Failed to load documents");
    return res.json();
  }, [vehicleId]);

  const { data: documents = [], isLoading, error, refetch } = useFetch<VehicleDocument[]>(
    ["vehicle-docs", vehicleId],
    `/api/vehicles/${vehicleId}/documents`,
    { enabled: !!vehicleId }
  );

  const handleUpload = async () => {
    if (!docFile || !isPro) return;
    setDocError("");

    if (docFile.size > 10 * 1024 * 1024) {
      setDocError(t("dashboard.vehicleDetail.fileTooLarge"));
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(docFile);
      });

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64.split(",")[1],
          filename: docFile.name,
          contentType: docFile.type,
        }),
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { imageUrl } = await uploadRes.json();
      const docRes = await fetch(`/api/vehicles/${vehicleId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: docName || docFile.name,
          type: docCategory,
          fileUrl: imageUrl,
          fileSize: docFile.size,
          expiryDate: docExpiry || null,
        }),
      });

      if (!docRes.ok) throw new Error("Failed to save");

      toast.success(t("dashboard.vehicleDetail.documentUploaded"));
      setShowForm(false);
      setDocFile(null);
      setDocName("");
      refetch();
    } catch (err: any) {
      setDocError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("dashboard.vehicleDetail.documentDeleted"));
        refetch();
      }
    } catch {
      toast.error(t("dashboard.vehicleDetail.failedDeleteDocument"));
    }
  };

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <SectionError
          title={t("dashboard.vehicleDetail.digitalGlovebox")}
          message={t("dashboard.vehicleDetail.failedLoadDocuments")}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          {t("dashboard.vehicleDetail.digitalGlovebox")}
        </h2>
        {isPro && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm"
          >
            <Upload className="w-4 h-4" />
            {t("common.upload")}
          </button>
        )}
      </div>

      {isLoading ? (
        <SectionLoader message={t("common.loading")} />
      ) : documents.length === 0 ? (
        <SectionEmpty
          icon={FolderOpen}
          message={t("dashboard.vehicleDetail.noDocuments")}
          action={
            isPro ? (
              <button onClick={() => setShowForm(true)} className="text-sm text-primary hover:underline">
                {t("common.upload")}
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((doc) => {
            const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
            return (
              <div
                key={doc.id}
                className={`p-4 rounded-lg border ${isExpired ? "border-red-200 bg-red-50/50" : "border-border bg-background"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${typeColors[doc.type] || typeColors.other}`} />
                    <div>
                      <p className="font-medium text-foreground text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {doc.expiryDate && (
                  <p className={`text-xs mt-2 ${isExpired ? "text-red-600" : "text-muted-foreground"}`}>
                    {isExpired ? t("dashboard.vehicleDetail.expired") : t("dashboard.vehicleDetail.expires")} {new Date(doc.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full border border-border">
            <h3 className="text-lg font-semibold mb-4">{t("dashboard.vehicleDetail.uploadDocument")}</h3>
            <div className="space-y-4">
              <input
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <input
                type="text"
                placeholder={t("dashboard.vehicleDetail.documentName")}
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="registration">{t("dashboard.vehicleDetail.docCategories.registration")}</option>
                <option value="insurance">{t("dashboard.vehicleDetail.docCategories.insurance")}</option>
                <option value="warranty">{t("dashboard.vehicleDetail.docCategories.warranty")}</option>
                <option value="inspection">{t("dashboard.vehicleDetail.docCategories.inspection")}</option>
                <option value="receipt">{t("dashboard.vehicleDetail.docCategories.receipt")}</option>
                <option value="other">{t("dashboard.vehicleDetail.docCategories.other")}</option>
              </select>
              <input
                type="date"
                placeholder={t("dashboard.vehicleDetail.expiryDate")}
                value={docExpiry}
                onChange={(e) => setDocExpiry(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              {docError && <p className="text-sm text-destructive">{docError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={!docFile || uploading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {uploading ? t("dashboard.vehicleDetail.uploading") : t("common.upload")}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
