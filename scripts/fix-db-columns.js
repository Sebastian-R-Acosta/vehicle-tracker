require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  // Add missing columns from migration 20260723000002
  try {
    await p.$executeRawUnsafe('ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "lastNotifiedAt" TIMESTAMP(3)');
    console.log('Reminder.lastNotifiedAt added');
  } catch (e) {
    console.log('Reminder.lastNotifiedAt:', e.message);
  }

  try {
    await p.$executeRawUnsafe('ALTER TABLE "VehicleDocument" ADD COLUMN IF NOT EXISTS "lastNotifiedAt" TIMESTAMP(3)');
    console.log('VehicleDocument.lastNotifiedAt added');
  } catch (e) {
    console.log('VehicleDocument.lastNotifiedAt:', e.message);
  }

  // Verify
  const cols = await p.$queryRawUnsafe(
    "SELECT table_name, column_name FROM information_schema.columns WHERE column_name = 'lastNotifiedAt' ORDER BY table_name"
  );
  console.log('\nlastNotifiedAt columns now:');
  cols.forEach(c => console.log('  ' + c.table_name + '.' + c.column_name));

  await p.$disconnect();
})().catch(async (e) => {
  console.error('Error:', e.message);
  await p.$disconnect();
});
