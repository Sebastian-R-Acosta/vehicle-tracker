import { NextResponse } from "next/server";
import { sendDemoRequestEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const { allowed } = await rateLimit(`contact:${ip}`, 3, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, company, phone, message } = body;

    if (!name || !email || !company) {
      return new NextResponse("Name, email, and company are required", { status: 400 });
    }

    const ownerEmail = process.env.FROM_EMAIL_ADDRESS;
    if (!ownerEmail) {
      console.error("FROM_EMAIL_ADDRESS not configured");
      return new NextResponse("Contact form not configured", { status: 500 });
    }

    const result = await sendDemoRequestEmail(ownerEmail, {
      name,
      email,
      company,
      phone: phone || "",
      message: message || "",
    });

    if (!result.success) {
      console.error("Failed to send demo request email:", result.error);
      return new NextResponse("Failed to send message", { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
