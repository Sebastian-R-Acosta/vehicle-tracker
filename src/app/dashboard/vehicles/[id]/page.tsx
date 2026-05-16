"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
} from "lucide-react";

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
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && params.id) {
      fetchVehicle();
    }
  }, [session, params.id]);

  const fetchVehicle = async () => {
    try {
      const res = await fetch(`/api/vehicles/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setVehicle(data);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch vehicle:", err);
    } finally {
      setLoading(false);
    }
  };

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
      setRecallsError("Failed to check recalls");
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

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/vehicles/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
    }
  };

  const vehicleId = Array.isArray(params.id) ? params.id[0] : params.id;

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

        const logoUrl = "/logo.svg";
        try {
          doc.addImage(logoUrl, "SVG", margin, 10, 50, 15);
        } catch (e) {}

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("Vehicle History Report", pageWidth - margin, 18, { align: "right" });

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
        doc.text("Vehicle Information", margin, 48);

        const startY = 58;
        const rowHeight = 16;
        const rows = [
          [{ label: "Make", value: data.vehicle.make }, { label: "Model", value: data.vehicle.model }],
          [{ label: "Year", value: String(data.vehicle.year) }, { label: "Mileage", value: `${data.vehicle.currentMileage.toLocaleString()} miles` }],
          [{ label: "VIN", value: data.vehicle.vin || "Not provided" }, null],
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
        doc.text("Maintenance Summary", margin, 110);

        const colWidth = contentWidth / 4;
        const headerY = 115;

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, headerY, contentWidth, 10, "F");

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text("Service Type", margin + 5, headerY + 7);
        doc.text("Count", margin + colWidth + 5, headerY + 7);
        doc.text("Last Service", margin + colWidth * 2 + 5, headerY + 7);
        doc.text("Next Due", margin + colWidth * 3 + 5, headerY + 7);

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
            else if (serviceType !== "Repair" && serviceType !== "Other") nextDue = `${nextMileage.toLocaleString()} mi`;
            doc.setTextColor(22, 163, 74);
            doc.text(nextDue, margin + colWidth * 3 + 5, ySummary + 10);
          } else {
            doc.setTextColor(148, 163, 184);
            doc.text("Never Logged", margin + colWidth * 2 + 5, ySummary + 10);
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
        doc.text("Vehicle Tracker | Professional Fleet & Vehicle Management System", pageWidth / 2, footerY, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("CONFIDENTIAL: This report is intended solely for the use of the individual or entity to whom it is addressed.", pageWidth / 2, footerY + 6, { align: "center" });
        doc.text(`Report generated: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 12, { align: "center" });

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
      setDocError("File too large. Maximum size is 10MB.");
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
      }
    } catch (err: any) {
      setDocError(err.message || "Upload failed. Try a smaller file.");
      console.error("Failed to upload document:", err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/vehicles/${vehicleId}/documents/${docId}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  if (status === "loading" || loading || !vehicle) {
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
                Back
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generateReport}
                disabled={generatingReport}
                className="flex items-center gap-2 px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg disabled:opacity-50"
              >
                {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {generatingReport ? "Generating..." : "Report"}
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
                      <p className="text-sm text-muted-foreground">Hours Meter</p>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.hoursMeter != null ? `${vehicle.hoursMeter.toLocaleString()} hrs` : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Number</p>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.serialNumber || "Not provided"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Mileage</p>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.currentMileage.toLocaleString()} mi
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">VIN</p>
                      <p className="text-lg font-semibold text-foreground">
                        {vehicle.vin || "Not provided"}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Last Service</p>
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
                      "No records"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Maintenance History</h2>
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/maintenance/new`}
                  className="flex items-center gap-2 px-3 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </Link>
              </div>

              {vehicle.maintenanceRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No maintenance records yet</p>
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
                            {new Date(record.date).toLocaleDateString()} at {record.mileage.toLocaleString()} miles
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
                              View Invoice
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
                    Recall Alerts
                  </h2>
                  {recallsLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>

                {recallsError && (
                  <p className="text-sm text-muted-foreground">{recallsError}</p>
                )}

                {!recallsLoading && !recallsError && recalls.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm text-green-600 font-medium">No open recalls found for this VIN</span>
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
                                Remedy: {recall.remedy}
                              </p>
                            )}
                            {recall.safetyRisk && (
                              <p className="text-sm text-red-600 mt-1">
                                Risk: {recall.safetyRisk}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Reported: {new Date(recall.reportReceivedDate).toLocaleDateString()}
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
                  Digital Glovebox
                </h2>
                <button
                  onClick={() => setShowDocForm(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>

              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No documents yet. Upload insurance, registration, warranty, or receipts.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {documents.map((doc) => {
                    const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                    const expiresSoon = doc.expiryDate && !isExpired && new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    const cardColors: Record<string, { bg: string; gradient: string; icon: string; label: string }> = {
                      registration: { bg: "bg-blue-500", gradient: "from-blue-500 to-blue-600", icon: "bg-blue-400/30", label: "Registration" },
                      insurance: { bg: "bg-emerald-500", gradient: "from-emerald-500 to-emerald-600", icon: "bg-emerald-400/30", label: "Insurance" },
                      warranty: { bg: "bg-violet-500", gradient: "from-violet-500 to-violet-600", icon: "bg-violet-400/30", label: "Warranty" },
                      inspection: { bg: "bg-orange-500", gradient: "from-orange-500 to-orange-600", icon: "bg-orange-400/30", label: "Inspection" },
                      receipt: { bg: "bg-rose-500", gradient: "from-rose-500 to-rose-600", icon: "bg-rose-400/30", label: "Receipt" },
                      manual: { bg: "bg-slate-500", gradient: "from-slate-500 to-slate-600", icon: "bg-slate-400/30", label: "Manual" },
                    };
                    const colors = cardColors[doc.type] || { bg: "bg-gray-500", gradient: "from-gray-500 to-gray-600", icon: "bg-gray-400/30", label: doc.type.charAt(0).toUpperCase() + doc.type.slice(1) };
                    return (
                      <div key={doc.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                        <div className={`bg-gradient-to-r ${colors.gradient} px-4 pt-4 pb-3`}>
                          <div className="flex items-start justify-between">
                            <div className={`w-9 h-9 rounded-full ${colors.icon} flex items-center justify-center backdrop-blur`}>
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">{colors.label}</span>
                          </div>
                          <p className="text-sm font-semibold text-white mt-2 truncate">{doc.name}</p>
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Added</span>
                            <span className="text-foreground font-medium">{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                          {doc.fileSize && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Size</span>
                              <span className="text-foreground font-medium">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                            </div>
                          )}
                          {doc.expiryDate && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Expires</span>
                              <span className={`font-medium ${isExpired ? "text-red-600" : expiresSoon ? "text-amber-600" : "text-foreground"}`}>
                                {isExpired ? "Expired" : expiresSoon ? "Expiring Soon" : new Date(doc.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.notes}</p>
                          )}
                        </div>
                        <div className="px-4 pb-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={`/api/vehicles/${vehicle.id}/documents/${doc.id}`} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                            <Download className="w-3.5 h-3.5" />
                            Open
                          </a>
                          <button onClick={() => deleteDocument(doc.id)}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                <h2 className="text-lg font-semibold text-foreground">Reminders</h2>
                <Link
                  href={`/dashboard/reminders/new?vehicleId=${vehicle.id}`}
                  className="p-3 hover:bg-accent rounded"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>

              {vehicle.reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active reminders</p>
              ) : (
                <div className="space-y-3">
                  {vehicle.reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                      <Bell className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.dueDate && new Date(reminder.dueDate).toLocaleDateString()}
                          {reminder.dueMileage && ` at ${reminder.dueMileage.toLocaleString()} mi`}
                          {reminder.dueHours && ` at ${reminder.dueHours.toLocaleString()} hrs`}
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
                Value Report
              </h2>

              {valueReport ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm text-muted-foreground">Estimated Value</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${valueReport.estimatedValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: ${valueReport.valueRange.low.toLocaleString()} &ndash; ${valueReport.valueRange.high.toLocaleString()}
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
                    <p>{valueReport.maintenance.totalRecords} service records on file &bull; {valueReport.depreciation.annualRate}% annual depreciation</p>
                  </div>
                </div>
              ) : valueReportLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Get an estimated market value based on age, mileage, and service history.
                  </p>
                  <button
                    onClick={fetchValueReport}
                    className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm font-medium"
                  >
                    Estimate Value
                  </button>
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Assigned Drivers
                </h2>
                <Link
                  href="/dashboard/drivers"
                  className="text-sm text-primary hover:underline"
                >
                  Manage
                </Link>
              </div>

              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No drivers assigned</p>
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
                            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Primary</span>
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
                  Transfer Ownership
                </Link>
                <button
                  onClick={generateReport}
                  disabled={generatingReport}
                  className="flex items-center gap-2 p-3 w-full text-muted-foreground hover:bg-accent rounded-lg disabled:opacity-50"
                >
                  {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {generatingReport ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showDocForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 border border-border w-full">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Upload Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Document Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Insurance Card"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                >
                  <option value="registration">Registration</option>
                  <option value="insurance">Insurance</option>
                  <option value="warranty">Warranty</option>
                  <option value="inspection">Inspection</option>
                  <option value="receipt">Receipt</option>
                  <option value="manual">Manual</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={docExpiry}
                  onChange={(e) => setDocExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Optional notes"
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
                Cancel
              </button>
              <button
                onClick={handleDocUpload}
                disabled={uploadingDoc || !docFile}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
              >
                {uploadingDoc ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 border border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Delete Vehicle</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this vehicle? This will also delete all
              maintenance records, reminders, and documents. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-input rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
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
            alt="Invoice"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
