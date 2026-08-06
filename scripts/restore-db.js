const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Connected to database. Checking state...');

  // Check existing tables
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log('Tables:', tables.map(t => t.table_name).join(', '));

  // Check existing data counts
  try {
    const userCount = await prisma.user.count();
    console.log('Users:', userCount);
  } catch (e) {
    console.log('Users table missing or empty');
  }

  try {
    const planCount = await prisma.subscriptionPlan.count();
    console.log('Plans:', planCount);
  } catch (e) {
    console.log('Plans table missing or empty');
  }

  // Seed subscription plans
  const plans = [
    { id: 'plan_free', tier: 'free', name: 'Free', price: 0, maxVehicles: 2, features: ['2 vehicles','Maintenance logging','Smart reminders','Document storage','Basic reports'] },
    { id: 'plan_pro', tier: 'pro', name: 'Pro', price: 9.99, maxVehicles: 999, features: ['Unlimited vehicles','Advanced reports','Priority support','Export data','AI-powered insights'] },
    { id: 'plan_business', tier: 'business', name: 'Business', price: 29.99, maxVehicles: 999, features: ['Everything in Pro','Team management','Multi-location','API access','Custom branding'] },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { tier: plan.tier },
      update: { name: plan.name, price: plan.price, maxVehicles: plan.maxVehicles, features: plan.features },
      create: plan,
    });
  }
  console.log('Plans seeded.');

  // Create superAdmin user — credentials come from the environment so they never
  // sit in the repo: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/restore-db.js
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { superAdmin: true, role: 'admin' } });
    console.log('User exists — promoted to superAdmin:', email);
  } else {
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, name: process.env.ADMIN_NAME || null, superAdmin: true, role: 'admin', onboardingCompleted: false },
    });

    const freePlan = await prisma.subscriptionPlan.findUnique({ where: { tier: 'free' } });
    if (freePlan) {
      await prisma.subscription.create({ data: { userId: user.id, planId: freePlan.id, status: 'active' } });
    }
    console.log('User created:', email);
  }

  console.log('DONE');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
