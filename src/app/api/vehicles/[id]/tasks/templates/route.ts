import { NextResponse } from "next/server";
import { BUILD_TEMPLATES } from "@/lib/task-priority";

export async function GET() {
  const summaries = BUILD_TEMPLATES.map(({ id, name, description }) => ({ id, name, description }));
  return NextResponse.json({ templates: summaries });
}
