import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const pdfStrings = {
  en: {
    reportTitle: "Bitácora Vehicle History Report",
    vehicleInfo: "Vehicle Information",
    make: "Make",
    model: "Model",
    year: "Year",
    currentMileage: "Current Mileage",
    miles: "miles",
    vin: "VIN",
    notProvided: "Not provided",
    licensePlate: "License Plate",
    notSet: "Not set",
    nickname: "Nickname",
    reportSummary: "Report Summary",
    lastMaintenance: "Last Maintenance",
    noMaintenanceAvailable: "No maintenance records available",
    at: "at",
    nextDue: "Next Due",
    on: "on",
    totalCost: "Total Maintenance Cost",
    maintenanceHistory: "Maintenance History",
    noRecords: "No maintenance records",
    date: "Date",
    serviceType: "Service Type",
    mileage: "Mileage",
    notes: "Notes",
    mi: "mi",
    footerBrand: "Bitácora | Professional Fleet & Vehicle Management System",
    confidential: "CONFIDENTIAL: This report is intended solely for the use of the individual or entity to whom it is addressed.",
    reportGenerated: "Report generated:",
  },
  es: {
    reportTitle: "Bitácora — Informe de Historial del Vehículo",
    vehicleInfo: "Información del Vehículo",
    make: "Marca",
    model: "Modelo",
    year: "Año",
    currentMileage: "Kilometraje Actual",
    miles: "km",
    vin: "VIN",
    notProvided: "No proporcionado",
    licensePlate: "Placa",
    notSet: "No establecido",
    nickname: "Apodo",
    reportSummary: "Resumen del Informe",
    lastMaintenance: "Último Mantenimiento",
    noMaintenanceAvailable: "No hay registros de mantenimiento disponibles",
    at: "a",
    nextDue: "Próximo Vencimiento",
    on: "el",
    totalCost: "Costo Total de Mantenimiento",
    maintenanceHistory: "Historial de Mantenimiento",
    noRecords: "No hay registros de mantenimiento",
    date: "Fecha",
    serviceType: "Tipo de Servicio",
    mileage: "Kilometraje",
    notes: "Notas",
    mi: "km",
    footerBrand: "Bitácora | Sistema Profesional de Gestión de Flotas y Vehículos",
    confidential: "CONFIDENCIAL: Este informe está destinado únicamente para el uso de la persona o entidad a la que se dirige.",
    reportGenerated: "Informe generado:",
  },
} as const;

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
  locale?: "en" | "es";
}

export default function VehicleReportPDF({ data, logoUrl, locale = "en" }: VehiclePDFProps) {
  const { vehicle, summary, maintenanceHistory } = data;
  const s = pdfStrings[locale];
  const dateLocale = locale === "es" ? "es-DO" : "en-US";
  const generatedDate = new Date().toLocaleString(dateLocale, {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.headerTitle}>{s.reportTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.vehicleInfo}</Text>
          <View style={styles.vehicleInfoGrid}>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>{s.make}</Text>
              <Text style={styles.vehicleInfoValue}>{vehicle.make}</Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>{s.model}</Text>
              <Text style={styles.vehicleInfoValue}>{vehicle.model}</Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>{s.year}</Text>
              <Text style={styles.vehicleInfoValue}>{vehicle.year}</Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>{s.currentMileage}</Text>
              <Text style={styles.vehicleInfoValue}>
                {vehicle.currentMileage.toLocaleString()} {s.miles}
              </Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>{s.vin}</Text>
              <Text style={styles.vehicleInfoValue}>
                {vehicle.vin || s.notProvided}
              </Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>{s.licensePlate}</Text>
              <Text style={styles.vehicleInfoValue}>
                {vehicle.licensePlate || s.notSet}
              </Text>
            </View>
            <View style={styles.vehicleInfoItem}>
              <Text style={styles.vehicleInfoLabel}>{s.nickname}</Text>
              <Text style={styles.vehicleInfoValue}>
                {vehicle.nickname || s.notSet}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.reportSummary}</Text>
          {summary.lastMaintenance ? (
            <Text style={styles.summaryText}>
              {s.lastMaintenance}:{" "}
              {new Date(summary.lastMaintenance.date).toLocaleDateString(dateLocale)} -{" "}
              {summary.lastMaintenance.serviceType} {s.at}{" "}
              {summary.lastMaintenance.mileage.toLocaleString()} {s.miles}
            </Text>
          ) : (
            <Text style={styles.summaryText}>{s.noMaintenanceAvailable}</Text>
          )}
          {summary.nextReminder && (
            <Text style={styles.summaryText}>
              {s.nextDue}: {summary.nextReminder.title}
              {summary.nextReminder.dueDate &&
                ` ${s.on} ${new Date(summary.nextReminder.dueDate).toLocaleDateString(dateLocale)}`}
              {summary.nextReminder.dueMileage &&
                ` ${s.at} ${summary.nextReminder.dueMileage.toLocaleString()} ${s.miles}`}
            </Text>
          )}
          {summary.totalCost !== null && summary.totalCost !== undefined && (
            <Text style={styles.summaryText}>
              {s.totalCost}: ${summary.totalCost.toLocaleString()}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.maintenanceHistory}</Text>
          {maintenanceHistory.length === 0 ? (
            <Text style={styles.noData}>{s.noRecords}</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colDate]}>{s.date}</Text>
                <Text style={[styles.tableHeaderCell, styles.colService]}>
                  {s.serviceType}
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colMileage]}>
                  {s.mileage}
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colNotes]}>{s.notes}</Text>
              </View>
              {maintenanceHistory.map((record, index) => (
                <View
                  key={index}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={[styles.tableCell, styles.colDate]}>
                    {new Date(record.date).toLocaleDateString(dateLocale)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colService]}>
                    {record.serviceType}
                  </Text>
                  <Text style={[styles.tableCell, styles.colMileage]}>
                    {record.mileage.toLocaleString()} {s.mi}
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
            {s.footerBrand}
          </Text>
          <Text style={styles.footerText}>
            {s.confidential}
          </Text>
          <Text style={styles.footerText}>
            {s.reportGenerated} {generatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
