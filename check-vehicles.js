const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.vehicle.findMany({ include: { maintenanceRecords: true, reminders: true } }).then(r => {
  console.log(JSON.stringify(r, null, 2));
  prisma.$disconnect();
}).catch(e => {
  console.error(e.message);
  prisma.$disconnect();
});
