const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.user.deleteMany({ where: { email: "testlogin@test.com" } }).then(r => {
  console.log("Deleted:", r.count);
  prisma.$disconnect();
});
