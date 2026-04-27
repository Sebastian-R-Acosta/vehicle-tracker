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
        
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Vehicle Tracker", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(16);
        doc.text("Vehicle History Report", pageWidth / 2, 28, { align: "center" });
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 32, pageWidth - margin, 32);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`, margin, 45);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Vehicle Information", margin, 60);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        let yPos = 70;
        const label = (text: string) => doc.setFont("helvetica", "bold");
        const value = (text: string) => doc.setFont("helvetica", "normal");
        
        label("Make:"); doc.text(data.vehicle.make, 50, yPos); yPos += 8;
        label("Model:"); doc.text(data.vehicle.model, 50, yPos); yPos += 8;
        label("Year:"); doc.text(String(data.vehicle.year), 50, yPos); yPos += 8;
        label("Mileage:"); doc.text(`${data.vehicle.currentMileage.toLocaleString()} miles`, 50, yPos); yPos += 8;
        label("VIN:"); doc.text(data.vehicle.vin || "Not provided", 50, yPos); yPos += 8;
        if (data.vehicle.nickname) {
          label("Nickname:"); doc.text(data.vehicle.nickname, 50, yPos); yPos += 8;
        }
        
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Report Summary", margin, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        if (data.summary.lastMaintenance) {
          doc.text(`Last Maintenance: ${new Date(data.summary.lastMaintenance.date).toLocaleDateString()} - ${data.summary.lastMaintenance.serviceType}`, margin, yPos);
          yPos += 8;
        }
        if (data.summary.nextReminder) {
          let reminderText = `Next Due: ${data.summary.nextReminder.title}`;
          if (data.summary.nextReminder.dueDate) reminderText += ` on ${new Date(data.summary.nextReminder.dueDate).toLocaleDateString()}`;
          if (data.summary.nextReminder.dueMileage) reminderText += ` at ${data.summary.nextReminder.dueMileage.toLocaleString()} miles`;
          doc.text(reminderText, margin, yPos);
          yPos += 8;
        }
        
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Maintenance History", margin, yPos);
        yPos += 5;
        
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPos, contentWidth, 10, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Date", margin + 2, yPos + 7);
        doc.text("Service", margin + 35, yPos + 7);
        doc.text("Mileage", margin + 95, yPos + 7);
        doc.text("Notes", margin + 130, yPos + 7);
        yPos += 12;
        
        doc.setFont("helvetica", "normal");
        data.maintenanceHistory.forEach((record: any, index: number) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, yPos - 4, contentWidth, 10, "F");
          }
          
          doc.text(new Date(record.date).toLocaleDateString(), margin + 2, yPos + 3);
          doc.text(record.serviceType.substring(0, 20), margin + 35, yPos + 3);
          doc.text(`${record.mileage.toLocaleString()} mi`, margin + 95, yPos + 3);
          doc.text(record.notes ? record.notes.substring(0, 30) : "-", margin + 130, yPos + 3);
          yPos += 10;
        });
        
        doc.setDrawColor(200, 200, 200);
        const footerY = 285;
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Vehicle Tracker | Professional Fleet & Vehicle Management System", pageWidth / 2, footerY, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text("CONFIDENTIAL: This report is intended solely for the use of the individual or entity to whom it is addressed.", pageWidth / 2, footerY + 5, { align: "center" });
        doc.text(`Report generated: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 10, { align: "center" });
        
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