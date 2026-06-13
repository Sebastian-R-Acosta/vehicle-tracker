import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
    });

    const s3Response = await s3Client.send(command);

    const body = await s3Response.Body?.transformToByteArray();
    if (!body) {
      return new NextResponse("Empty document", { status: 500 });
    }

    return new NextResponse(Buffer.from(body), {
      headers: {
        "Content-Type": s3Response.ContentType || "application/octet-stream",
        "Content-Length": String(s3Response.ContentLength || body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to fetch document from S3:", error);
    return new NextResponse("Failed to fetch document", { status: 500 });
  }
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

  const s3Key = doc.fileUrl.split(".amazonaws.com/")[1];
  if (s3Key) {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      });
      await s3Client.send(deleteCommand);
    } catch (err) {
      console.error("Failed to delete S3 object:", err);
    }
  }

  await prisma.vehicleDocument.delete({
    where: { id: params.docId },
  });

  return new NextResponse("Deleted", { status: 200 });
}
