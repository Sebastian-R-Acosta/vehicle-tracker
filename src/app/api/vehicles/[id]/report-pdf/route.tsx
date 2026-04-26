import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ReactPDF from "@react-pdf/renderer";

const { Document, Page, Text, View, StyleSheet, pdf } = ReactPDF;

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  vehicleInfo: {
    fontSize: 12,
    marginBottom: 4,
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
  },
  tableCellDate: {
    fontSize: 10,
    width: 80,
  },
  tableCellType: {
    fontSize: 10,
    width: 100,
  },
  tableCellMileage: {
    fontSize: 10,
    width: 60,
    textAlign: "right",
  },
});

const ReportDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Vehicle History Report</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        <Text style={styles.vehicleInfo}>
          {data.vehicle.year} {data.vehicle.make} {data.vehicle.model}
        </Text>
        {data.vehicle.nickname && (
          <Text style={styles.vehicleInfo}>Nickname: {data.vehicle.nickname}</Text>
        )}
        {data.vehicle.vin && (
          <Text style={styles.vehicleInfo}>VIN: {data.vehicle.vin}</Text>
        )}
        <Text style={styles.vehicleInfo}>
          Current Mileage: {data.vehicle.currentMileage.toLocaleString()} miles
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        {data.summary.lastMaintenance ? (
          <Text style={styles.vehicleInfo}>
            Last Maintenance: {new Date(data.summary.lastMaintenance.date).toLocaleDateString()} - {data.summary.lastMaintenance.serviceType} at {data.summary.lastMaintenance.mileage.toLocaleString()} miles
          </Text>
        ) : (
          <Text style={styles.vehicleInfo}>No maintenance records</Text>
        )}
        {data.summary.nextReminder && (
          <Text style={styles.vehicleInfo}>
            Next Due: {data.summary.nextReminder.title}
            {data.summary.nextReminder.dueDate && ` on ${new Date(data.summary.nextReminder.dueDate).toLocaleDateString()}`}
            {data.summary.nextReminder.dueMileage && ` at ${data.summary.nextReminder.dueMileage.toLocaleString()} miles`}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maintenance History</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellDate}>Date</Text>
            <Text style={styles.tableCellType}>Service</Text>
            <Text style={styles.tableCell}>Notes</Text>
            <Text style={styles.tableCellMileage}>Mileage</Text>
          </View>
          {data.maintenanceHistory.map((record: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellDate}>
                {new Date(record.date).toLocaleDateString()}
              </Text>
              <Text style={styles.tableCellType}>{record.serviceType}</Text>
              <Text style={styles.tableCell}>{record.notes || "-"}</Text>
              <Text style={styles.tableCellMileage}>
                {record.mileage.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { 
      id: params.id,
      userId: session.user.id 
    },
    include: {
      maintenanceRecords: {
        orderBy: { date: "desc" },
      },
      previousOwner: true,
      reminders: {
        where: { isCompleted: false },
        orderBy: [{ dueDate: "asc" }, { dueMileage: "asc" }],
      },
    },
  });

  if (!vehicle) {
    return new NextResponse("Vehicle not found", { status: 404 });
  }

  const lastMaintenance = vehicle.maintenanceRecords[0];
  const nextReminder = vehicle.reminders.find(r => r.dueDate || r.dueMileage);

  const reportData = {
    vehicle: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      nickname: vehicle.nickname,
      currentMileage: vehicle.currentMileage,
    },
    summary: {
      lastMaintenance: lastMaintenance
        ? {
            date: lastMaintenance.date,
            serviceType: lastMaintenance.serviceType,
            mileage: lastMaintenance.mileage,
          }
        : null,
      nextReminder: nextReminder
        ? {
            title: nextReminder.title,
            dueDate: nextReminder.dueDate,
            dueMileage: nextReminder.dueMileage,
          }
        : null,
    },
    maintenanceHistory: vehicle.maintenanceRecords,
    ownershipHistory: [
      {
        type: "current",
        userId: vehicle.userId,
        since: vehicle.createdAt,
      },
      ...(vehicle.previousOwnerId
        ? [
            {
              type: "previous",
              userId: vehicle.previousOwnerId,
              name: vehicle.previousOwner?.name,
            },
          ]
        : []),
    ],
  };

  const pdfBlob = await pdf(<ReportDocument data={reportData} />).toBlob();

  return new NextResponse(pdfBlob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="vehicle-report-${vehicle.make}-${vehicle.model}.pdf"`,
    },
  });
}