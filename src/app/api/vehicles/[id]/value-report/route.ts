import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DOP_RATE = 60;

const makeDepreciationDR: Record<string, number> = {
  toyota: 0.08, honda: 0.11, subaru: 0.12, mazda: 0.13,
  nissan: 0.14, ford: 0.15, chevrolet: 0.15, hyundai: 0.13,
  kia: 0.14, bmw: 0.20, mercedes: 0.21, audi: 0.20,
  volkswagen: 0.16, lexus: 0.10, acura: 0.13, dodge: 0.17,
  jeep: 0.14, gmc: 0.15, ram: 0.15, chrysler: 0.18,
  suzuki: 0.12, mitsubishi: 0.13, isuzu: 0.11,
};

const modelBonusDR: Record<string, number> = {
  "prado": 1.35, "hilux": 1.30, "land cruiser": 1.40, "fortuner": 1.25,
  "rav4": 1.10, "corolla": 1.08, "camry": 1.07, "4runner": 1.20,
  "tacoma": 1.22, "tundra": 1.15, "civic": 1.05, "cr-v": 1.08,
  "pajero": 1.15, "montero": 1.15, "l200": 1.18, "d-max": 1.15,
  "santa fe": 1.05, "tucson": 1.04, "sportage": 1.04,
  "sentra": 1.02, "versa": 1.01, "march": 0.98,
  "maverick": 1.12, "bronco": 1.15, "wrangler": 1.18,
};

const makeBasePriceDR: Record<string, number> = {
  toyota: 32000, honda: 28000, subaru: 30000, mazda: 27000,
  nissan: 25000, ford: 28000, chevrolet: 26000, hyundai: 24000,
  kia: 24000, bmw: 45000, mercedes: 50000, audi: 48000,
  volkswagen: 30000, lexus: 48000, acura: 35000, dodge: 30000,
  jeep: 32000, gmc: 35000, ram: 38000, chrysler: 32000,
  suzuki: 22000, mitsubishi: 25000, isuzu: 28000,
};

const modelBasePriceOverride: Record<string, number> = {
  "prado": 55000, "hilux": 38000, "land cruiser": 65000, "fortuner": 42000,
  "rav4": 33000, "corolla": 25000, "camry": 28000, "4runner": 45000,
  "tacoma": 40000, "tundra": 48000, "civic": 26000, "cr-v": 30000,
  "pajero": 35000, "montero": 35000, "l200": 32000, "d-max": 30000,
  "maverick": 32000, "bronco": 40000, "wrangler": 42000,
};

function estimateValueDR(
  make: string,
  model: string,
  year: number,
  mileageKm: number,
  maintenanceCount: number,
  status: string
) {
  const makeKey = make.toLowerCase();
  const modelKey = model.toLowerCase();

  const basePriceUSD = modelBasePriceOverride[modelKey]
    || (makeBasePriceDR[makeKey] || 28000) * (modelBonusDR[modelKey] || 1.0);

  const age = new Date().getFullYear() - year;
  const depRate = makeDepreciationDR[makeKey] || 0.15;
  const afterDep = basePriceUSD * Math.pow(1 - depRate, age);

  const kmDiscount = Math.min((mileageKm / 200000) * 0.20, 0.30);
  const maintenanceBonus = Math.min(maintenanceCount * 0.025, 0.15);
  const condition = status === "active" ? "good" : status === "maintenance" ? "fair" : "poor";
  const condMult = condition === "good" ? 1.05 : condition === "fair" ? 0.90 : 0.70;

  const estimatedUSD = afterDep * (1 - kmDiscount + maintenanceBonus) * condMult;
  const estimatedDOP = Math.round(estimatedUSD * DOP_RATE / 1000) * 1000;

  return {
    estimatedValueDOP: Math.max(estimatedDOP, 150000),
    estimatedValueUSD: Math.max(Math.round(estimatedUSD / 500) * 500, 2500),
    depreciationRate: depRate,
    age,
    kmDiscount,
    maintenanceBonus,
    conditionFactor: condMult,
    basePriceUSD,
    modelMultiplier: modelBonusDR[modelKey] || 1.0,
  };
}

function getMarketRatingDR(age: number, pctOfOriginal: number): string {
  if (age <= 3 && pctOfOriginal > 0.70) return "Excelente";
  if (age <= 5 && pctOfOriginal > 0.55) return "Bueno";
  if (age <= 8 && pctOfOriginal > 0.35) return "Promedio";
  return "Por debajo del promedio";
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

  const mileageKm = vehicle.currentMileage;

  const estimate = estimateValueDR(
    vehicle.make,
    vehicle.model,
    vehicle.year,
    mileageKm,
    maintenanceCount,
    vehicle.status
  );

  const pctOfOriginal = estimate.estimatedValueUSD / estimate.basePriceUSD;

  const report = {
    vehicle: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      mileage: mileageKm,
      vin: vehicle.vin,
      nickname: vehicle.nickname,
    },
    estimatedValue: estimate.estimatedValueDOP,
    estimatedValueUSD: estimate.estimatedValueUSD,
    valueRange: {
      low: Math.round(estimate.estimatedValueDOP * 0.88 / 5000) * 5000,
      high: Math.round(estimate.estimatedValueDOP * 1.15 / 5000) * 5000,
    },
    marketRating: getMarketRatingDR(estimate.age, pctOfOriginal),
    depreciation: {
      annualRate: Math.round(estimate.depreciationRate * 100),
      age: estimate.age,
      kmDiscount: Math.round(estimate.kmDiscount * 100),
    },
    maintenance: {
      totalRecords: maintenanceCount,
      bonus: Math.round(estimate.maintenanceBonus * 100),
      lastServiceDate: lastService ? lastService.date : null,
      lastServiceType: lastService ? lastService.serviceType : null,
    },
    factors: [
      {
        name: "Antigüedad del vehículo",
        impact: estimate.age <= 3 ? "positive" as const : estimate.age <= 7 ? "neutral" as const : "negative" as const,
        detail: `${estimate.age} años`,
      },
      {
        name: "Kilometraje",
        impact: mileageKm < 80000 ? "positive" as const : mileageKm < 160000 ? "neutral" as const : "negative" as const,
        detail: `${mileageKm.toLocaleString()} km`,
      },
      {
        name: "Historial de servicio",
        impact: maintenanceCount >= 5 ? "positive" as const : maintenanceCount >= 2 ? "neutral" as const : "negative" as const,
        detail: `${maintenanceCount} registros de servicio`,
      },
      {
        name: "Marca y modelo",
        impact: (estimate.modelMultiplier >= 1.20) ? "positive" as const : (estimate.modelMultiplier >= 1.0) ? "neutral" as const : "negative" as const,
        detail: `${vehicle.make} ${vehicle.model}`,
      },
    ],
  };

  return NextResponse.json(report);
}
