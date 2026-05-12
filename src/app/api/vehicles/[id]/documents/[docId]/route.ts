import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
