import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWorkshopContext, grantServiceAuthorization, normalizePlate } from "@/lib/workshop";

/**
 * Plate lookup, so the operator does not create a duplicate vehicle for a returning car.
 *
 * Owner details are withheld unless this workshop already holds an authorization —
 * otherwise any shop could turn a plate into a name and phone number.
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

  const plate = new URL(request.url).searchParams.get("plate")?.trim();
  if (!plate) {
    return NextResponse.json({ error: "Missing plate" }, { status: 400 });
  }

  // Plates are stored as typed ("A12-345" vs "a12345"), so try the raw and the
  // normalized form, both case-insensitively. Indexed lookups, no table scan.
  const normalized = normalizePlate(plate);
  const variants = Array.from(new Set([plate.trim(), normalized]));

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      OR: variants.map((value) => ({
        licensePlate: { equals: value, mode: "insensitive" as const },
      })),
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      licensePlate: true,
      currentMileage: true,
      userId: true,
      user: { select: { id: true, name: true, email: true, phone: true, documentId: true } },
      serviceAuthorizations: {
        where: { organizationId: ctx.organizationId },
        select: { status: true },
      },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ found: false, vehicle: null });
  }

  const authorized = vehicle.serviceAuthorizations.some((a) => a.status === "active");

  return NextResponse.json({
    found: true,
    authorized,
    vehicle: {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      currentMileage: vehicle.currentMileage,
      owner: authorized ? vehicle.user : null,
    },
  });
}

/** Register a vehicle for a customer and authorize this workshop to service it. */
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
  const { customerId, make, model, year, licensePlate, vin, currentMileage } = body as Record<
    string,
    string | number | undefined
  >;

  if (!customerId || !make || !model || !year) {
    return NextResponse.json(
      { error: "customerId, make, model and year are required" },
      { status: 400 }
    );
  }

  const customer = await prisma.user.findUnique({
    where: { id: String(customerId) },
    select: { id: true },
  });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: customer.id, // the customer owns it, not the workshop
        make: String(make).trim(),
        model: String(model).trim(),
        year: Number(year),
        licensePlate: licensePlate ? String(licensePlate).trim() : null,
        vin: vin ? String(vin).trim().toUpperCase() : null,
        currentMileage: currentMileage != null ? Number(currentMileage) : 0,
      },
    });

    await grantServiceAuthorization({
      vehicleId: vehicle.id,
      organizationId: ctx.organizationId,
      grantedByUserId: null,
    });

    return NextResponse.json(vehicle);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json({ error: "A vehicle with that VIN already exists" }, { status: 409 });
    }
    console.error("[workshop] Could not create vehicle:", error);
    return NextResponse.json({ error: "Could not create vehicle" }, { status: 500 });
  }
}
