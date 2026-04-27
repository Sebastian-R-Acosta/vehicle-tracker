"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  vin: string | null;
  currentMileage: number;
  maintenanceRecords: MaintenanceRecord[];
  reminders: Reminder[];
}

export default function VehicleDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    "Oil Change",
    "Tire Rotation", 
    "Brake Service",
    "Air Filter",
    "Transmission Service",
    "Battery Replacement",
    "Inspection",
    "Repair",
    "Other"
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
      "Other": { months: 0, miles: 0 }
    };
    
    const interval = intervals[serviceType] || { months: 0, miles: 0 };
    let nextDate: string | null = null;
    let nextMileage = mileage;
    
    if (lastServiceDate && interval.months > 0) {
      const dueDate = new Date(lastServiceDate);
      dueDate.setMonth(dueDate.getMonth() + interval.months);
      nextDate = dueDate.toISOString().split('T')[0];
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
        const contentWidth = pageWidth - (margin * 2);
        
        const logoUrl = "/logo.svg";
        try {
          doc.addImage(logoUrl, "SVG", margin, 10, 50, 15);
        } catch (e) {
          console.log("Logo not found, using text instead");
        }
        
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
          [{ label: "VIN", value: data.vehicle.vin || "Not provided" }, null]
        ];
        
        rows.forEach((row, rowIndex) => {
          const y = startY + (rowIndex * rowHeight);
          
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
        const summaryRowHeight = 14;
        
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, headerY, contentWidth, 10, "F");
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text("Service Type", margin + 5, headerY + 7);
        doc.text("Count", margin + colWidth + 5, headerY + 7);
        doc.text("Last Service", margin + (colWidth * 2) + 5, headerY + 7);
        doc.text("Next Due", margin + (colWidth * 3) + 5, headerY + 7);
        
        const maintenanceByType: { [key: string]: typeof data.maintenanceHistory } = {};
        data.maintenanceHistory.forEach((record: any) => {
          if (!maintenanceByType[record.serviceType]) {
            maintenanceByType[record.serviceType] = [];
          }
          maintenanceByType[record.serviceType].push(record);
        });
        
        let ySummary = headerY + 10;
        
        serviceTypes.forEach((serviceType, index) => {
          if (ySummary > 250) {
            doc.addPage();
            ySummary = 25;
          }
          
          const records = maintenanceByType[serviceType] || [];
          const count = records.length;
          const lastRecord = records[0];
          
          doc.setDrawColor(226, 232, 240);
doc.setLineWidth(0.3);
            doc.line(margin, ySummary + summaryRowHeight, margin + contentWidth, ySummary + summaryRowHeight);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);
            doc.text(serviceType, margin + 5, ySummary + 10);
            
            doc.setTextColor(37, 99, 235);
            doc.text(count > 0 ? String(count) : "—", margin + colWidth + 5, ySummary + 10);
            
            if (lastRecord) {
              doc.setTextColor(71, 85, 105);
              doc.text(new Date(lastRecord.date).toLocaleDateString(), margin + (colWidth * 2) + 5, ySummary + 10);
              
              const { date: nextDate, mileage: nextMileage } = getNextDueDate(lastRecord.date, lastRecord.mileage, serviceType);
              let nextDue = "—";
              if (nextDate) {
                nextDue = new Date(nextDate).toLocaleDateString();
              } else if (serviceType !== "Repair" && serviceType !== "Other") {
                nextDue = `${nextMileage.toLocaleString()} mi`;
              }
              doc.setTextColor(22, 163, 74);
              doc.text(nextDue, margin + (colWidth * 3) + 5, ySummary + 10);
            } else {
              doc.setTextColor(148, 163, 184);
              doc.text("Never Logged", margin + (colWidth * 2) + 5, ySummary + 10);
              doc.setTextColor(239, 68, 68);
              doc.text("—", margin + (colWidth * 3) + 5, ySummary + 10);
            }
            
            ySummary += summaryRowHeight;
        });
        
        const historyStartY = ySummary + 10;
        
        if (historyStartY > 240) {
          doc.addPage();
          ySummary = 25;
        } else {
          ySummary = historyStartY;
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("Maintenance History", margin, ySummary);
        
        ySummary += 8;
        
        const histColWidth = contentWidth / 4;
        
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, ySummary, contentWidth, 10, "F");
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text("Date", margin + 5, ySummary + 7);
        doc.text("Service", margin + histColWidth + 5, ySummary + 7);
        doc.text("Mileage", margin + (histColWidth * 2) + 5, ySummary + 7);
        doc.text("Notes", margin + (histColWidth * 3) + 5, ySummary + 7);
        
        ySummary += 14;
        
        doc.setFont("helvetica", "normal");
        
        if (data.maintenanceHistory.length === 0) {
          doc.setTextColor(148, 163, 184);
          doc.text("No maintenance records found.", margin + 5, ySummary);
        } else {
          const histRowHeight = 12;
          data.maintenanceHistory.forEach((record: any, index: number) => {
            if (ySummary > 270) {
              doc.addPage();
              ySummary = 25;
            }
            
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(margin, ySummary + histRowHeight, margin + contentWidth, ySummary + histRowHeight);
            
            doc.setTextColor(71, 85, 105);
            doc.text(new Date(record.date).toLocaleDateString(), margin + 5, ySummary + 9);
            doc.setTextColor(30, 41, 59);
            doc.text(record.serviceType.substring(0, 18), margin + histColWidth + 5, ySummary + 9);
            doc.text(`${record.mileage.toLocaleString()} mi`, margin + (histColWidth * 2) + 5, ySummary + 9);
            doc.setTextColor(100, 116, 139);
            doc.text(record.notes ? record.notes.substring(0, 25) : "—", margin + (histColWidth * 3) + 5, ySummary + 9);
            
            ySummary += histRowHeight;
          });
        }
        
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

  if (status === "loading" || loading || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const lastMaintenance = vehicle.maintenanceRecords[0];

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
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg disabled:opacity-50"
              >
                {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {generatingReport ? "Generating..." : "Report"}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1 text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  {vehicle.nickname && (
                    <p className="text-muted-foreground">{vehicle.nickname}</p>
                  )}
                </div>
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/edit`}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
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
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
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
                    <div
                      key={record.id}
                      className="p-6 flex items-start justify-between hover:bg-accent"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-secondary rounded-lg">
                          <Wrench className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{record.serviceType}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()} at{" "}
                            {record.mileage.toLocaleString()} miles
                          </p>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {record.notes}
                            </p>
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
                        className="p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Reminders</h2>
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}/reminders/new`}
                  className="p-1 hover:bg-accent rounded"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>

              {vehicle.reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active reminders</p>
              ) : (
                <div className="space-y-3">
                  {vehicle.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center gap-2 p-2 bg-secondary rounded-lg"
                    >
                      <Bell className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.dueDate &&
                            new Date(reminder.dueDate).toLocaleDateString()}
                          {reminder.dueMileage &&
                            ` at ${reminder.dueMileage.toLocaleString()} mi`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h2>
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md mx-4 border border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Delete Vehicle</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this vehicle? This will also delete all
              maintenance records and reminders. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90"
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
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
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