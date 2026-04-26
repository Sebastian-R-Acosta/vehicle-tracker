const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function test() {
  console.log("Testing connection...");
  try {
    const count = await prisma.user.count();
    console.log("Connection OK! User count:", count);
  } catch (error) {
    console.log("Connection error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();