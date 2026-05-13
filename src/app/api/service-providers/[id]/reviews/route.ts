import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/org";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: params.id },
    select: { id: true, organizationId: true },
  });

  if (!provider) {
    return new NextResponse("Provider not found", { status: 404 });
  }

  if (provider.organizationId) {
    const role = await getUserRole(provider.organizationId, session.user.id);
    if (!role) {
      return new NextResponse("Not a member", { status: 403 });
    }
  }

  const reviews = await prisma.serviceReview.findMany({
    where: { providerId: params.id },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: params.id },
    select: { id: true, organizationId: true },
  });

  if (!provider) {
    return new NextResponse("Provider not found", { status: 404 });
  }

  if (provider.organizationId) {
    const role = await getUserRole(provider.organizationId, session.user.id);
    if (!role) {
      return new NextResponse("Not a member", { status: 403 });
    }
  }

  const body = await request.json();
  const { rating, review } = body;

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return new NextResponse(
      JSON.stringify({ error: "Rating is required and must be between 1 and 5" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const existing = await prisma.serviceReview.findFirst({
    where: { providerId: params.id, userId: session.user.id },
  });

  if (existing) {
    return new NextResponse(
      JSON.stringify({ error: "You have already reviewed this provider" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const serviceReview = await prisma.serviceReview.create({
    data: {
      providerId: params.id,
      userId: session.user.id,
      rating,
      review: review || null,
    },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json(serviceReview);
}
