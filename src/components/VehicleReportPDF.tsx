import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333333",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#666666",
    textAlign: "center",
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
    alignSelf: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingBottom: 5,
  },
  vehicleInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  vehicleInfoItem: {
    width: "50%",
    marginBottom: 8,
  },
  vehicleInfoLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 2,
  },
  vehicleInfoValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    padding: 8,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    padding: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
    color: "#333333",
  },
  colDate: {
    width: "20%",
  },
  colService: {
    width: "25%",
  },
  colMileage: {
    width: "15%",
  },
  colNotes: {
    width: "40%",
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#333333",
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: "#999999",
    textAlign: "center",
    marginBottom: 3,
  },
  footerBrand: {
    fontSize: 10,
    color: "#666666",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  noData: {
    fontSize: 10,
    color: "#666666",
    fontStyle: "italic",
    padding: 10,
  },
  ownershipSection: {
    marginTop: 10,
  },
  ownershipItem: {
    marginBottom: 6,
  },
  ownershipLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 2,
  },
  ownershipValue: {
    fontSize: 11,
    color: "#000000",
  },
});

interface VehicleData {
  vehicle: {
    year: number;
    make: string;
    model: string;
    nickname: string | null;
    licensePlate: string | null;
    vin: string | null;
    currentMileage: number;
  };
  summary: {
    lastMaintenance: {
      date: string;
      serviceType: string;
      mileage: number;
    } | null;
    nextReminder: {
      title: string;
      dueDate: string | null;
      dueMileage: number | null;
    } | null;
    totalCost: number | null;
  };
  maintenanceHistory: Array<{
    date: string;
    serviceType: string;
    mileage: number;
    notes: string | null;
    cost: number | null;
  }>;
  ownershipHistory?: Array<{
    ownerName: string;
    transferDate: string | null;
  }>;
}

interface VehiclePDFProps {
  data: VehicleData;
  logoUrl?: string;
}

export default function VehicleReportPDF({ data, logoUrl }: VehiclePDFProps) {
  const { vehicle, summary, maintenanceHistory } = data;
  const generatedDate = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.headerTitle}>Bitácora Vehicle History Report</Text>
          <Text style={styles.headerSubtitle}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.vehicleInfoGrid}>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>Make</Text>
              <Text style={styles.vehicleInfoValue}>{vehicle.make}</Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>Model</Text>
              <Text style={styles.vehicleInfoValue}>{vehicle.model}</Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>Year</Text>
              <Text style={styles.vehicleInfoValue}>{vehicle.year}</Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>Current Mileage</Text>
              <Text style={styles.vehicleInfoValue}>
                {vehicle.currentMileage.toLocaleString()} miles
              </Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>VIN</Text>
              <Text style={styles.vehicleInfoValue}>
                {vehicle.vin || "Not provided"}
              </Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>License Plate</Text>
              <Text style={styles.vehicleInfoValue}>
                {vehicle.licensePlate || "Not set"}
              </Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>Nickname</Text>
              <Text style={styles.vehicleInfoValue}>
                {vehicle.nickname || "Not set"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Summary</Text>
          {summary.lastMaintenance ? (
            <Text style={styles.summaryText}>
              Last Maintenance:{" "}
              {new Date(summary.lastMaintenance.date).toLocaleDateString()} -{" "}
              {summary.lastMaintenance.serviceType} at{" "}
              {summary.lastMaintenance.mileage.toLocaleString()} miles
            </Text>
          ) : (
            <Text style={styles.summaryText}>No maintenance records available</Text>
          )}
          {summary.nextReminder && (
            <Text style={styles.summaryText}>
              Next Due: {summary.nextReminder.title}
              {summary.nextReminder.dueDate &&
                ` on ${new Date(summary.nextReminder.dueDate).toLocaleDateString()}`}
              {summary.nextReminder.dueMileage &&
                ` at ${summary.nextReminder.dueMileage.toLocaleString()} miles`}
            </Text>
          )}
          {summary.totalCost !== null && summary.totalCost !== undefined && (
            <Text style={styles.summaryText}>
              Total Maintenance Cost: ${summary.totalCost.toLocaleString()}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance History</Text>
          {maintenanceHistory.length === 0 ? (
            <Text style={styles.noData}>No maintenance records</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
                <Text style={[styles.tableHeaderCell, styles.colService]}>
                  Service Type
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colMileage]}>
                  Mileage
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colNotes]}>Notes</Text>
              </View>
              {maintenanceHistory.map((record, index) => (
                <View
                  key={index}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={[styles.tableCell, styles.colDate]}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.tableCell, styles.colService]}>
                    {record.serviceType}
                  </Text>
                  <Text style={[styles.tableCell, styles.colMileage]}>
                    {record.mileage.toLocaleString()} mi
                  </Text>
                  <Text style={[styles.tableCell, styles.colNotes]}>
                    {record.notes || "-"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            Bitácora | Professional Fleet & Vehicle Management System
          </Text>
          <Text style={styles.footerText}>
            CONFIDENTIAL: This report is intended solely for the use of the
            individual or entity to whom it is addressed.
          </Text>
          <Text style={styles.footerText}>
            Report generated: {generatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
}