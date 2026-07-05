import crypto from "crypto";
import path from "path";

export interface WalletPassInput {
  docId: string;
  docType: string;
  docName: string;
  vehicleName: string;
  vin: string | null;
  expiryDate: Date | null;
  fileUrl: string;
  baseUrl: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  registration: "Registration",
  insurance: "Insurance",
  warranty: "Warranty",
  inspection: "Inspection",
  receipt: "Receipt",
};

/*
 * Apple Wallet (.pkpass) generation.
 *
 * Prerequisites:
 *   1. Apple Developer account ($99/yr)
 *   2. Create a Pass Type ID (e.g. pass.com.yourdomain.bitacora)
 *   3. Generate a Signer Certificate (.p12) from the Pass Type ID
 *   4. Download the Apple WWDR Intermediate Certificate
 *   5. Place both certificates in: certificates/apple/
 *       - signerCert.p12
 *       - wwdr.pem
 *   6. Set env: APPLE_PASS_TYPE_ID, APPLE_TEAM_ID
 */
export async function generateAppleWalletPass(input: WalletPassInput): Promise<Buffer> {
  const teamId = process.env.APPLE_TEAM_ID;
  const passTypeId = process.env.APPLE_PASS_TYPE_ID;

  if (!teamId || !passTypeId) {
    throw new Error(
      "Apple Wallet not configured. Set APPLE_TEAM_ID and APPLE_PASS_TYPE_ID env vars."
    );
  }

  const { PKPass } = await import("passkit-generator");

  const certsDir = path.join(process.cwd(), "certificates", "apple");

  const pass = await PKPass.from(
    {
      model: path.join(certsDir, "pass.pass") as unknown as Buffer,
      certificates: {
        signerCert: {
          path: path.join(certsDir, "signerCert.p12"),
          password: process.env.WALLET_PASS_CERT_PASSWORD || "",
        } as any,
        wwdr: path.join(certsDir, "wwdr.pem") as unknown as Buffer,
      },
    } as any,
    {
      serialNumber: input.docId.slice(0, 32),
      teamIdentifier: teamId,
      passTypeIdentifier: passTypeId,
      description: `${DOC_TYPE_LABELS[input.docType] || input.docType} — ${input.vehicleName}`,
      organizationName: "Bitácora",
      logoText: input.vehicleName.slice(0, 20),
      backgroundColor: getBgColor(input.docType),
      foregroundColor: "rgb(255, 255, 255)",
      labelColor: "rgb(200, 200, 200)",
      sharingProhibited: false,
      expirationDate: input.expiryDate?.toISOString(),
      voided: input.expiryDate && input.expiryDate < new Date() ? true : undefined,
      barcodes: input.fileUrl
        ? [
            {
              message: input.fileUrl,
              format: "PKBarcodeFormatQR" as any,
              altText: "Open Document",
            },
          ]
        : undefined,
    } as any
  );

  (pass as any).primaryFields = [
    {
      key: "docType",
      label: "Type",
      value: DOC_TYPE_LABELS[input.docType] || input.docType,
    },
  ];

  (pass as any).secondaryFields = [
    {
      key: "vehicle",
      label: "Vehicle",
      value: input.vehicleName,
    },
  ];

  const auxiliaryFields: Record<string, unknown>[] = [];
  if (input.vin) {
    auxiliaryFields.push({
      key: "vin",
      label: "VIN",
      value: input.vin.toUpperCase(),
    });
  }
  if (input.expiryDate) {
    auxiliaryFields.push({
      key: "expires",
      label: input.expiryDate < new Date() ? "Expired" : "Expires",
      value: input.expiryDate.toISOString(),
      dateStyle: "PKDateStyleShort",
      changeMessage: "Expires on %@",
    });
  }
  (pass as any).auxiliaryFields = auxiliaryFields;

  (pass as any).backFields = [
    {
      key: "docName",
      label: "Document",
      value: input.docName,
    },
  ];

  return (pass as any).generate() as Promise<Buffer>;
}

function getBgColor(type: string): string {
  const colors: Record<string, string> = {
    registration: "rgb(59, 130, 246)",
    insurance: "rgb(16, 185, 129)",
    warranty: "rgb(139, 92, 246)",
    inspection: "rgb(249, 115, 22)",
    receipt: "rgb(225, 29, 72)",
  };
  return colors[type] || "rgb(107, 114, 128)";
}
