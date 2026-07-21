import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requirePro } from "@/lib/billing";
import { getAccessibleVehicle } from "@/lib/vehicle-access";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await getAccessibleVehicle(params.id, session.user.id);

  if (!vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const docs = await prisma.vehicleDocument.findMany({
    where: { vehicleId: params.id },
    orderBy: { createdAt: "desc" },
  });

  const docsWithUrls = await Promise.all(docs.map(async (doc) => {
    const s3Key = doc.fileUrl.split(".amazonaws.com/")[1];
    if (!s3Key) return { ...doc, signedUrl: null };

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 7200 });
      return { ...doc, signedUrl };
    } catch {
      return { ...doc, signedUrl: null };
    }
  }));

  return NextResponse.json(docsWithUrls);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { allowed, error } = await requirePro(session.user.id);
  if (!allowed) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const vehicle = await getAccessibleVehicle(params.id, session.user.id);

  if (!vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await request.json();
  const { name, type, fileUrl, fileSize, expiryDate, notes } = body;

  if (!name || !fileUrl) {
    return new NextResponse("Name and fileUrl are required", { status: 400 });
  }

  const doc = await prisma.vehicleDocument.create({
    data: {
      vehicleId: params.id,
      name,
      type: type || "other",
      fileUrl,
      fileSize: fileSize || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      notes: notes || null,
    },
  });

  return NextResponse.json(doc);
}
