import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
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
    const { imageBase64, filename, contentType } = body;

    if (!imageBase64) {
      return new NextResponse("No image provided", { status: 400 });
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const key = `maintenance/${session.user.id}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const bucket = process.env.AWS_S3_BUCKET!;
    const region = process.env.AWS_REGION || "us-east-1";
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ imageUrl: publicUrl, key });
  } catch (error) {
    console.error("Image upload error:", error);
    return new NextResponse(`Error uploading image: ${error}`, { status: 500 });
  }
}