"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Car,
  ArrowLeft,
  Plus,
  Wrench,
  Clock,
  Bell,
  Download,
  Share2,
  Loader2,
  Pencil,
  Trash2,
  Image,
  X,
  AlertTriangle,
  FileText,
  FolderOpen,
  Upload,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
} from "lucide-react";
import { useFetch } from "@/lib/queries";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

interface MaintenanceRecord {
  id: string;
  date: string;
  serviceType: string;
  mileage: number;
  notes: string | null;
  imageUrl: string | null;
  cost: number | null;
}

interface Reminder {
  id: string;
  title: string;
  dueDate: string | null;
  dueMileage: number | null;
  dueHours: number | null;
}

interface Recall {
  nhtsaCampaignNumber: string;
  component: string;
  summary: string;
  reportReceivedDate: string;
  manufacturer: string;
  safetyRisk: string | null;
  remedy: string | null;
}

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

interface DriverAssignment {
  id: string;
  driverId: string;
  startDate: string;
  endDate: string | null;
  isPrimary: boolean;
  driver: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vin: string | null;
  licensePlate: string | null;
  currentMileage: number;
  vehicleType: string;
  hoursMeter: number | null;
  serialNumber: string | null;
  equipmentStatus: string | null;
  maintenanceRecords: MaintenanceRecord[];
  reminders: Reminder[];
}

interface ValueReport {
  estimatedValue: number;
  valueRange: { low: number; high: number };
  marketRating: string;
  depreciation: { annualRate: number; age: number; milesDiscount: number };
  maintenance: { totalRecords: number; bonus: number; lastServiceDate: string | null; lastServiceType: string | null };
  factors: { name: string; impact: string; detail: string }[];
}

const constructionTypes = new Set(["excavator", "bulldozer", "dump_truck", "crane", "loader", "grader"]);

export default function VehicleDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [recallsLoading, setRecallsLoading] = useState(false);
  const [recallsError, setRecallsError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [valueReport, setValueReport] = useState<ValueReport | null>(null);
  const [valueReportLoading, setValueReportLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
  const [showDocForm, setShowDocForm] = useState(false);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState("other");
  const [docExpiry, setDocExpiry] = useState("");
  const [docNotes, setDocNotes] = useState("");
  const [docError, setDocError] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [viewingDoc, setViewingDoc] = useState<VehicleDocument | null>(null);

  const vehicleId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: vehicle, isLoading } = useFetch<Vehicle>(
    ["vehicle", vehicleId],
    `/api/vehicles/${vehicleId}`,
    { enabled: status === "authenticated" && !!vehicleId }
  );

  const fetchRecalls = useCallback(async () => {
    if (!vehicle?.vin) return;
    setRecallsLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}/recalls`);
      if (res.ok) {
        const data = await res.json();
        setRecalls(data.recalls || []);
        setRecallsError(data.error);
      }
    } catch (err) {
      setRecallsError(t("errors.generic"));
    } finally {
      setRecallsLoading(false);
    }
  }, [vehicle?.id, vehicle?.vin]);

  const fetchDocuments = useCallback(async () => {
    if (!vehicle?.id) return;
    setDocumentsLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}/documents`);
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setDocumentsLoading(false);
    }
  }, [vehicle?.id]);

  useEffect(() => {
    if (vehicle && vehicle.vin) {
      fetchRecalls();
    }
  }, [vehicle, vehicle?.vin, fetchRecalls]);

  useEffect(() => {
    if (vehicle) {
      fetchDocuments();
    }
  }, [vehicle, fetchDocuments]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (!isLoading && !vehicle) {
    router.push("/dashboard");
    return null;
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/vehicles/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(t("dashboard.vehicleDetail.vehicleDeleted"));
        router.push("/dashboard");
      } else {
        toast.error(t("dashboard.vehicleDetail.failedDeleteVehicle"));
      }
    } catch (err) {
      toast.error(t("dashboard.vehicleDetail.failedDeleteVehicle"));
    }
  };

  const serviceTypes = [
    "Oil Change", "Tire Rotation", "Brake Service", "Air Filter",
    "Transmission Service", "Battery Replacement", "Inspection", "Repair", "Other",
  ];

  const getNextDueDate = (lastDate: string | null, mileage: number, serviceType: string): { date: string | null; mileage: number } => {
    const lastServiceDate = lastDate ? new Date(lastDate) : null;
    const intervals: { [key: string]: { months: number; miles: number } } = {
      "Oil Change": { months: 3, miles: 5000 },
      "Tire Rotation": { months: 6, miles: 7500 },
      "Brake Service": { months: 12, miles: 15000 },
      "Air Filter": { months: 12, miles: 15000 },
      "Transmission Service": { months: 24, miles: 30000 },
      "Battery Replacement": { months: 48, miles: 50000 },
      "Inspection": { months: 12, miles: 12000 },
      "Repair": { months: 0, miles: 0 },
      "Other": { months: 0, miles: 0 },
    };
    const interval = intervals[serviceType] || { months: 0, miles: 0 };
    let nextDate: string | null = null;
    let nextMileage = mileage;
    if (lastServiceDate && interval.months > 0) {
      const dueDate = new Date(lastServiceDate);
      dueDate.setMonth(dueDate.getMonth() + interval.months);
      nextDate = dueDate.toISOString().split("T")[0];
    }
    if (interval.miles > 0) {
      nextMileage = mileage + interval.miles;
    }
    return { date: nextDate, mileage: nextMileage };
  };

  const addToWallet = async (doc: VehicleDocument) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/documents/${doc.id}/pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "apple" }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || t("dashboard.vehicleDetail.walletNotConfigured"));
        return;
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("pkpass")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${doc.name.replace(/[^a-zA-Z0-9]/g, "_")}.pkpass`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(t("dashboard.vehicleDetail.addedToWallet"));
      } else {
        const data = await res.json();
        if (data.saveUrl) {
          window.open(data.saveUrl, "_blank");
        }
      }
    } catch {
      toast.error(t("dashboard.vehicleDetail.couldNotAddWallet"));
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/report`);
      if (res.ok) {
        const data = await res.json();
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;

        const logoUrl = "/logo-icon.png";
        try {
          doc.addImage(logoUrl, "SVG", margin, 10, 50, 15);
        } catch (e) {}

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(t("dashboard.vehicleDetail.vehicleHistoryReport"), pageWidth - margin, 18, { align: "right" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`, pageWidth - margin, 26, { align: "right" });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, 35, pageWidth - margin, 35);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(t("dashboard.vehicleDetail.vehicleInformation"), margin, 48);

        const startY = 58;
        const rowHeight = 16;
        const rows = [
          [{ label: t("vehicle.make"), value: data.vehicle.make }, { label: t("vehicle.model"), value: data.vehicle.model }],
          [{ label: t("vehicle.year"), value: String(data.vehicle.year) }, { label: t("vehicle.mileage"), value: `${data.vehicle.currentMileage.toLocaleString()} ${t("dashboard.reminders.miles")}` }],
          [{ label: t("vehicle.vin"), value: data.vehicle.vin || t("dashboard.vehicleDetail.notProvided") }, null],
        ];

        rows.forEach((row, rowIndex) => {
          const y = startY + rowIndex * rowHeight;
          row.forEach((cell, colIndex) => {
            if (!cell) return;
            const x = colIndex === 0 ? margin : margin + 95;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(cell.label + ":", x, y);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            doc.text(cell.value, x + 35, y);
          });
        });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(t("dashboard.vehicleDetail.maintenanceSummary"), margin, 110);

        const colWidth = contentWidth / 4;
        const headerY = 115;

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, headerY, contentWidth, 10, "F");

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(t("dashboard.vehicleDetail.pdfServiceType"), margin + 5, headerY + 7);
        doc.text(t("dashboard.vehicleDetail.pdfCount"), margin + colWidth + 5, headerY + 7);
        doc.text(t("dashboard.vehicleDetail.pdfLastService"), margin + colWidth * 2 + 5, headerY + 7);
        doc.text(t("dashboard.vehicleDetail.pdfNextDue"), margin + colWidth * 3 + 5, headerY + 7);

        const maintenanceByType: { [key: string]: any[] } = {};
        data.maintenanceHistory.forEach((record: any) => {
          if (!maintenanceByType[record.serviceType]) maintenanceByType[record.serviceType] = [];
          maintenanceByType[record.serviceType].push(record);
        });

        let ySummary = headerY + 10;

        serviceTypes.forEach((serviceType) => {
          if (ySummary > 250) {
            doc.addPage();
            ySummary = 25;
          }

          const records = maintenanceByType[serviceType] || [];
          const count = records.length;
          const lastRecord = records[0];

          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(margin, ySummary + 14, margin + contentWidth, ySummary + 14);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.text(serviceType, margin + 5, ySummary + 10);

          doc.setTextColor(37, 99, 235);
          doc.text(count > 0 ? String(count) : "\u2014", margin + colWidth + 5, ySummary + 10);

          if (lastRecord) {
            doc.setTextColor(71, 85, 105);
            doc.text(new Date(lastRecord.date).toLocaleDateString(), margin + colWidth * 2 + 5, ySummary + 10);

            const { date: nextDate, mileage: nextMileage } = getNextDueDate(lastRecord.date, lastRecord.mileage, serviceType);
            let nextDue = "\u2014";
            if (nextDate) nextDue = new Date(nextDate).toLocaleDateString();
            else if (serviceType !== "Repair" && serviceType !== "Other") nextDue = `${nextMileage.toLocaleString()} ${t("dashboard.reminders.miles")}`;
            doc.setTextColor(22, 163, 74);
            doc.text(nextDue, margin + colWidth * 3 + 5, ySummary + 10);
          } else {
            doc.setTextColor(148, 163, 184);
            doc.text(t("dashboard.vehicleDetail.neverLogged"), margin + colWidth * 2 + 5, ySummary + 10);
            doc.setTextColor(239, 68, 68);
            doc.text("\u2014", margin + colWidth * 3 + 5, ySummary + 10);
          }

          ySummary += 14;
        });

        const footerY = 285;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(t("dashboard.vehicleDetail.pdfFooter"), pageWidth / 2, footerY, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(t("dashboard.vehicleDetail.pdfConfidential"), pageWidth / 2, footerY + 6, { align: "center" });
        doc.text(`${t("dashboard.vehicleDetail.reportGenerated")} ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 12, { align: "center" });

        doc.save(`vehicle-report-${data.vehicle.make}-${data.vehicle.model}.pdf`);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const fetchValueReport = async () => {
    setValueReportLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/value-report`);
      if (res.ok) {
        setValueReport(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch value report:", err);
    } finally {
      setValueReportLoading(false);
    }
  };

  const handleDocUpload = async () => {
    if (!docFile) return;

    setDocError("");

    if (docFile.size > 10 * 1024 * 1024) {
      setDocError(t("dashboard.vehicleDetail.fileTooLarge"));
      return;
    }

    setUploadingDoc(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(docFile);
      });

      const base64Data = base64.split(",")[1];

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          filename: docFile.name,
          contentType: docFile.type,
        }),
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(text || "Upload failed");
      }

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
          notes: docNotes || null,
        }),
      });

      if (!docRes.ok) throw new Error("Failed to save document metadata");

      if (docRes.ok) {
        const newDoc = await docRes.json();
        setDocuments((prev) => [newDoc, ...prev]);
        setShowDocForm(false);
        setDocFile(null);
        setDocName("");
        setDocCategory("other");
        setDocExpiry("");
        setDocNotes("");
        toast.success(t("dashboard.vehicleDetail.documentUploaded"));
      }
    } catch (err: any) {
      setDocError(err.message || t("dashboard.vehicleDetail.uploadFailed"));
      console.error("Failed to upload document:", err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        toast.success(t("dashboard.vehicleDetail.documentDeleted"));
      }
    } catch (err) {
      toast.error(t("dashboard.vehicleDetail.failedDeleteDocument"));
    }
  };

  if (status === "loading" || isLoading || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const lastMaintenance = vehicle.maintenanceRecords[0];
  const isConstruction = constructionTypes.has(vehicle.vehicleType);

  const ImpactIcon = ({ impact }: { impact: string }) => {
    if (impact === "positive") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (impact === "negative") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generateReport}
                disabled={generatingReport}
                className="flex items-center gap-2 px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg disabled:opacity-50"
              >
                {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {generatingReport ? t("dashboard.vehicleDetail.generating") : t("dashboard.vehicleDetail.report")}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-3 py-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1 text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  {vehicle.nickname && <p className="text-muted-foreground">{vehicle.nickname}</p>}
                </div>
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/edit`}
                  className="p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {isConstruction ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("dashboard.vehicleDetail.hoursMeter")}</p>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.hoursMeter != null ? `${vehicle.hoursMeter.toLocaleString()} ${t("dashboard.reminders.hrs")}` : t("dashboard.vehicleDetail.notSet")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("dashboard.vehicleDetail.serialNumber")}</p>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.serialNumber || t("dashboard.vehicleDetail.notProvided")}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("dashboard.vehicleDetail.currentMileage")}</p>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.currentMileage.toLocaleString()} {t("dashboard.reminders.miles")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("vehicle.vin")}</p>
                      <p className="text-lg font-semibold text-foreground font-mono">
                        {vehicle.vin || t("dashboard.vehicleDetail.notProvided")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("vehicle.licensePlate")}</p>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.licensePlate || t("dashboard.vehicleDetail.notProvided")}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">{t("dashboard.vehicleDetail.lastService")}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {lastMaintenance ? (
                      <>
                        {new Date(lastMaintenance.date).toLocaleDateString()}
                        <br />
                        <span className="text-sm font-normal text-muted-foreground">
                          {lastMaintenance.serviceType}
                        </span>
                      </>
                    ) : (
                      t("dashboard.vehicleDetail.noRecords")
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">{t("dashboard.vehicleDetail.maintenanceHistory")}</h2>
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/maintenance/new`}
                  className="flex items-center gap-2 px-3 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  {t("dashboard.vehicleDetail.addRecord")}
                </Link>
              </div>

              {vehicle.maintenanceRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("dashboard.vehicleDetail.noMaintenanceRecords")}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {vehicle.maintenanceRecords.map((record) => (
                    <div key={record.id} className="p-6 flex items-start justify-between hover:bg-accent">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-secondary rounded-lg">
                          <Wrench className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{record.serviceType}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()} {t("dashboard.vehicleDetail.at")} {record.mileage.toLocaleString()} {t("dashboard.reminders.miles")}
                          </p>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                          )}
                          {record.imageUrl && (
                            <button
                              onClick={() => setSelectedImage(record.imageUrl)}
                              className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <Image className="w-4 h-4" />
                              {t("dashboard.vehicleDetail.viewInvoice")}
                            </button>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/vehicles/${vehicle.id}/maintenance/${record.id}/edit`}
                        className="p-3 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {vehicle.vin && (
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    {t("dashboard.vehicleDetail.recallAlerts")}
                  </h2>
                  {recallsLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>

                {recallsError && (
                  <p className="text-sm text-muted-foreground">{recallsError}</p>
                )}

                {!recallsLoading && !recallsError && recalls.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm text-green-600 font-medium">{t("dashboard.vehicleDetail.noOpenRecalls")}</span>
                  </div>
                )}

                {recalls.length > 0 && (
                  <div className="space-y-3">
                    {recalls.map((recall) => (
                      <div key={recall.nhtsaCampaignNumber} className="p-4 bg-red-500/5 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">{recall.component}</p>
                            <p className="text-sm text-muted-foreground mt-1">{recall.summary}</p>
                            {recall.remedy && (
                              <p className="text-sm text-green-600 mt-2">
                                {t("dashboard.vehicleDetail.remedy")} {recall.remedy}
                              </p>
                            )}
                            {recall.safetyRisk && (
                              <p className="text-sm text-red-600 mt-1">
                                {t("dashboard.vehicleDetail.risk")} {recall.safetyRisk}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {t("dashboard.vehicleDetail.reported")} {new Date(recall.reportReceivedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  {t("dashboard.vehicleDetail.digitalGlovebox")}
                </h2>
                <button
                  onClick={() => setShowDocForm(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {t("common.upload")}
                </button>
              </div>

              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {t("dashboard.vehicleDetail.noDocuments")}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {documents.map((doc, idx) => {
                    const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                    const expiresSoon = doc.expiryDate && !isExpired && new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    const cardColors: Record<string, { gradient: string; }> = {
                      registration: { gradient: "from-blue-500 via-blue-600 to-blue-700" },
                      insurance: { gradient: "from-emerald-500 via-emerald-600 to-emerald-700" },
                      warranty: { gradient: "from-violet-500 via-violet-600 to-violet-700" },
                      inspection: { gradient: "from-orange-500 via-orange-600 to-orange-700" },
                      receipt: { gradient: "from-rose-500 via-rose-600 to-rose-700" },
                      manual: { gradient: "from-slate-500 via-slate-600 to-slate-700" },
                    };
                    const colors = cardColors[doc.type] || { gradient: "from-gray-500 via-gray-600 to-gray-700" };
                    const docUrl = doc.signedUrl || `/api/vehicles/${vehicle.id}/documents/${doc.id}`;
                    return (
                      <div key={doc.id} className="group relative bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                        style={{ animationDelay: `${idx * 80}ms` }}
                        onClick={() => setViewingDoc(doc)}>
                        <div className={`relative h-48 bg-gradient-to-br ${colors.gradient}`}>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)] opacity-20" />
                          {doc.signedUrl && (
                            <img
                              src={doc.signedUrl}
                              alt={doc.name}
                              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500"
                              loading="lazy"
                            />
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-24" />
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-white/20 backdrop-blur-md rounded-full">
                              {t(`dashboard.vehicleDetail.docCategories.${doc.type}`)}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-4 right-4">
                            <p className="text-sm font-bold text-white truncate drop-shadow-sm">{doc.name}</p>
                          </div>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            {doc.fileSize && <span>• {(doc.fileSize / 1024).toFixed(0)} KB</span>}
                            {doc.expiryDate && (
                              <span className={`${isExpired ? "text-red-500" : expiresSoon ? "text-amber-500" : "text-muted-foreground"}`}>
                                • {isExpired ? t("dashboard.vehicleDetail.expired") : expiresSoon ? t("dashboard.vehicleDetail.expiring") : new Date(doc.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                            <a href={docUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }}
                              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {doc.notes && (
                          <div className="px-4 pb-3">
                            <p className="text-[11px] text-muted-foreground/70 italic line-clamp-1">{doc.notes}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-primary/20 rounded-2xl transition-all duration-300 pointer-events-none" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{t("vehicle.reminders")}</h2>
                <Link
                  href={`/dashboard/reminders/new?vehicleId=${vehicle.id}`}
                  className="p-3 hover:bg-accent rounded"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>

              {vehicle.reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("dashboard.vehicleDetail.noActiveReminders")}</p>
              ) : (
                <div className="space-y-3">
                  {vehicle.reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                      <Bell className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.dueDate && new Date(reminder.dueDate).toLocaleDateString()}
                          {reminder.dueMileage && ` ${t("dashboard.vehicleDetail.at")} ${reminder.dueMileage.toLocaleString()} ${t("dashboard.reminders.miles")}`}
                          {reminder.dueHours && ` ${t("dashboard.vehicleDetail.at")} ${reminder.dueHours.toLocaleString()} ${t("dashboard.reminders.hrs")}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t("dashboard.vehicleDetail.valueReport")}
              </h2>

              {valueReport ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("dashboard.vehicleDetail.estimatedValue")}</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${valueReport.estimatedValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("dashboard.vehicleDetail.valueRange")} ${valueReport.valueRange.low.toLocaleString()} &ndash; ${valueReport.valueRange.high.toLocaleString()}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                      valueReport.marketRating === "Above Average" ? "bg-green-500/10 text-green-600" :
                      valueReport.marketRating === "Below Average" ? "bg-red-500/10 text-red-600" :
                      "bg-amber-500/10 text-amber-600"
                    }`}>
                      {valueReport.marketRating}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {valueReport.factors.map((factor) => (
                      <div key={factor.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <ImpactIcon impact={factor.impact} />
                          <span className="text-muted-foreground">{factor.name}</span>
                        </div>
                        <span className="text-foreground">{factor.detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                    <p>{t("dashboard.vehicleDetail.serviceRecords", { n: String(valueReport.maintenance.totalRecords), rate: String(valueReport.depreciation.annualRate) })}</p>
                  </div>
                </div>
              ) : valueReportLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("dashboard.vehicleDetail.getValueEstimate")}
                  </p>
                  <button
                    onClick={fetchValueReport}
                    className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm font-medium"
                  >
                    {t("dashboard.vehicleDetail.estimateValue")}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  {t("dashboard.vehicleDetail.assignedDrivers")}
                </h2>
                <Link
                  href="/dashboard/drivers"
                  className="text-sm text-primary hover:underline"
                >
                  {t("dashboard.vehicleDetail.manage")}
                </Link>
              </div>

              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("dashboard.vehicleDetail.noDriversAssigned")}</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Car className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {a.driver.name}
                          {a.isPrimary && (
                            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t("dashboard.vehicleDetail.primary")}</span>
                          )}
                        </p>
                        {a.driver.email && (
                          <p className="text-xs text-muted-foreground truncate">{a.driver.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-2">
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/transfer`}
                  className="flex items-center gap-2 p-3 text-muted-foreground hover:bg-accent rounded-lg"
                >
                  <Share2 className="w-4 h-4" />
                  {t("dashboard.vehicleDetail.transferOwnership")}
                </Link>
                <button
                  onClick={generateReport}
                  disabled={generatingReport}
                  className="flex items-center gap-2 p-3 w-full text-muted-foreground hover:bg-accent rounded-lg disabled:opacity-50"
                >
                  {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {generatingReport ? t("dashboard.vehicleDetail.generating") : t("dashboard.vehicleDetail.generateReport")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingDoc(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-card rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className={`relative bg-gradient-to-br ${(() => { const c = { registration: "from-blue-500 via-blue-600 to-blue-700", insurance: "from-emerald-500 via-emerald-600 to-emerald-700", warranty: "from-violet-500 via-violet-600 to-violet-700", inspection: "from-orange-500 via-orange-600 to-orange-700", receipt: "from-rose-500 via-rose-600 to-rose-700", manual: "from-slate-500 via-slate-600 to-slate-700" } as Record<string, string>; return c[viewingDoc.type] || "from-gray-500 via-gray-600 to-gray-700"; })()} px-6 py-5 sticky top-0 z-10`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)] opacity-20" />
                <div className="relative flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                    {t(`dashboard.vehicleDetail.docCategories.${viewingDoc.type}`)}
                  </p>
                  <h3 className="text-lg font-bold text-white truncate mt-0.5">{viewingDoc.name}</h3>
                </div>
                <button onClick={() => setViewingDoc(null)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0 ml-4">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-muted/10 rounded-2xl overflow-hidden border border-border/50">
                <img
                  src={viewingDoc.signedUrl || `/api/vehicles/${vehicle.id}/documents/${viewingDoc.id}`}
                  alt={viewingDoc.name}
                  className="w-full max-h-[55vh] object-contain mx-auto"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/10 rounded-xl p-3">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{t("dashboard.vehicleDetail.added")}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{new Date(viewingDoc.createdAt).toLocaleDateString()}</p>
                </div>
                {viewingDoc.fileSize && (
                  <div className="bg-muted/10 rounded-xl p-3">
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{t("dashboard.vehicleDetail.size")}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{(viewingDoc.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                )}
                {viewingDoc.expiryDate && (
                  <div className="bg-muted/10 rounded-xl p-3">
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{t("dashboard.vehicleDetail.expires")}</p>
                    <p className={`text-sm font-semibold mt-0.5 ${new Date(viewingDoc.expiryDate) < new Date() ? "text-red-500" : "text-foreground"}`}>
                      {new Date(viewingDoc.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {viewingDoc.notes && (
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1.5">{t("dashboard.vehicleDetail.notes")}</p>
                  <p className="text-sm text-foreground/80 bg-muted/10 rounded-xl p-3 leading-relaxed">{viewingDoc.notes}</p>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <a href={viewingDoc.signedUrl || `/api/vehicles/${vehicle.id}/documents/${viewingDoc.id}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                  <Download className="w-4 h-4" />
                  {t("dashboard.vehicleDetail.openFullDocument")}
                </a>
                <button onClick={() => addToWallet(viewingDoc)}
                  className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/40 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-xl transition-colors border border-yellow-200 dark:border-yellow-800 whitespace-nowrap">
                  <Wallet className="w-4 h-4" />
                  {t("dashboard.vehicleDetail.wallet")}
                </button>
                <button onClick={() => setViewingDoc(null)}
                  className="flex items-center justify-center gap-2 py-3 px-5 text-sm font-medium text-foreground bg-muted/20 hover:bg-muted/40 rounded-xl transition-colors border border-border/50">
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDocForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 border border-border w-full">
            <h2 className="text-lg font-semibold mb-4 text-foreground">{t("dashboard.vehicleDetail.uploadDocument")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">{t("dashboard.vehicleDetail.file")}</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">{t("dashboard.vehicleDetail.documentName")}</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder={t("dashboard.vehicleDetail.docNamePlaceholder")}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">{t("dashboard.vehicleDetail.type")}</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                >
                  <option value="registration">{t("dashboard.vehicleDetail.docCategories.registration")}</option>
                  <option value="insurance">{t("dashboard.vehicleDetail.docCategories.insurance")}</option>
                  <option value="warranty">{t("dashboard.vehicleDetail.docCategories.warranty")}</option>
                  <option value="inspection">{t("dashboard.vehicleDetail.docCategories.inspection")}</option>
                  <option value="receipt">{t("dashboard.vehicleDetail.docCategories.receipt")}</option>
                  <option value="manual">{t("dashboard.vehicleDetail.docCategories.manual")}</option>
                  <option value="other">{t("dashboard.vehicleDetail.docCategories.other")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">{t("dashboard.vehicleDetail.expiryDate")}</label>
                <input
                  type="date"
                  value={docExpiry}
                  onChange={(e) => setDocExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">{t("dashboard.vehicleDetail.notes")}</label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder={t("dashboard.vehicleDetail.optionalNotes")}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                />
              </div>
            </div>
            {docError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg mt-4">
                {docError}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowDocForm(false); setDocFile(null); setDocError(""); }}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-accent"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDocUpload}
                disabled={uploadingDoc || !docFile}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
              >
                {uploadingDoc ? t("dashboard.vehicleDetail.uploading") : t("common.upload")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <ConfirmDialog
          open={showDeleteModal}
          title={t("dashboard.vehicleDetail.deleteVehicle")}
          message={t("dashboard.vehicleDetail.deleteVehicleConfirm")}
          confirmLabel={t("common.delete")}
          variant="danger"
          onConfirm={async () => {
            await handleDelete();
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedImage}
            alt={t("dashboard.vehicleDetail.viewInvoice")}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
