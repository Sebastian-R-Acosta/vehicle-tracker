import type { WalletPassInput } from "./apple";

const DOC_TYPE_LABELS: Record<string, string> = {
  registration: "Registration",
  insurance: "Insurance",
  warranty: "Warranty",
  inspection: "Inspection",
  receipt: "Receipt",
};

/*
 * Google Wallet pass generation.
 *
 * Prerequisites:
 *   1. Google Cloud project with billing enabled
 *   2. Enable Google Wallet API
 *   3. Create a service account and download JSON key
 *   4. Set env: GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SERVICE_ACCOUNT
 */
export async function generateGoogleWalletPass(input: WalletPassInput): Promise<{ saveUrl: string }> {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const serviceAccountRaw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT;

  if (!issuerId || !serviceAccountRaw) {
    throw new Error(
      "Google Wallet not configured. Set GOOGLE_WALLET_ISSUER_ID and GOOGLE_WALLET_SERVICE_ACCOUNT env vars."
    );
  }

  const { google } = await import("googleapis");
  const serviceAccount = JSON.parse(serviceAccountRaw);

  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });

  const classId = `${issuerId}.vehicle_document`;
  const objectId = `${issuerId}.doc_${input.docId}`;

  const genericPass: Record<string, unknown> = {
    id: objectId,
    classId,
    state: "ACTIVE",
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: getBgColor(input.docType),
    cardTitle: {
      defaultValue: {
        language: "en",
        value: DOC_TYPE_LABELS[input.docType] || input.docType,
      },
    },
    subheader: {
      defaultValue: {
        language: "en",
        value: input.vehicleName,
      },
    },
    header: {
      defaultValue: {
        language: "en",
        value: "Bitácora",
      },
    },
    barcode: input.fileUrl
      ? {
          type: "QR_CODE",
          value: input.fileUrl,
          alternateText: "Open Document",
        }
      : undefined,
    textModulesData: [
      { id: "vehicle", header: "Vehicle", body: input.vehicleName },
      ...(input.vin
        ? [{ id: "vin", header: "VIN", body: input.vin.toUpperCase() }]
        : []),
      { id: "document", header: "Document", body: input.docName },
    ],
    linksModuleData: {
      uris: [
        {
          uri: `${input.baseUrl}/dashboard/vehicles/${input.docId}/documents`,
          description: "View in Bitácora",
        },
      ],
    },
  };

  if (input.expiryDate) {
    genericPass.validTimeInterval = {
      end: {
        date: input.expiryDate.toISOString().split("T")[0],
      },
    };
  }

  const wallet = google.walletobjects("v1");

  try {
    await wallet.genericclass.get({ resourceId: classId, auth } as any);
  } catch {
    await wallet.genericclass.insert({
      requestBody: {
        id: classId,
        classTemplateInfo: {
          cardTemplateOverride: {
            cardRowTemplateInfos: [
              {
                twoItems: {
                  startItem: { firstValue: {} },
                  endItem: { firstValue: {} },
                },
              },
            ],
          },
        },
      },
      auth,
    } as any);
  }

  try {
    await wallet.genericobject.get({ resourceId: objectId, auth } as any);
  } catch {
    await wallet.genericobject.insert({
      requestBody: genericPass,
      auth,
    } as any);
  }

  return {
    saveUrl: `https://pay.google.com/gp/v/save/${objectId}`,
  };
}

function getBgColor(type: string): string {
  const colors: Record<string, string> = {
    registration: "#3B82F6",
    insurance: "#10B981",
    warranty: "#8B5CF6",
    inspection: "#F97316",
    receipt: "#E11D48",
  };
  return colors[type] || "#6B7280";
}
