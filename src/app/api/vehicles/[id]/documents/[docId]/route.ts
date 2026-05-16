import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const doc = await prisma.vehicleDocument.findFirst({
    where: { id: params.docId, vehicleId: params.id },
  });

  if (!doc) {
    return new NextResponse("Not found", { status: 404 });
  }

  const s3Key = doc.fileUrl.split(".amazonaws.com/")[1];
  if (!s3Key) {
    return NextResponse.redirect(doc.fileUrl);
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    ResponseContentDisposition: `inline; filename="${doc.name}"`,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return NextResponse.redirect(presignedUrl);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const doc = await prisma.vehicleDocument.findFirst({
    where: { id: params.docId, vehicleId: params.id },
  });

  if (!doc) {
    return new NextResponse("Not found", { status: 404 });
  }

  await prisma.vehicleDocument.delete({
    where: { id: params.docId },
  });

  return new NextResponse("Deleted", { status: 200 });
}
