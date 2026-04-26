import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function test() {
  console.log("Testing database connection...");
  
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
    
    const count = await prisma.user.count();
    console.log("Users count:", count);
    
    const user = await prisma.user.findUnique({
      where: { email: "sebasort9pc@gmail.com" }
    });
    
    if (user) {
      console.log("✅ User found:", user.email);
      
      const isValid = await bcrypt.compare("Test123!", user.passwordHash || "");
      console.log("Password valid:", isValid);
    } else {
      console.log("❌ User not found, creating...");
      const hash = await bcrypt.hash("Test123!", 12);
      await prisma.user.create({
        data: {
          email: "sebasort9pc@gmail.com",
          passwordHash: hash,
          name: "Sebastian"
        }
      });
      console.log("✅ User created");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();