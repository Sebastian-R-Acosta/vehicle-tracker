import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const makeDepreciation: Record<string, number> = {
  toyota: 0.12, honda: 0.13, subaru: 0.14, mazda: 0.15,
  nissan: 0.16, ford: 0.17, chevrolet: 0.18, hyundai: 0.16,
  kia: 0.17, bmw: 0.20, mercedes: 0.22, audi: 0.21,
  volkswagen: 0.18, lexus: 0.14, acura: 0.16, dodge: 0.19,
  jeep: 0.17, gmc: 0.16, ram: 0.17, chrysler: 0.20,
  buick: 0.18, cadillac: 0.25, lincoln: 0.24, tesla: 0.10,
};

const conditionMultiplier: Record<string, number> = {
  excellent: 1.1, good: 1.0, fair: 0.85, poor: 0.65,
};

function estimateValue(
  make: string,
  year: number,
  mileage: number,
  maintenanceCount: number,
  status: string
) {
  const basePrice = 35000;
  const age = new Date().getFullYear() - year;
  const makeKey = make.toLowerCase();

  const depRate = makeDepreciation[makeKey] || 0.18;
  const afterDep = basePrice * Math.pow(1 - depRate, age);

  const milesDiscount = Math.min(mileage / 15000 * 0.15, 0.25);
  const maintenanceBonus = Math.min(maintenanceCount * 0.02, 0.15);
  const condition = status === "active" ? "good" : status === "maintenance" ? "fair" : "poor";
  const condMult = conditionMultiplier[condition] || 1.0;

  const estimatedValue = afterDep * (1 - milesDiscount + maintenanceBonus) * condMult;

  return {
    estimatedValue: Math.max(Math.round(estimatedValue / 500) * 500, 1000),
    depreciationRate: depRate,
    age,
    milesDiscount,
    maintenanceBonus,
    conditionFactor: condMult,
  };
}

function getMarketRating(estimatedValue: number, basePrice: number, age: number): string {
  const pctOfOriginal = estimatedValue / basePrice;
  if (age <= 3 && pctOfOriginal > 0.65) return "Above Average";
  if (age <= 7 && pctOfOriginal > 0.40) return "Average";
  return "Below Average";
}

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
    include: {
      maintenanceRecords: { orderBy: { date: "desc" } },
    },
  });

  if (!vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isOwner = vehicle.userId === session.user.id;
  const isOrgMember = vehicle.organizationId
    ? !!(await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: vehicle.organizationId,
            userId: session.user.id,
          },
        },
      }))
    : false;

  if (!isOwner && !isOrgMember) {
    return new NextResponse("Not found", { status: 404 });
  }

  const maintenanceCount = vehicle.maintenanceRecords.length;
  const lastService = vehicle.maintenanceRecords[0] || null;

  const estimate = estimateValue(
    vehicle.make,
    vehicle.year,
    vehicle.currentMileage,
    maintenanceCount,
    vehicle.status
  );

  const report = {
    vehicle: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.currentMileage,
      vin: vehicle.vin,
      nickname: vehicle.nickname,
    },
    estimatedValue: estimate.estimatedValue,
    valueRange: {
      low: Math.round(estimate.estimatedValue * 0.9 / 500) * 500,
      high: Math.round(estimate.estimatedValue * 1.15 / 500) * 500,
    },
    marketRating: getMarketRating(estimate.estimatedValue, 35000, estimate.age),
    depreciation: {
      annualRate: Math.round(estimate.depreciationRate * 100),
      age: estimate.age,
      milesDiscount: Math.round(estimate.milesDiscount * 100),
    },
    maintenance: {
      totalRecords: maintenanceCount,
      bonus: Math.round(estimate.maintenanceBonus * 100),
      lastServiceDate: lastService ? lastService.date : null,
      lastServiceType: lastService ? lastService.serviceType : null,
    },
    factors: [
      {
        name: "Vehicle Age",
        impact: estimate.age <= 3 ? "positive" : estimate.age <= 8 ? "neutral" : "negative",
        detail: `${estimate.age} years old`,
      },
      {
        name: "Mileage",
        impact: vehicle.currentMileage < 60000 ? "positive" : vehicle.currentMileage < 120000 ? "neutral" : "negative",
        detail: `${vehicle.currentMileage.toLocaleString()} miles`,
      },
      {
        name: "Service History",
        impact: maintenanceCount >= 5 ? "positive" : maintenanceCount >= 2 ? "neutral" : "negative",
        detail: `${maintenanceCount} service records`,
      },
      {
        name: "Make Reliability",
        impact: (estimate.depreciationRate * 100) <= 15 ? "positive" : (estimate.depreciationRate * 100) <= 20 ? "neutral" : "negative",
        detail: `${vehicle.make}`,
      },
    ],
  };

  return NextResponse.json(report);
}
