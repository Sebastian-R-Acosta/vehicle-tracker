require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  // Check _prisma_migrations columns
  const cols = await p.$queryRawUnsafe(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '_prisma_migrations' ORDER BY ordinal_position"
  );
  console.log('_prisma_migrations columns:');
  cols.forEach(c => console.log('  ' + c.column_name + ': ' + c.data_type));

  // Check migration entries
  const rows = await p.$queryRawUnsafe("SELECT * FROM _prisma_migrations");
  console.log('\nMigration rows:');
  rows.forEach(r => console.log('  ' + JSON.stringify(r)));

  // Check what columns are missing from User table
  const userCols = await p.$queryRawUnsafe(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position"
  );
  console.log('\nUser columns:');
  userCols.forEach(c => console.log('  ' + c.column_name));

  await p.$disconnect();
})().catch(async (e) => {
  console.error('Error:', e.message);
  await p.$disconnect();
});
