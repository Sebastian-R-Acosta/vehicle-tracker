import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWorkshopContext } from "@/lib/workshop";

const CUSTOMER_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  documentId: true,
} as const;

/**
 * Look a customer up by cedula, phone or email.
 *
 * Deliberately exact-match only: partial/name search across the whole User table would
 * let any workshop enumerate every account in the system.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const ctx = await getWorkshopContext(session.user.id, session.user.currentOrganizationId);
  if (!ctx) {
    return new NextResponse("Not a workshop operator", { status: 403 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing search term" }, { status: 400 });
  }

  const customer = await prisma.user.findFirst({
    where: {
      OR: [{ documentId: q }, { phone: q }, { email: q.toLowerCase() }],
    },
    select: {
      ...CUSTOMER_FIELDS,
      vehicles: {
        select: { id: true, make: true, model: true, year: true, licensePlate: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({ found: !!customer, customer });
}

/** Register a new customer. The account has no password until they set one themselves. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const ctx = await getWorkshopContext(session.user.id, session.user.currentOrganizationId);
  if (!ctx) {
    return new NextResponse("Not a workshop operator", { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, email, phone, documentId } = body as Record<string, string | undefined>;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const emailLower = email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailLower },
        ...(documentId?.trim() ? [{ documentId: documentId.trim() }] : []),
      ],
    },
    select: CUSTOMER_FIELDS,
  });

  if (existing) {
    // Not an error for the operator: this is the "customer already exists" branch of
    // the flow, so hand the record back instead of failing.
    return NextResponse.json({ created: false, customer: existing });
  }

  try {
    const customer = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailLower,
        phone: phone?.trim() || null,
        documentId: documentId?.trim() || null,
        onboardingCompleted: false,
      },
      select: CUSTOMER_FIELDS,
    });

    const freePlan = await prisma.subscriptionPlan.findUnique({ where: { tier: "free" } });
    if (freePlan) {
      await prisma.subscription.create({
        data: { userId: customer.id, planId: freePlan.id, status: "active" },
      });
    }

    return NextResponse.json({ created: true, customer });
  } catch (error) {
    console.error("[workshop] Could not create customer:", error);
    return NextResponse.json({ error: "Could not create customer" }, { status: 500 });
  }
}
