"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Car,
  ArrowLeft,
  Plus,
  Wrench,
  Bell,
  Download,
  Loader2,
  Pencil,
  Trash2,
  Image,
  X,
} from "lucide-react";
import { useFetch } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { VehicleTaskSection } from "@/components/VehicleTaskSection";
import { VehicleDocumentsSection } from "@/components/VehicleDocumentsSection";
import { VehicleRecallsSection } from "@/components/VehicleRecallsSection";
import { VehicleValueReportSection } from "@/components/VehicleValueReportSection";
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
  serialNumber: number | null;
  equipmentStatus: string | null;
  maintenanceRecords: MaintenanceRecord[];
  reminders: Reminder[];
}

const constructionTypes = new Set(["excavator", "bulldozer", "dump_truck", "crane", "loader", "grader"]);

export default function VehicleDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const vehicleId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: vehicle, isLoading } = useFetch<Vehicle>(
    ["vehicle", vehicleId],
    `/api/vehicles/${vehicleId}`,
    { enabled: status === "authenticated" && !!vehicleId }
  );

  const { data: plan } = useFetch<{ tier: string }>(
    ["plan"],
    "/api/user/plan",
    { enabled: status === "authenticated" }
  );

  const isPro = plan?.tier === "pro" || plan?.tier === "business";

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
        await queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
        await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
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

  const serviceTypeTranslationKeys: Record<string, string> = {
    "Oil Change": "serviceTypes.oilChange",
    "Tire Rotation": "serviceTypes.tireRotation",
    "Brake Service": "serviceTypes.brakeService",
    "Air Filter": "serviceTypes.airFilter",
    "Transmission Service": "serviceTypes.transmissionService",
    "Battery Replacement": "serviceTypes.batteryReplacement",
    "Inspection": "serviceTypes.inspection",
    "Repair": "serviceTypes.repair",
    "Other": "serviceTypes.other",
  };

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
          doc.text(t(serviceTypeTranslationKeys[serviceType] || serviceType), margin + 5, ySummary + 10);

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

  if (status === "loading" || isLoading || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const lastMaintenance = vehicle.maintenanceRecords[0];
  const isConstruction = constructionTypes.has(vehicle.vehicleType);

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
              <VehicleRecallsSection vehicleId={vehicle.id} vin={vehicle.vin} />
            )}

            <VehicleTaskSection vehicleId={vehicle.id} />

            <VehicleDocumentsSection vehicleId={vehicle.id} isPro={isPro ?? false} />
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

            <VehicleValueReportSection vehicleId={vehicle.id} />

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-2">
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/transfer`}
                  className="flex items-center gap-2 p-3 text-muted-foreground hover:bg-accent rounded-lg"
                >
                  <Car className="w-4 h-4" />
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
