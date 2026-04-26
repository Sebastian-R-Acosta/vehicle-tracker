import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    
    return NextResponse.json({
      status: "ok",
      userCount: count,
      users: users
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({
      status: "error",
      error: String(error)
    }, { status: 500 });
  }
}