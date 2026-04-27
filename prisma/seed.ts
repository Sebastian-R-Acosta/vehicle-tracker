import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@vehicle-tracker.local' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'demo@vehicle-tracker.local',
      passwordHash: hashedPassword,
      name: 'Demo User',
    },
  });

  const vehicles = [
    { make: 'Toyota', model: 'Camry', year: 2022, nickname: 'Daily Driver', currentMileage: 25000 },
    { make: 'Honda', model: 'Civic', year: 2020, nickname: 'Weekend Car', currentMileage: 15000 },
    { make: 'Ford', model: 'F-150', year: 2021, nickname: 'Work Truck', currentMileage: 45000 },
  ];

  for (const v of vehicles) {
    const vehicle = await prisma.vehicle.create({
      data: { ...v, userId: user.id },
    });

    await prisma.maintenanceRecord.createMany({
      data: [
        { vehicleId: vehicle.id, date: new Date('2024-01-15'), serviceType: 'Oil Change', mileage: 20000, notes: 'Synthetic oil', cost: 75 },
        { vehicleId: vehicle.id, date: new Date('2024-04-10'), serviceType: 'Tire Rotation', mileage: 23000, notes: 'All good', cost: 50 },
        { vehicleId: vehicle.id, date: new Date('2025-01-20'), serviceType: 'Oil Change', mileage: 25000, notes: 'Full service', cost: 85 },
      ],
    });

    await prisma.reminder.create({
      data: {
        vehicleId: vehicle.id,
        userId: user.id,
        title: 'Next Oil Change',
        dueMileage: 30000,
      },
    });
  }

  const recommendations = [
    { serviceType: 'Oil Change', recommendedMiles: 5000, recommendedMonths: 6 },
    { serviceType: 'Tire Rotation', recommendedMiles: 7500, recommendedMonths: 6 },
    { serviceType: 'Brake Service', recommendedMiles: 30000, recommendedMonths: 24 },
    { serviceType: 'Air Filter', recommendedMiles: 15000, recommendedMonths: 12 },
    { serviceType: 'Transmission Service', recommendedMiles: 60000, recommendedMonths: 48 },
    { serviceType: 'Battery Replacement', recommendedMiles: 50000, recommendedMonths: 48 },
    { serviceType: 'Inspection', recommendedMiles: 12000, recommendedMonths: 12 },
  ];

  for (const rec of recommendations) {
    await prisma.serviceRecommendation.upsert({
      where: { serviceType: rec.serviceType },
      update: rec,
      create: rec,
    });
  }

  console.log('Demo user created:');
  console.log('  Email: demo@vehicle-tracker.local');
  console.log('  Password: demo123');
  console.log('Service recommendations seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());