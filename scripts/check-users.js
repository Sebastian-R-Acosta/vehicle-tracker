const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.user.findMany({ select: { id: true, email: true, name: true, passwordHash: true } }).then(r => {
  console.log(JSON.stringify(r.map(u => ({ ...u, passwordHash: u.passwordHash ? u.passwordHash.substring(0, 20) + '...' : null })), null, 2));
  prisma.$disconnect();
}).catch(e => {
  console.error(e.message);
  prisma.$disconnect();
});
