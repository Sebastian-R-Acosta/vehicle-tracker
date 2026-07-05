import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-2";

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { imageBase64, side } = body;

    if (!imageBase64 || !side || !["front", "back"].includes(side)) {
      return new NextResponse("Invalid request. Need imageBase64 and side ('front'|'back')", { status: 400 });
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const key = `licenses/${session.user.id}/${side}-${Date.now()}.jpg`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    });

    await s3Client.send(command);

    const bucket = process.env.AWS_S3_BUCKET!;
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    const field = side === "front" ? "licenseImageFront" : "licenseImageBack";
    await prisma.user.update({
      where: { id: session.user.id },
      data: { [field]: publicUrl },
    });

    return NextResponse.json({ imageUrl: publicUrl, key });
  } catch (error) {
    console.error("License image upload error:", error);
    return new NextResponse(`Error uploading image: ${error}`, { status: 500 });
  }
}
