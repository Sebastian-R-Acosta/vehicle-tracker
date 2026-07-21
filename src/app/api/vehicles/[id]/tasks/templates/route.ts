import { NextResponse } from "next/server";
import { BUILD_TEMPLATES } from "@/lib/task-priority";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const summaries = BUILD_TEMPLATES.map(({ id, name, description }) => ({ id, name, description }));
  return NextResponse.json({ templates: summaries });
}
