import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardNav } from "./DashboardNav";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const headersList = headers();
  const pathname = headersList.get("next-url") || "";

  if (!pathname.includes("/dashboard/onboarding")) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true },
    });
    if (user && !user.onboardingCompleted) {
      redirect("/dashboard/onboarding");
    }
  }

  return (
    <div>
      <DashboardNav />
      {children}
    </div>
  );
}
