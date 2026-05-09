import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <DashboardNav />
      {children}
    </div>
  );
}
