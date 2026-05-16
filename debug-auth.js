const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  // Test bcrypt hash on a known password to verify bcryptjs works
  const testHash = await bcrypt.hash("testpassword123", 12);
  const testCompare = await bcrypt.compare("testpassword123", testHash);
  console.log("bcryptjs self-test:", testCompare ? "PASS" : "FAIL");

  for (const user of users) {
    console.log(`\nUser: ${user.email}`);
    console.log(`  Hash prefix: ${user.passwordHash?.substring(0, 7)}`);
    // Try common passwords
    for (const pw of ["password", "password123", "admin123", "test123", "12345678"]) {
      const match = await bcrypt.compare(pw, user.passwordHash);
      if (match) console.log(`  COMMON PASSWORD MATCH: ${pw}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
