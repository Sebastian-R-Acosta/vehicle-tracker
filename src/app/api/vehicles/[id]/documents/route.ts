import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: params.id },
  });

  if (!vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const docs = await prisma.vehicleDocument.findMany({
    where: { vehicleId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: params.id },
  });

  if (!vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await request.json();
  const { name, type, fileUrl, fileSize } = body;

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
    },
  });

  return NextResponse.json(doc);
}
