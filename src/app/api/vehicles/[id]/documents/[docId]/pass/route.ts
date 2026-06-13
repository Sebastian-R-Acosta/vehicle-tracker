import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAppleWalletPass, generateGoogleWalletPass } from "@/lib/wallet";

export async function POST(
  request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const platform: string = body.platform || "apple";

  const doc = await prisma.vehicleDocument.findFirst({
    where: { id: params.docId, vehicleId: params.id },
    include: { vehicle: true },
  });

  if (!doc) {
    return new NextResponse("Not found", { status: 404 });
  }

  const vehicle = doc.vehicle;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.nickname ? ` (${vehicle.nickname})` : ""}`;

  try {
    if (platform === "google") {
      const result = await generateGoogleWalletPass({
        docId: doc.id,
        docType: doc.type,
        docName: doc.name,
        vehicleName,
        vin: vehicle.vin,
        expiryDate: doc.expiryDate,
        fileUrl: doc.fileUrl,
        baseUrl,
      });
      return NextResponse.json(result);
    }

    const passBuffer = await generateAppleWalletPass({
      docId: doc.id,
      docType: doc.type,
      docName: doc.name,
      vehicleName,
      vin: vehicle.vin,
      expiryDate: doc.expiryDate,
      fileUrl: doc.fileUrl,
      baseUrl,
    });

    return new NextResponse(new Uint8Array(passBuffer), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${doc.name.replace(/[^a-zA-Z0-9]/g, "_")}.pkpass"`,
        "Content-Length": String(passBuffer.length),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Wallet pass generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
